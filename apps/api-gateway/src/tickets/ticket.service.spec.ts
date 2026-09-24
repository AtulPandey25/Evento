import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { TicketService } from './ticket.service';

describe('ApiGateway TicketService', () => {
  const originalTicketsUrl = process.env.TICKETS_SERVICE_URL;

  afterEach(() => {
    process.env.TICKETS_SERVICE_URL = originalTicketsUrl;
    jest.restoreAllMocks();
  });

  function createService() {
    process.env.TICKETS_SERVICE_URL = 'http://tickets.local';
    const httpService = {
      get: jest.fn().mockReturnValue(of({ data: [] })),
      post: jest.fn().mockReturnValue(of({ data: { message: 'ok' } })),
    } as unknown as HttpService;

    return {
      httpService,
      service: new TicketService(httpService),
    };
  }

  it('sends role headers when purchasing tickets', async () => {
    const { httpService, service } = createService();
    const purchaseDto = {
      eventId: '7dd79962-8f8b-4c3f-92ac-8e2ce74195b0',
      quantity: 2,
    };

    await service.purchase(purchaseDto, 'customer-1', 'USER');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://tickets.local/purchase',
      purchaseDto,
      { headers: { 'x-user-id': 'customer-1', 'x-user-role': 'USER' } },
    );
  });

  it('sends role headers when checking in tickets', async () => {
    const { httpService, service } = createService();
    const checkInDto = { ticketCode: 'ABC123' };

    await service.checkIn(checkInDto, 'organizer-1', 'ORGANIZER');

    expect(httpService.post).toHaveBeenCalledWith(
      'http://tickets.local/check-in',
      checkInDto,
      { headers: { 'x-user-id': 'organizer-1', 'x-user-role': 'ORGANIZER' } },
    );
  });

  it('sends role headers when listing event tickets', async () => {
    const { httpService, service } = createService();

    await service.findEventTickets('event-1', 'organizer-1', 'ORGANIZER');

    expect(httpService.get).toHaveBeenCalledWith(
      'http://tickets.local/event/event-1',
      { headers: { 'x-user-id': 'organizer-1', 'x-user-role': 'ORGANIZER' } },
    );
  });
});
