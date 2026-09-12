import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { KAFKA_TOPICS } from '@app/kafka';
import { EventsServiceService } from './events-service.service';

const organizerId = 'organizer-1';
const eventDto = {
  title: 'Founders Night',
  description: 'Pitching, music, and networking.',
  date: '2026-07-10T18:30:00.000Z',
  location: 'Bengaluru Convention Hub',
  city: 'Bengaluru',
  category: 'Startup meetups',
  capacity: 120,
  price: 2500,
};

function createQuery<T>(rows: T[]) {
  const promise = Promise.resolve(rows);

  return {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(rows),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
}

function createService() {
  const emit = jest.fn();
  const returning = jest.fn().mockResolvedValue([
    {
      id: 'event-1',
      ...eventDto,
      date: new Date(eventDto.date),
      status: 'DRAFT',
      organizerId,
    },
  ]);

  const dbService = {
    db: {
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({ returning }),
      }),
    },
  };

  const kafkaClient = {
    connect: jest.fn(),
    emit,
  };

  const service = new EventsServiceService(
    kafkaClient as never,
    dbService as never,
  );

  return { dbService, emit, returning, service };
}

function createServiceWithExistingEvent({
  organizerRows = [{ email: 'organizer@example.com' }],
  updatedStatus = 'PUBLISHED',
} = {}) {
  const emit = jest.fn();
  const event = {
    id: 'event-1',
    ...eventDto,
    date: new Date(eventDto.date),
    status: 'DRAFT',
    organizerId,
  };
  const updateReturning = jest.fn().mockResolvedValue([
    {
      ...event,
      status: updatedStatus,
    },
  ]);

  const dbService = {
    db: {
      select: jest
        .fn()
        .mockReturnValueOnce({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue([event]),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue(organizerRows),
        }),
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

  const service = new EventsServiceService(
    kafkaClient as never,
    dbService as never,
  );

  return { dbService, emit, service, updateReturning };
}

describe('EventsServiceService', () => {
  it('lists published events with sold and remaining inventory', async () => {
    const event = {
      id: 'event-1',
      ...eventDto,
      date: new Date(eventDto.date),
      status: 'PUBLISHED',
      organizerId,
    };
    const dbService = {
      db: {
        select: jest
          .fn()
          .mockReturnValueOnce(createQuery([event]))
          .mockReturnValueOnce(createQuery([{ total: 8 }])),
      },
    };
    const service = new EventsServiceService(
      { connect: jest.fn(), emit: jest.fn() } as never,
      dbService as never,
    );

    const result = await service.findAll();

    expect(result).toEqual([
      expect.objectContaining({
        id: 'event-1',
        soldTickets: 8,
        remainingCapacity: 112,
      }),
    ]);
  });

  it('returns event detail with sold and remaining inventory', async () => {
    const event = {
      id: 'event-1',
      ...eventDto,
      date: new Date(eventDto.date),
      status: 'PUBLISHED',
      organizerId,
    };
    const dbService = {
      db: {
        select: jest
          .fn()
          .mockReturnValueOnce(createQuery([event]))
          .mockReturnValueOnce(createQuery([{ total: 12 }])),
      },
    };
    const service = new EventsServiceService(
      { connect: jest.fn(), emit: jest.fn() } as never,
      dbService as never,
    );

    const result = await service.findOne('event-1');

    expect(result).toEqual(
      expect.objectContaining({
        id: 'event-1',
        soldTickets: 12,
        remainingCapacity: 108,
      }),
    );
  });

  it('does not expose negative remaining inventory when sales exceed capacity', async () => {
    const event = {
      id: 'event-1',
      ...eventDto,
      date: new Date(eventDto.date),
      status: 'PUBLISHED',
      organizerId,
    };
    const dbService = {
      db: {
        select: jest
          .fn()
          .mockReturnValueOnce(createQuery([event]))
          .mockReturnValueOnce(createQuery([{ total: 140 }])),
      },
    };
    const service = new EventsServiceService(
      { connect: jest.fn(), emit: jest.fn() } as never,
      dbService as never,
    );

    const result = await service.findOne('event-1');

    expect(result).toEqual(
      expect.objectContaining({
        soldTickets: 140,
        remainingCapacity: 0,
      }),
    );
  });

  it('counts checked-in tickets as consumed event inventory', async () => {
    const event = {
      id: 'event-1',
      ...eventDto,
      date: new Date(eventDto.date),
      status: 'PUBLISHED',
      organizerId,
    };
    const dbService = {
      db: {
        select: jest
          .fn()
          .mockReturnValueOnce(createQuery([event]))
          .mockReturnValueOnce(createQuery([{ total: 20 }])),
      },
    };
    const service = new EventsServiceService(
      { connect: jest.fn(), emit: jest.fn() } as never,
      dbService as never,
    );

    const result = await service.findOne('event-1');

    expect(result).toMatchObject({
      soldTickets: 20,
      remainingCapacity: 100,
    });
  });

  it('allows organizers to create event drafts and emits Kafka event.created', async () => {
    const { dbService, emit, service } = createService();

    const result = await service.create(eventDto, organizerId, 'ORGANIZER');

    expect(dbService.db.insert).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      title: 'Founders Night',
      city: 'Bengaluru',
      category: 'Startup meetups',
      status: 'DRAFT',
      organizerId,
    });
    expect(
      (dbService.db.insert as jest.Mock).mock.results[0].value.values,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'Bengaluru',
        category: 'Startup meetups',
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.EVENT_CREATED,
      expect.objectContaining({
        eventId: 'event-1',
        organizerId,
        title: 'Founders Night',
      }),
    );
  });

  it('defaults city and category for older organizer event payloads', async () => {
    const { dbService, service } = createService();
    const legacyEventDto = {
      title: 'Legacy Listing',
      description: 'Created before explicit city and category fields.',
      date: '2026-07-11T18:30:00.000Z',
      location: 'Phoenix Marketcity, Pune',
      capacity: 80,
      price: 1500,
    };

    await service.create(legacyEventDto, organizerId, 'ORGANIZER');

    expect(
      (dbService.db.insert as jest.Mock).mock.results[0].value.values,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        city: 'Pune',
        category: 'Live shows',
      }),
    );
  });

  it('blocks customers from creating organizer event inventory', async () => {
    const { dbService, emit, service } = createService();

    await expect(service.create(eventDto, organizerId, 'USER')).rejects.toThrow(
      new ForbiddenException('Only organizers can create events'),
    );
    expect(dbService.db.insert).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('allows organizers to update their own draft and emits event.updated', async () => {
    const { dbService, emit, service } = createServiceWithExistingEvent();
    const updateDto = {
      title: 'Founders Night Revised',
      city: 'Pune',
      date: '2026-07-12T18:30:00.000Z',
    };

    await service.update('event-1', updateDto, organizerId, 'ORGANIZER');

    const setMock = (dbService.db.update as jest.Mock).mock.results[0].value
      .set as jest.Mock;
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Founders Night Revised',
        city: 'Pune',
        date: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.EVENT_UPDATED,
      expect.objectContaining({
        eventId: 'event-1',
        changes: ['title', 'city', 'date'],
        timestamp: expect.any(String),
      }),
    );
  });

  it('allows admins to update organizer events', async () => {
    const { dbService, service } = createServiceWithExistingEvent();

    await service.update(
      'event-1',
      { title: 'Admin Revised Night' },
      'admin-1',
      'ADMIN',
    );

    expect(dbService.db.update).toHaveBeenCalledTimes(1);
  });

  it('blocks customers and non-owner organizers from updating events', async () => {
    const customerService = createServiceWithExistingEvent();
    const otherOrganizerService = createServiceWithExistingEvent();

    await expect(
      customerService.service.update(
        'event-1',
        { title: 'Customer Edit' },
        organizerId,
        'USER',
      ),
    ).rejects.toThrow(new ForbiddenException('Only organizers can update events'));
    expect(customerService.dbService.db.update).not.toHaveBeenCalled();

    await expect(
      otherOrganizerService.service.update(
        'event-1',
        { title: 'Other Organizer Edit' },
        'organizer-2',
        'ORGANIZER',
      ),
    ).rejects.toThrow(
      new ForbiddenException('You are not authorized to update this event'),
    );
    expect(otherOrganizerService.dbService.db.update).not.toHaveBeenCalled();
  });

  it('blocks customers from publishing events even if they match organizer id', async () => {
    const { dbService, service } = createServiceWithExistingEvent();

    await expect(service.publish('event-1', organizerId, 'USER')).rejects.toThrow(
      new ForbiddenException('Only organizers can publish events'),
    );
    expect(dbService.db.update).not.toHaveBeenCalled();
  });

  it('blocks non-owner organizers from publishing another organizer event', async () => {
    const { dbService, emit, service } = createServiceWithExistingEvent();

    await expect(
      service.publish('event-1', 'organizer-2', 'ORGANIZER'),
    ).rejects.toThrow(
      new ForbiddenException('You are not authorized to publish this event'),
    );
    expect(dbService.db.update).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('publishes events and emits a self-contained event.published Kafka event', async () => {
    const { emit, service } = createServiceWithExistingEvent();

    const result = await service.publish('event-1', organizerId, 'ORGANIZER');

    expect(result).toMatchObject({
      id: 'event-1',
      status: 'PUBLISHED',
    });
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.EVENT_PUBLISHED,
      expect.objectContaining({
        eventId: 'event-1',
        eventTitle: 'Founders Night',
        eventDate: expect.any(Date),
        eventLocation: 'Bengaluru Convention Hub',
        organizerId,
        organizerEmail: 'organizer@example.com',
        timestamp: expect.any(String),
      }),
    );
  });

  it('does not publish or emit when the organizer email cannot be resolved', async () => {
    const { emit, service, updateReturning } = createServiceWithExistingEvent({
      organizerRows: [],
    });

    await expect(
      service.publish('event-1', organizerId, 'ORGANIZER'),
    ).rejects.toThrow(new NotFoundException('Organizer not found'));
    expect(updateReturning).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('emits a self-contained event.cancelled Kafka event for organizer cancellations', async () => {
    const { emit, service } = createServiceWithExistingEvent({
      updatedStatus: 'CANCELLED',
    });

    const result = await service.cancel('event-1', organizerId, 'ORGANIZER');

    expect(result).toMatchObject({
      id: 'event-1',
      status: 'CANCELLED',
    });
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.EVENT_CANCELLED,
      expect.objectContaining({
        eventId: 'event-1',
        eventTitle: 'Founders Night',
        eventDate: expect.any(Date),
        eventLocation: 'Bengaluru Convention Hub',
        organizerId,
        organizerEmail: 'organizer@example.com',
        timestamp: expect.any(String),
      }),
    );
  });

  it('blocks non-owner organizers from cancelling another organizer event', async () => {
    const { dbService, emit, service } = createServiceWithExistingEvent({
      updatedStatus: 'CANCELLED',
    });

    await expect(
      service.cancel('event-1', 'organizer-2', 'ORGANIZER'),
    ).rejects.toThrow(
      new ForbiddenException('You are not authorized to cancel this event'),
    );
    expect(dbService.db.update).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });

  it('does not cancel or emit when the organizer email cannot be resolved', async () => {
    const { emit, service, updateReturning } = createServiceWithExistingEvent({
      organizerRows: [],
    });

    await expect(
      service.cancel('event-1', organizerId, 'ORGANIZER'),
    ).rejects.toThrow(new NotFoundException('Organizer not found'));
    expect(updateReturning).not.toHaveBeenCalled();
    expect(emit).not.toHaveBeenCalled();
  });
});
