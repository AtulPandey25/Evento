import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { EventsService } from './events.service';

const eventDto = {
  title: 'Launch Night',
  description: 'A curated evening of talks and music.',
  date: '2026-07-20T18:30:00.000Z',
  location: 'Mumbai Arena',
  city: 'Mumbai',
  category: 'Live shows',
  capacity: 200,
  price: 1500,
};

const eventResponse = {
  id: 'event-1',
  ...eventDto,
  status: 'DRAFT',
  organizerId: 'organizer-1',
  createdAt: '2026-06-30T10:00:00.000Z',
  updatedAt: '2026-06-30T10:00:00.000Z',
};

describe('ApiGateway EventsService', () => {
  const originalEventsUrl = process.env.EVENTS_SERVICE_URL;

  afterEach(() => {
    process.env.EVENTS_SERVICE_URL = originalEventsUrl;
    jest.restoreAllMocks();
  });

  function createService() {
    process.env.EVENTS_SERVICE_URL = 'http://events.local';
    const httpService = {
      post: jest.fn().mockReturnValue(of({ data: eventResponse })),
      put: jest.fn().mockReturnValue(of({ data: eventResponse })),
    } as unknown as HttpService;

    return {
      httpService,
      service: new EventsService(httpService),
    };
  }

  it('sends role headers when creating events', async () => {
    const { httpService, service } = createService();

    await service.create(eventDto, 'organizer-1', 'ORGANIZER');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://events.local',
      eventDto,
      { headers: { 'x-user-id': 'organizer-1', 'x-user-role': 'ORGANIZER' } },
    );
  });

  it('sends role headers when updating events', async () => {
    const { httpService, service } = createService();
    const updateDto = { title: 'Updated Launch Night' };

    await service.update('event-1', updateDto, 'admin-1', 'ADMIN');

    expect(httpService.put).toHaveBeenCalledWith(
      'http://events.local/event-1',
      updateDto,
      { headers: { 'x-user-id': 'admin-1', 'x-user-role': 'ADMIN' } },
    );
  });

  it('sends role headers when publishing and cancelling events', async () => {
    const { httpService, service } = createService();

    await service.publish('event-1', 'organizer-1', 'ORGANIZER');
    await service.cancel('event-1', 'organizer-1', 'ORGANIZER');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://events.local/event-1/publish',
      {},
      { headers: { 'x-user-id': 'organizer-1', 'x-user-role': 'ORGANIZER' } },
    );
    expect(httpService.post).toHaveBeenCalledWith(
      'http://events.local/event-1/cancel',
      {},
      { headers: { 'x-user-id': 'organizer-1', 'x-user-role': 'ORGANIZER' } },
    );
  });
});
