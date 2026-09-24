import { INestApplication, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import request from 'supertest';
import { TransformInterceptor } from '@app/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: () =>
    class MockJwtAuthGuard {
      canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest<{
          headers: Record<string, string | undefined>;
          user?: { userId: string; role?: string };
        }>();

        request.user = {
          userId: request.headers['x-test-user-id'] || 'organizer-1',
          role: request.headers['x-test-user-role'],
        };

        return true;
      }
    },
}));

const eventId = '7dd79962-8f8b-4c3f-92ac-8e2ce74195b0';
const updateDto = {
  title: 'Launch Night Revised',
  city: 'Pune',
  category: 'Startup meetups',
  capacity: 220,
  price: 2550,
};
const eventResponse = {
  id: eventId,
  title: 'Launch Night Revised',
  description: 'A curated evening of talks and music.',
  date: '2026-07-20T18:30:00.000Z',
  location: 'Mumbai Arena',
  city: 'Pune',
  category: 'Startup meetups',
  capacity: 220,
  price: 2550,
  status: 'DRAFT',
  organizerId: 'organizer-1',
  createdAt: '2026-06-30T10:00:00.000Z',
  updatedAt: '2026-06-30T11:00:00.000Z',
};

describe('API Gateway events update contract (http)', () => {
  const originalEventsUrl = process.env.EVENTS_SERVICE_URL;
  let app: INestApplication;
  let httpService: { put: jest.Mock };

  beforeEach(async () => {
    process.env.EVENTS_SERVICE_URL = 'http://events.local';
    httpService = {
      put: jest.fn().mockReturnValue(of({ data: eventResponse })),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        EventsService,
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();
  });

  afterEach(async () => {
    process.env.EVENTS_SERVICE_URL = originalEventsUrl;
    await app.close();
  });

  it('forwards organizer draft edits to events-service with user role headers', async () => {
    await request(app.getHttpServer())
      .put(`/events/${eventId}`)
      .set('x-test-user-id', 'organizer-1')
      .set('x-test-user-role', 'ORGANIZER')
      .send(updateDto)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: true,
          data: {
            id: eventId,
            title: 'Launch Night Revised',
            city: 'Pune',
            category: 'Startup meetups',
          },
        });
      });

    expect(httpService.put).toHaveBeenCalledWith(
      `http://events.local/${eventId}`,
      updateDto,
      { headers: { 'x-user-id': 'organizer-1', 'x-user-role': 'ORGANIZER' } },
    );
  });
});
