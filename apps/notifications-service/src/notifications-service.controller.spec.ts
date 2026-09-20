import { KAFKA_TOPICS } from '@app/kafka';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';
import { NotificationsServiceController } from './notifications-service.controller';
import { NotificationsServiceService } from './notifications-service.service';

function createController() {
  const notificationsService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue({ sent: true }),
    sendTicketPurchasedEmail: jest.fn().mockResolvedValue({ sent: true }),
    sendTicketCancelledEmail: jest.fn().mockResolvedValue({ sent: true }),
    sendTicketCheckedInEmail: jest.fn().mockResolvedValue({ sent: true }),
    sendEventPublishedEmail: jest.fn().mockResolvedValue({ sent: true }),
    sendEventCancelledEmail: jest.fn().mockResolvedValue({ sent: true }),
  };

  const controller = new NotificationsServiceController(
    notificationsService as unknown as NotificationsServiceService,
  );

  return { controller, notificationsService };
}

function getKafkaPattern(methodName: keyof NotificationsServiceController) {
  return Reflect.getMetadata(
    PATTERN_METADATA,
    NotificationsServiceController.prototype[methodName],
  );
}

describe('NotificationsServiceController', () => {
  it('exposes a health response for service probes', () => {
    const { controller } = createController();

    expect(controller.healthCheck()).toEqual({
      status: 'ok',
      service: 'notifications-service',
    });
  });

  it('binds Kafka event handlers to the expected topics', () => {
    expect(getKafkaPattern('handleUserRegistered')).toEqual([
      KAFKA_TOPICS.USER_REGISTERED,
    ]);
    expect(getKafkaPattern('handleTicketPurchased')).toEqual([
      KAFKA_TOPICS.TICKET_PURCHASED,
    ]);
    expect(getKafkaPattern('handleTicketCancelled')).toEqual([
      KAFKA_TOPICS.TICKET_CANCELLED,
    ]);
    expect(getKafkaPattern('handleTicketCheckedIn')).toEqual([
      KAFKA_TOPICS.TICKET_CHECKED_IN,
    ]);
    expect(getKafkaPattern('handleEventPublished')).toEqual([
      KAFKA_TOPICS.EVENT_PUBLISHED,
    ]);
    expect(getKafkaPattern('handleEventCancelled')).toEqual([
      KAFKA_TOPICS.EVENT_CANCELLED,
    ]);
  });

  it('forwards user registration events to the notification service', async () => {
    const { controller, notificationsService } = createController();
    const payload = {
      userId: 'user-1',
      email: 'customer@example.com',
      name: 'Customer One',
    };

    await controller.handleUserRegistered(payload);

    expect(notificationsService.sendWelcomeEmail).toHaveBeenCalledWith(payload);
  });

  it('forwards ticket purchase events with recipient and event details', async () => {
    const { controller, notificationsService } = createController();
    const payload = {
      ticketId: 'ticket-1',
      ticketCode: 'ABC123',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      userId: 'user-1',
      userEmail: 'customer@example.com',
      quantity: 2,
      totalPrice: 12345,
    };

    await controller.handleTicketPurchased(payload);

    expect(notificationsService.sendTicketPurchasedEmail).toHaveBeenCalledWith(
      payload,
    );
  });

  it('forwards ticket cancellation events to the notification service', async () => {
    const { controller, notificationsService } = createController();
    const payload = {
      ticketId: 'ticket-1',
      ticketCode: 'ABC123',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      userId: 'user-1',
      userEmail: 'customer@example.com',
      quantity: 2,
      totalPrice: 10000,
      cancellationReason: 'EVENT_CANCELLED',
    };

    await controller.handleTicketCancelled(payload);

    expect(notificationsService.sendTicketCancelledEmail).toHaveBeenCalledWith(
      payload,
    );
  });

  it('forwards event cancellation events to the notification service', async () => {
    const { controller, notificationsService } = createController();
    const payload = {
      eventId: 'event-1',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      organizerId: 'organizer-1',
      organizerEmail: 'organizer@example.com',
    };

    await controller.handleEventCancelled(payload);

    expect(notificationsService.sendEventCancelledEmail).toHaveBeenCalledWith(
      payload,
    );
  });

  it('forwards ticket check-in events to the notification service', async () => {
    const { controller, notificationsService } = createController();
    const payload = {
      ticketId: 'ticket-1',
      ticketCode: 'ABC123',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      userId: 'user-1',
      userEmail: 'customer@example.com',
      quantity: 2,
    };

    await controller.handleTicketCheckedIn(payload);

    expect(notificationsService.sendTicketCheckedInEmail).toHaveBeenCalledWith(
      payload,
    );
  });

  it('forwards event published events to the notification service', async () => {
    const { controller, notificationsService } = createController();
    const payload = {
      eventId: 'event-1',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      organizerId: 'organizer-1',
      organizerEmail: 'organizer@example.com',
    };

    await controller.handleEventPublished(payload);

    expect(notificationsService.sendEventPublishedEmail).toHaveBeenCalledWith(
      payload,
    );
  });
});
