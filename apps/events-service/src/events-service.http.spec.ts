import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DatabaseService } from '@app/database';
import { KAFKA_SERVICE, KAFKA_TOPICS } from '@app/kafka';
import { EventsServiceController } from './events-service.controller';
import { EventsServiceService } from './events-service.service';

const organizerId = 'organizer-1';
const eventId = '7dd79962-8f8b-4c3f-92ac-8e2ce74195b0';
const event = {
  id: eventId,
  title: 'Launch Night',
  description: 'A curated evening of talks and music.',
  date: new Date('2026-07-20T18:30:00.000Z'),
  location: 'Mumbai Arena',
  city: 'Mumbai',
  category: 'Live shows',
  capacity: 200,
  price: 1500,
  status: 'DRAFT',
  organizerId,
  createdAt: new Date('2026-06-30T10:00:00.000Z'),
  updatedAt: new Date('2026-06-30T10:00:00.000Z'),
};
const updateDto = {
  title: 'Launch Night Revised',
  city: 'Pune',
  date: '2026-07-21T18:30:00.000Z',
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

describe('Events service update contract (http)', () => {
  let app: INestApplication;
  let emit: jest.Mock;
  let set: jest.Mock;

  beforeEach(async () => {
    emit = jest.fn();
    const returning = jest.fn().mockResolvedValue([
      {
        ...event,
        title: updateDto.title,
        city: updateDto.city,
        date: new Date(updateDto.date),
        updatedAt: new Date('2026-06-30T11:00:00.000Z'),
      },
    ]);
    set = jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({ returning }),
    });
    const dbService = {
      db: {
        select: jest.fn().mockReturnValue(createQuery([event])),
        update: jest.fn().mockReturnValue({ set }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EventsServiceController],
      providers: [
        EventsServiceService,
        {
          provide: KAFKA_SERVICE,
          useValue: { connect: jest.fn(), emit },
        },
        { provide: DatabaseService, useValue: dbService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('updates an organizer draft and emits event.updated from HTTP headers', async () => {
    await request(app.getHttpServer())
      .put(`/${eventId}`)
      .set('x-user-id', organizerId)
      .set('x-user-role', 'ORGANIZER')
      .send(updateDto)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: eventId,
          title: 'Launch Night Revised',
          city: 'Pune',
          status: 'DRAFT',
          organizerId,
        });
      });

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Launch Night Revised',
        city: 'Pune',
        date: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      KAFKA_TOPICS.EVENT_UPDATED,
      expect.objectContaining({
        eventId,
        changes: ['title', 'city', 'date'],
        timestamp: expect.any(String),
      }),
    );
  });
});
