import { KAFKA_TOPICS } from '@app/kafka';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';
import { TicketsServiceController } from './tickets-service.controller';
import { TicketsServiceService } from './tickets-service.service';

function createController() {
  const ticketsService = {
    cancelTicketsForEvent: jest.fn().mockResolvedValue({ cancelledTickets: 2 }),
  };
  const controller = new TicketsServiceController(
    ticketsService as unknown as TicketsServiceService,
  );

  return { controller, ticketsService };
}

function getKafkaPattern(methodName: keyof TicketsServiceController) {
  return Reflect.getMetadata(
    PATTERN_METADATA,
    TicketsServiceController.prototype[methodName],
  );
}

describe('TicketsServiceController', () => {
  it('exposes a health response for service probes', () => {
    const { controller } = createController();

    expect(controller.healthCheck()).toEqual({
      status: 'ok',
      service: 'tickets-service',
    });
  });

  it('binds event cancellation Kafka events to ticket orchestration', () => {
    expect(getKafkaPattern('handleEventCancelled')).toEqual([
      KAFKA_TOPICS.EVENT_CANCELLED,
    ]);
  });

  it('forwards event cancellation payloads to the ticket service', async () => {
    const { controller, ticketsService } = createController();
    const payload = {
      eventId: 'event-1',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
    };

    await expect(controller.handleEventCancelled(payload)).resolves.toEqual({
      cancelledTickets: 2,
    });
    expect(ticketsService.cancelTicketsForEvent).toHaveBeenCalledWith(payload);
  });
});
