import { CreateEventDto, UpdateEventDto } from '@app/common';
import { DatabaseService, events, tickets, users } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { and, eq, inArray, sql } from 'drizzle-orm';

@Injectable()
export class EventsServiceService implements OnModuleInit {
  constructor(
    @Inject(KAFKA_SERVICE) private readonly kafkClient: ClientKafka,
    private readonly dbService: DatabaseService,
  ) {}

  async onModuleInit() {
    // connect to kafka when module initializes
    await this.kafkClient.connect();
  }

  private isOrganizerRole(role?: string) {
    return role === 'ORGANIZER' || role === 'ADMIN';
  }

  private assertOrganizerRole(role: string, action: string) {
    if (!this.isOrganizerRole(role)) {
      throw new ForbiddenException(`Only organizers can ${action} events`);
    }
  }

  private getCityFromLocation(location: string) {
    const knownCities = [
      'Mumbai',
      'Bengaluru',
      'Delhi',
      'Pune',
      'Hyderabad',
      'Chennai',
      'Kolkata',
      'Ahmedabad',
      'Jaipur',
      'Goa',
    ];
    const matchedCity = knownCities.find((city) =>
      location.toLowerCase().includes(city.toLowerCase()),
    );

    if (matchedCity) return matchedCity;

    const segments = location
      .split(',')
      .map((segment) => segment.trim())
      .filter(Boolean);

    return segments.at(-1) || 'Mumbai';
  }

  private async getSoldTicketCount(eventId: string) {
    const [soldTickets] = await this.dbService.db
      .select({ total: sql<number>`COALESCE(SUM(${tickets.quantity}), 0)` })
      .from(tickets)
      .where(
        and(
          eq(tickets.eventId, eventId),
          inArray(tickets.status, ['CONFIRMED', 'CHECKED_IN']),
        ),
      );

    return Number(soldTickets?.total || 0);
  }

  private async withInventory<T extends { id: string; capacity: number }>(
    event: T,
  ) {
    const soldTickets = await this.getSoldTicketCount(event.id);
    const remainingCapacity = Math.max(event.capacity - soldTickets, 0);

    return {
      ...event,
      soldTickets,
      remainingCapacity,
    };
  }

  private async findBaseEvent(id: string) {
    const [event] = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async create(
    createEventDto: CreateEventDto,
    organizerId: string,
    userRole: string,
  ) {
    this.assertOrganizerRole(userRole, 'create');

    const [event] = await this.dbService.db
      .insert(events)
      .values({
        ...createEventDto,
        category: createEventDto.category?.trim() || 'Live shows',
        city:
          createEventDto.city?.trim() ||
          this.getCityFromLocation(createEventDto.location),
        date: new Date(createEventDto.date),
        price: createEventDto.price || 0,
        organizerId,
      })
      .returning();

    this.kafkClient.emit(KAFKA_TOPICS.EVENT_CREATED, {
      eventId: event.id,
      organizerId: event.organizerId,
      title: event.title,
      timestamp: new Date().toISOString(),
    });

    return event;
  }

  async findAll() {
    const publishedEvents = await this.dbService.db
      .select()
      .from(events)
      .where(eq(events.status, 'PUBLISHED'));

    return Promise.all(
      publishedEvents.map((event) => this.withInventory(event)),
    );
  }

  async findOne(id: string) {
    const event = await this.findBaseEvent(id);

    return this.withInventory(event);
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    userRole: string,
  ) {
    const event = await this.findBaseEvent(id);
    this.assertOrganizerRole(userRole, 'update');

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to update this event',
      );
    }

    const updatedData: Record<string, unknown> = { ...updateEventDto };
    if (updateEventDto.date) {
      updatedData.date = new Date(updateEventDto.date);
    }
    updatedData.updatedAt = new Date();

    const [updated] = await this.dbService.db
      .update(events)
      .set(updatedData)
      .where(eq(events.id, id))
      .returning();

    this.kafkClient.emit(KAFKA_TOPICS.EVENT_UPDATED, {
      eventId: updated.id,
      changes: Object.keys(updateEventDto),
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  async publish(id: string, userId: string, userRole: string) {
    const event = await this.findBaseEvent(id);
    this.assertOrganizerRole(userRole, 'publish');

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to publish this event',
      );
    }

    const [organizer] = await this.dbService.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, event.organizerId))
      .limit(1);

    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    const [published] = await this.dbService.db
      .update(events)
      .set({ status: 'PUBLISHED', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    this.kafkClient.emit(KAFKA_TOPICS.EVENT_PUBLISHED, {
      eventId: published.id,
      eventTitle: published.title,
      eventDate: published.date,
      eventLocation: published.location,
      organizerId: published.organizerId,
      organizerEmail: organizer.email,
      timestamp: new Date().toISOString(),
    });

    return published;
  }

  async cancel(id: string, userId: string, userRole: string) {
    const event = await this.findBaseEvent(id);
    this.assertOrganizerRole(userRole, 'cancel');

    if (event.organizerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You are not authorized to cancel this event',
      );
    }

    const [organizer] = await this.dbService.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, event.organizerId))
      .limit(1);

    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }

    const [cancelled] = await this.dbService.db
      .update(events)
      .set({ status: 'CANCELLED', updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();

    this.kafkClient.emit(KAFKA_TOPICS.EVENT_CANCELLED, {
      eventId: cancelled.id,
      eventTitle: cancelled.title,
      eventDate: cancelled.date,
      eventLocation: cancelled.location,
      organizerId: cancelled.organizerId,
      organizerEmail: organizer.email,
      timestamp: new Date().toISOString(),
    });

    return cancelled;
  }

  async findMyEvent(organizerId: string) {
    return this.dbService.db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId));
  }
}
