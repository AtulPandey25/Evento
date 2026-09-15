import { PurchaseTicketDto } from '@app/common';
import { DatabaseService, events, tickets, users } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomBytes } from 'crypto';
import { and, eq, inArray, sql } from 'drizzle-orm';

@Injectable()
export class TicketsServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkClient: ClientKafka,
    private readonly dbService: DatabaseService,
  ) {}

  async onModuleInit() {
    // connect to kafka when module initializes
    await this.kafkClient.connect();
  }

  private generateTicketCode(): string {
    return randomBytes(6).toString('hex').toUpperCase();
  }

  private isOrganizerRole(role?: string) {
    return role === 'ORGANIZER' || role === 'ADMIN';
  }

  async purchase(
    purchaseDto: PurchaseTicketDto,
    userId: string,
    userRole = 'USER',
  ) {
    if (userRole !== 'USER') {
      throw new ForbiddenException('Only customers can purchase tickets');
    }

    const { eventId, quantity } = purchaseDto;

    if (!Number.isInteger(quantity)) {
      throw new BadRequestException('Quantity must be an integer');
    }

    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    if (quantity > 10) {
      throw new BadRequestException('Quantity must be at most 10');
    }

    const [event] = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Event is not published');
    }

    const soldTickets = await this.dbService.db
      .select({ total: sql<number>`COALESCE(SUM(${tickets.quantity}), 0)` })
      .from(tickets)
      .where(
        and(
          eq(tickets.eventId, eventId),
          inArray(tickets.status, ['CONFIRMED', 'CHECKED_IN']),
        ),
      );

    const currentSold = Number(soldTickets[0]?.total || 0);
    const remaining = event.capacity - currentSold;

    if (quantity > remaining) {
      throw new BadRequestException(`Only ${remaining} tickets remaining`);
    }

    const [user] = await this.dbService.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalPrice = event.price * quantity;

    const [ticket] = await this.dbService.db
      .insert(tickets)
      .values({
        eventId,
        userId,
        quantity,
        totalPrice,
        ticketCode: this.generateTicketCode(),
        status: 'CONFIRMED',
      })
      .returning();

    this.kafkClient.emit(KAFKA_TOPICS.TICKET_PURCHASED, {
      ticketId: ticket.id,
      eventId: ticket.eventId,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      userId: ticket.userId,
      userEmail: user.email,
      quantity: ticket.quantity,
      totalPrice: ticket.totalPrice,
      ticketCode: ticket.ticketCode,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Ticket purchased successfully',
      ticket: {
        id: ticket.id,
        ticketCode: ticket.ticketCode,
        eventTitle: event.title,
        quantity: ticket.quantity,
        totalPrice: ticket.totalPrice,
        status: ticket.status,
        purchasedAt: ticket.purchasedAt,
      },
    };
  }

  async findMyTicket(userId: string) {
    const userTickets = await this.dbService.db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        quantity: tickets.quantity,
        totalPrice: tickets.totalPrice,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        checkedInAt: tickets.checkedInAt,
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.date,
        eventLocation: events.location,
      })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .where(eq(tickets.userId, userId));

    return userTickets;
  }

  async findOne(id: string, userId: string) {
    const [ticket] = await this.dbService.db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        quantity: tickets.quantity,
        totalPrice: tickets.totalPrice,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        checkedInAt: tickets.checkedInAt,
        userId: tickets.userId,
        eventId: events.id,
        eventTitle: events.title,
        eventDate: events.date,
        eventLocation: events.location,
      })
      .from(tickets)
      .innerJoin(events, eq(tickets.eventId, events.id))
      .where(and(eq(tickets.id, id), eq(tickets.userId, userId)))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('Ticket does not belong to user');
    }

    return ticket;
  }

  async cancel(id: string, userId: string) {
    const [ticket] = await this.dbService.db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('Ticket does not belong to user');
    }

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Ticket is already cancelled');
    }

    if (ticket.status === 'CHECKED_IN') {
      throw new BadRequestException('Ticket is already checked in');
    }

    const [user] = await this.dbService.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, ticket.userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [event] = await this.dbService.db
      .select({
        title: events.title,
        date: events.date,
        location: events.location,
      })
      .from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const [cancelled] = await this.dbService.db
      .update(tickets)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();

    this.kafkClient.emit(KAFKA_TOPICS.TICKET_CANCELLED, {
      ticketId: cancelled.id,
      eventId: cancelled.eventId,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      userId: cancelled.userId,
      userEmail: user.email,
      quantity: cancelled.quantity,
      totalPrice: cancelled.totalPrice,
      ticketCode: cancelled.ticketCode,
      timestamp: new Date().toISOString(),
    });

    return { message: 'Ticket cancelled successfully' };
  }

  async checkIn(ticketCode: string, organizerId: string, userRole: string) {
    if (!this.isOrganizerRole(userRole)) {
      throw new ForbiddenException('Only organizers can check in tickets');
    }

    const [ticket] = await this.dbService.db
      .select({
        id: tickets.id,
        status: tickets.status,
        eventId: tickets.eventId,
        ticketCode: tickets.ticketCode,
        quantity: tickets.quantity,
        userId: tickets.userId,
      })
      .from(tickets)
      .where(eq(tickets.ticketCode, ticketCode))
      .limit(1);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const [event] = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, ticket.eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== organizerId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view tickets for this event',
      );
    }

    if (ticket.status === 'CHECKED_IN') {
      throw new BadRequestException('Ticket is already checked in');
    }

    if (ticket.status === 'CANCELLED') {
      throw new BadRequestException('Ticket is already cancelled');
    }

    const [user] = await this.dbService.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, ticket.userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [checkedIn] = await this.dbService.db
      .update(tickets)
      .set({
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, ticket.id))
      .returning();

    this.kafkClient.emit(KAFKA_TOPICS.TICKET_CHECKED_IN, {
      ticketId: checkedIn.id,
      eventId: checkedIn.eventId,
      ticketCode: checkedIn.ticketCode,
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      userId: ticket.userId,
      userEmail: user.email,
      quantity: checkedIn.quantity,
      timestamp: new Date().toISOString(),
    });

    return {
      message: 'Ticket checked in successfully',
      ticket: {
        id: checkedIn.id,
        ticketCode: checkedIn.ticketCode,
        quantity: checkedIn.quantity,
        status: checkedIn.status,
        checkedInAt: checkedIn.checkedInAt,
      },
    };
  }

  async findEventTickets(
    eventId: string,
    organizerId: string,
    userRole: string,
  ) {
    if (!this.isOrganizerRole(userRole)) {
      throw new ForbiddenException('Only organizers can view event tickets');
    }

    const [event] = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== organizerId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to view tickets for this event',
      );
    }

    return this.dbService.db
      .select({
        id: tickets.id,
        ticketCode: tickets.ticketCode,
        quantity: tickets.quantity,
        totalPrice: tickets.totalPrice,
        status: tickets.status,
        purchasedAt: tickets.purchasedAt,
        checkedInAt: tickets.checkedInAt,
        userId: tickets.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(eq(tickets.eventId, eventId));
  }

  async cancelTicketsForEvent(data: {
    eventId: string;
    eventTitle?: string;
    eventDate?: string | Date;
    eventLocation?: string;
  }) {
    const ticketsToCancel = await this.dbService.db
      .select({
        id: tickets.id,
        eventId: tickets.eventId,
        userId: tickets.userId,
        userEmail: users.email,
        quantity: tickets.quantity,
        totalPrice: tickets.totalPrice,
        ticketCode: tickets.ticketCode,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .where(
        and(eq(tickets.eventId, data.eventId), eq(tickets.status, 'CONFIRMED')),
      );

    if (ticketsToCancel.length === 0) {
      return { cancelledTickets: 0 };
    }

    await this.dbService.db
      .update(tickets)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(
        and(eq(tickets.eventId, data.eventId), eq(tickets.status, 'CONFIRMED')),
      );

    ticketsToCancel.forEach((ticket) => {
      this.kafkClient.emit(KAFKA_TOPICS.TICKET_CANCELLED, {
        ticketId: ticket.id,
        eventId: ticket.eventId,
        eventTitle: data.eventTitle,
        eventDate: data.eventDate,
        eventLocation: data.eventLocation,
        userId: ticket.userId,
        userEmail: ticket.userEmail,
        quantity: ticket.quantity,
        totalPrice: ticket.totalPrice,
        ticketCode: ticket.ticketCode,
        cancellationReason: 'EVENT_CANCELLED',
        timestamp: new Date().toISOString(),
      });
    });

    return { cancelledTickets: ticketsToCancel.length };
  }
}
