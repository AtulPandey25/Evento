import { EventsController } from './events.controller';
import { EventsService } from './events.service';

const createEventDto = {
  title: 'Launch Night',
  description: 'A curated evening of talks and music.',
  date: '2026-07-20T18:30:00.000Z',
  location: 'Mumbai Arena',
  city: 'Mumbai',
  category: 'Live shows',
  capacity: 200,
  price: 1500,
};

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: jest.Mocked<
    Pick<EventsService, 'create' | 'publish' | 'update' | 'cancel'>
  >;

  beforeEach(() => {
    eventsService = {
      create: jest.fn(),
      publish: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    };
    controller = new EventsController(eventsService as unknown as EventsService);
  });

  it('forwards organizer role when creating an event', () => {
    controller.create(createEventDto, {
      user: { userId: 'organizer-1', role: 'ORGANIZER' },
    });

    expect(eventsService.create).toHaveBeenCalledWith(
      createEventDto,
      'organizer-1',
      'ORGANIZER',
    );
  });

  it('defaults missing role to USER when publishing', () => {
    controller.publish('event-1', {
      user: { userId: 'legacy-user' },
    });

    expect(eventsService.publish).toHaveBeenCalledWith(
      'event-1',
      'legacy-user',
      'USER',
    );
  });

  it('forwards admin role for protected event mutations', () => {
    controller.update(
      'event-1',
      { title: 'Updated Launch Night' },
      { user: { userId: 'admin-1', role: 'ADMIN' } },
    );
    controller.cancel('event-1', {
      user: { userId: 'admin-1', role: 'ADMIN' },
    });

    expect(eventsService.update).toHaveBeenCalledWith(
      'event-1',
      { title: 'Updated Launch Night' },
      'admin-1',
      'ADMIN',
    );
    expect(eventsService.cancel).toHaveBeenCalledWith(
      'event-1',
      'admin-1',
      'ADMIN',
    );
  });
});
