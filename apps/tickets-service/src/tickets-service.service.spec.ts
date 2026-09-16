import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { KAFKA_TOPICS } from '@app/kafka';
import { TicketsServiceService } from './tickets-service.service';

const userId = 'user-1';
const eventId = 'event-1';

function createQuery<T>(rows: T[]) {
  const promise = Promise.resolve(rows);

  return {
    from: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(rows),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
}

function createEventCancellationService({
  ticketsToCancel = [
    {
      id: 'ticket-1',
      eventId,
      userId,
      userEmail: 'customer@example.com',
      quantity: 2,
      totalPrice: 10000,
      ticketCode: 'ABC123',
    },
    {
      id: 'ticket-2',
      eventId,
      userId: 'user-2',
      userEmail: 'second@example.com',
      quantity: 1,
      totalPrice: 5000,
      ticketCode: 'XYZ789',
    },
  ],
} = {}) {
  const emit = jest.fn();
  const select = jest.fn().mockReturnValueOnce(createQuery(ticketsToCancel));
  const updateSet = jest.fn().mockReturnThis();
  const updateWhere = jest.fn().mockResolvedValue(undefined);

  const dbService = {
    db: {
      select,
      update: jest.fn().mockReturnValue({
        set: updateSet,
        where: updateWhere,
      }),
    },
  };

  const service = new TicketsServiceService(
    { connect: jest.fn(), emit } as never,
    dbService as never,
  );

  return { dbService, emit, service, updateSet, updateWhere };
}

function createService({
  eventStatus = 'PUBLISHED',
  capacity = 10,
  sold = 2,
  userRows = [{ email: 'customer@example.com' }],
} = {}) {
  const emit = jest.fn();
  const insertValues = jest.fn().mockReturnValue({
    returning: jest.fn().mockResolvedValue([
      {
        id: 'ticket-1',
        eventId,
        userId,
        quantity: 3,
        totalPrice: 15000,
        ticketCode: 'ABC123',
        status: 'CONFIRMED',
        purchasedAt: new Date('2026-06-30T10:00:00.000Z'),
      },
    ]),
  });

  const select = jest
    .fn()
    .mockReturnValueOnce(
      createQuery([
        {
          id: eventId,
          title: 'Founders Night',
          date: new Date('2026-07-10T18:30:00.000Z'),
          location: 'Bengaluru Convention Hub',
          status: eventStatus,
          capacity,
          price: 5000,
        },
      ]),
    )
    .mockReturnValueOnce(createQuery([{ total: sold }]))
    .mockReturnValueOnce(createQuery(userRows));

  const dbService = {
    db: {
      select,
      insert: jest.fn().mockReturnValue({
        values: insertValues,
      }),
    },
  };

  const kafkaClient = {
    connect: jest.fn(),
    emit,
  };

  const service = new TicketsServiceService(
    kafkaClient as never,
    dbService as never,
  );

  return { dbService, emit, insertValues, service };
}

function createCheckInService({
  eventRows = [
    {
      id: eventId,
      title: 'Founders Night',
      date: new Date('2026-07-10T18:30:00.000Z'),
      location: 'Bengaluru Convention Hub',
      organizerId: 'organizer-1',
    },
  ],
  userRows = [{ email: 'customer@example.com' }],
} = {}) {
  const emit = jest.fn();
  const checkedInAt = new Date('2026-06-30T11:00:00.000Z');
  const updateReturning = jest.fn().mockResolvedValue([
    {
      id: 'ticket-1',
      eventId,
      ticketCode: 'ABC123',
      quantity: 2,
      status: 'CHECKED_IN',
      checkedInAt,
    },
  ]);

  const select = jest
    .fn()
    .mockReturnValueOnce(
      createQuery([
        {
          id: 'ticket-1',
          eventId,
          ticketCode: 'ABC123',
          status: 'CONFIRMED',
          quantity: 2,
          userId,
        },
      ]),
    )
    .mockReturnValueOnce(createQuery(eventRows))
    .mockReturnValueOnce(createQuery(userRows));

  const dbService = {
    db: {
      select,
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ returning: updateReturning }),
        }),
      }),
    },
  };

  const kafkaClient = {
    connect: jest.fn(),
    emit,
  };

  const service = new TicketsServiceService(
    kafkaClient as never,
    dbService as never,
  );

  return { dbService, emit, service };
}

function createCancelService({
  ticketStatus = 'CONFIRMED',
  ticketUserId = userId,
  userRows = [{ email: 'customer@example.com' }],
  eventRows = [
    {
      title: 'Founders Night',
      date: new Date('2026-07-10T18:30:00.000Z'),
      location: 'Bengaluru Convention Hub',
    },
  ],
} = {}) {
  const emit = jest.fn();
  const updateReturning = jest.fn().mockResolvedValue([
    {
      id: 'ticket-1',
      eventId,
      userId: ticketUserId,
      quantity: 2,
      totalPrice: 10000,
      ticketCode: 'ABC123',
      status: 'CANCELLED',
    },
  ]);

  const select = jest
    .fn()
    .mockReturnValueOnce(
      createQuery([
        {
          id: 'ticket-1',
          eventId,
          userId: ticketUserId,
          quantity: 2,
          totalPrice: 10000,
          ticketCode: 'ABC123',
          status: ticketStatus,
        },
      ]),
    )
    .mockReturnValueOnce(createQuery(userRows))
    .mockReturnValueOnce(createQuery(eventRows));

  const dbService = {
    db: {
      select,
      update: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({ returning: updateReturning }),
        }),
      }),
    },
  };

  const kafkaClient = {
    connect: jest.fn(),
    emit,
  };

  const service = new TicketsServiceService(
    kafkaClient as never,
    dbService as never,
  );

  return { dbService, emit, service, updateReturning };
}

function createFindEventTicketsService({
  eventRows = [
    {
      id: eventId,
      organizerId: 'organizer-1',
    },
  ],
  eventTicketRows = [
    {
      id: 'ticket-1',
      ticketCode: 'ABC123',
      quantity: 2,
      totalPrice: 10000,
      status: 'CONFIRMED',
      purchasedAt: new Date('2026-06-30T10:00:00.000Z'),
      checkedInAt: null,
      userId,
      userName: 'Customer One',
      userEmail: 'customer@example.com',
    },
  ],
} = {}) {
  const emit = jest.fn();
  const select = jest
    .fn()
    .mockReturnValueOnce(createQuery(eventRows))
    .mockReturnValueOnce(createQuery(eventTicketRows));
  const dbService = {
    db: {
      select,
    },
  };
  const kafkaClient = {
    connect: jest.fn(),
    emit,
  };
  const service = new TicketsServiceService(
    kafkaClient as never,
    dbService as never,
  );

  return { dbService, emit, service };
}

describe('TicketsServiceService', () => {
  it('purchases multiple tickets and emits a Kafka ticket event', async () => {
    const { emit, insertValues, service } = createService();

    const result = await service.purchase({ eventId, quantity: 3 }, userId);

    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId,
        userId,
        quantity: 3,
        totalPrice: 15000,
        status: 'CONFIRMED',
      }),
    );
    expect(result.ticket).toMatchObject({
      eventTitle: 'Founders Night',
      quantity: 3,
      totalPrice: 15000,
      status: 'CONFIRMED',
    });
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.TICKET_PURCHASED,
      expect.objectContaining({
        eventId,
        eventTitle: 'Founders Night',
        eventDate: expect.any(Date),
        eventLocation: 'Bengaluru Convention Hub',
        userId,
        userEmail: 'customer@example.com',
        quantity: 3,
        totalPrice: 15000,
        ticketCode: 'ABC123',
      }),
    );
  });

  it('allows multi-ticket purchase that exactly matches remaining capacity', async () => {
    const { emit, insertValues, service } = createService({ capacity: 5, sold: 2 });

    const result = await service.purchase({ eventId, quantity: 3 }, userId);

    expect(result.ticket).toMatchObject({
      quantity: 3,
      totalPrice: 15000,
      status: 'CONFIRMED',
    });
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId,
        userId,
        quantity: 3,
        totalPrice: 15000,
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.TICKET_PURCHASED,
      expect.objectContaining({
        eventId,
        quantity: 3,
        totalPrice: 15000,
      }),
    );
  });

  it.each([
    {
      quantity: 0,
      message: 'Quantity must be at least 1',
    },
    {
      quantity: -2,
      message: 'Quantity must be at least 1',
    },
    {
      quantity: 11,
      message: 'Quantity must be at most 10',
    },
    {
      quantity: 1.5,
      message: 'Quantity must be an integer',
    },
  ])(
    'rejects invalid purchase quantity $quantity before touching storage',
    async ({ quantity, message }) => {
      const { dbService, emit, insertValues, service } = createService();

      await expect(service.purchase({ eventId, quantity }, userId)).rejects.toThrow(
        new BadRequestException(message),
      );
      expect(dbService.db.select).not.toHaveBeenCalled();
      expect(insertValues).not.toHaveBeenCalled();
      expect(emit).not.toHaveBeenCalled();
    },
  );

  it('does not create a ticket when the purchasing user cannot be resolved', async () => {
    const { emit, insertValues, service } = createService({ userRows: [] });

    await expect(service.purchase({ eventId, quantity: 1 }, userId)).rejects.toThrow(
      new NotFoundException('User not found'),
    );
    expect(insertValues).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('blocks organizers from purchasing customer tickets', async () => {
    const { dbService, emit, service } = createService();

    await expect(
      service.purchase({ eventId, quantity: 1 }, userId, 'ORGANIZER'),
    ).rejects.toThrow(
      new ForbiddenException('Only customers can purchase tickets'),
    );
    expect(dbService.db.select).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('rejects purchases for unpublished events', async () => {
    const { emit, service } = createService({ eventStatus: 'DRAFT' });

    await expect(service.purchase({ eventId, quantity: 1 }, userId)).rejects.toThrow(
      new BadRequestException('Event is not published'),
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it('rejects purchases that exceed remaining capacity', async () => {
    const { emit, service } = createService({ capacity: 4, sold: 2 });

    await expect(service.purchase({ eventId, quantity: 3 }, userId)).rejects.toThrow(
      new BadRequestException('Only 2 tickets remaining'),
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it('treats checked-in tickets as consumed capacity for future purchases', async () => {
    const { emit, service } = createService({ capacity: 4, sold: 4 });

    await expect(service.purchase({ eventId, quantity: 1 }, userId)).rejects.toThrow(
      new BadRequestException('Only 0 tickets remaining'),
    );
    expect(emit).not.toHaveBeenCalled();
  });

  it('blocks customers from checking in tickets', async () => {
    const { dbService, emit, service } = createCheckInService();

    await expect(service.checkIn('ABC123', userId, 'USER')).rejects.toThrow(
      new ForbiddenException('Only organizers can check in tickets'),
    );
    expect(dbService.db.select).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('checks in tickets for the owning organizer and emits a Kafka check-in event', async () => {
    const { emit, service } = createCheckInService();

    const result = await service.checkIn('ABC123', 'organizer-1', 'ORGANIZER');

    expect(result.ticket).toMatchObject({
      id: 'ticket-1',
      ticketCode: 'ABC123',
      quantity: 2,
      status: 'CHECKED_IN',
    });
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.TICKET_CHECKED_IN,
      expect.objectContaining({
        ticketId: 'ticket-1',
        eventId,
        ticketCode: 'ABC123',
        eventTitle: 'Founders Night',
        eventDate: expect.any(Date),
        eventLocation: 'Bengaluru Convention Hub',
        userId,
        userEmail: 'customer@example.com',
        quantity: 2,
        timestamp: expect.any(String),
      }),
    );
  });

  it('does not check in when the ticket event cannot be resolved', async () => {
    const { emit, service } = createCheckInService({ eventRows: [] });

    await expect(
      service.checkIn('ABC123', 'organizer-1', 'ORGANIZER'),
    ).rejects.toThrow(new NotFoundException('Event not found'));
    expect(emit).not.toHaveBeenCalled();
  });

  it('does not check in when the ticket customer cannot be resolved', async () => {
    const { emit, service } = createCheckInService({ userRows: [] });

    await expect(
      service.checkIn('ABC123', 'organizer-1', 'ORGANIZER'),
    ).rejects.toThrow(new NotFoundException('User not found'));
    expect(emit).not.toHaveBeenCalled();
  });

  it('cancels a ticket and emits a self-contained Kafka cancellation event', async () => {
    const { emit, service, updateReturning } = createCancelService();

    const result = await service.cancel('ticket-1', userId);

    expect(result).toEqual({ message: 'Ticket cancelled successfully' });
    expect(updateReturning).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.TICKET_CANCELLED,
      expect.objectContaining({
        ticketId: 'ticket-1',
        eventId,
        eventTitle: 'Founders Night',
        eventDate: expect.any(Date),
        eventLocation: 'Bengaluru Convention Hub',
        userId,
        userEmail: 'customer@example.com',
        quantity: 2,
        totalPrice: 10000,
        ticketCode: 'ABC123',
        timestamp: expect.any(String),
      }),
    );
  });

  it('does not cancel when the customer email cannot be resolved', async () => {
    const { emit, service, updateReturning } = createCancelService({
      userRows: [],
    });

    await expect(service.cancel('ticket-1', userId)).rejects.toThrow(
      new NotFoundException('User not found'),
    );
    expect(updateReturning).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('does not cancel or emit when the cancellation event cannot be resolved', async () => {
    const { emit, service, updateReturning } = createCancelService({
      eventRows: [],
    });

    await expect(service.cancel('ticket-1', userId)).rejects.toThrow(
      new NotFoundException('Event not found'),
    );
    expect(updateReturning).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('lists event tickets with attendee identity for the owning organizer', async () => {
    const { emit, service } = createFindEventTicketsService();

    const result = await service.findEventTickets(
      eventId,
      'organizer-1',
      'ORGANIZER',
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'ticket-1',
        ticketCode: 'ABC123',
        quantity: 2,
        totalPrice: 10000,
        status: 'CONFIRMED',
        userId,
        userName: 'Customer One',
        userEmail: 'customer@example.com',
      }),
    ]);
    expect(emit).not.toHaveBeenCalled();
  });

  it('blocks customers from viewing event booking manifests', async () => {
    const { dbService, emit, service } = createFindEventTicketsService();

    await expect(
      service.findEventTickets(eventId, userId, 'USER'),
    ).rejects.toThrow(
      new ForbiddenException('Only organizers can view event tickets'),
    );
    expect(dbService.db.select).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('blocks organizers from viewing another organizer event manifest', async () => {
    const { dbService, emit, service } = createFindEventTicketsService();

    await expect(
      service.findEventTickets(eventId, 'organizer-2', 'ORGANIZER'),
    ).rejects.toThrow(
      new ForbiddenException('You are not authorized to view tickets for this event'),
    );
    expect(dbService.db.select).toHaveBeenCalledTimes(1);
    expect(emit).not.toHaveBeenCalled();
  });

  it('cancels confirmed tickets when an event is cancelled and emits customer cancellation events', async () => {
    const { emit, service, updateSet, updateWhere } = createEventCancellationService();

    const result = await service.cancelTicketsForEvent({
      eventId,
      eventTitle: 'Founders Night',
      eventDate: new Date('2026-07-10T18:30:00.000Z'),
      eventLocation: 'Bengaluru Convention Hub',
    });

    expect(result).toEqual({ cancelledTickets: 2 });
    expect(updateSet).toHaveBeenCalledWith({
      status: 'CANCELLED',
      updatedAt: expect.any(Date),
    });
    expect(updateWhere).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.TICKET_CANCELLED,
      expect.objectContaining({
        ticketId: 'ticket-1',
        eventId,
        eventTitle: 'Founders Night',
        eventLocation: 'Bengaluru Convention Hub',
        userId,
        userEmail: 'customer@example.com',
        quantity: 2,
        totalPrice: 10000,
        ticketCode: 'ABC123',
        cancellationReason: 'EVENT_CANCELLED',
      }),
    );
  });

  it('does not update or emit when an event cancellation has no confirmed tickets', async () => {
    const { dbService, emit, service } = createEventCancellationService({
      ticketsToCancel: [],
    });

    const result = await service.cancelTicketsForEvent({
      eventId,
      eventTitle: 'Founders Night',
    });

    expect(result).toEqual({ cancelledTickets: 0 });
    expect(dbService.db.update).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
