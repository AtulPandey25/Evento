import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

describe('TicketController', () => {
  let controller: TicketController;
  let ticketService: jest.Mocked<
    Pick<TicketService, 'purchase' | 'checkIn' | 'findEventTickets'>
  >;

  beforeEach(() => {
    ticketService = {
      purchase: jest.fn(),
      checkIn: jest.fn(),
      findEventTickets: jest.fn(),
    };
    controller = new TicketController(ticketService as unknown as TicketService);
  });

  it('forwards customer role when purchasing tickets', () => {
    const dto = { eventId: '7dd79962-8f8b-4c3f-92ac-8e2ce74195b0', quantity: 2 };

    controller.purchase(dto, {
      user: { userId: 'customer-1', role: 'USER' },
    });

    expect(ticketService.purchase).toHaveBeenCalledWith(
      dto,
      'customer-1',
      'USER',
    );
  });

  it('forwards organizer role when checking in tickets', () => {
    const dto = { ticketCode: 'ABC123' };

    controller.checkIn(dto, {
      user: { userId: 'organizer-1', role: 'ORGANIZER' },
    });

    expect(ticketService.checkIn).toHaveBeenCalledWith(
      dto,
      'organizer-1',
      'ORGANIZER',
    );
  });

  it('defaults missing role to USER for legacy tokens', () => {
    controller.findEventTickets('7dd79962-8f8b-4c3f-92ac-8e2ce74195b0', {
      user: { userId: 'legacy-user' },
    });

    expect(ticketService.findEventTickets).toHaveBeenCalledWith(
      '7dd79962-8f8b-4c3f-92ac-8e2ce74195b0',
      'legacy-user',
      'USER',
    );
  });
});
