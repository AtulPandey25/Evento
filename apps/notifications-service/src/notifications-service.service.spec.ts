import { EmailService } from './email.service';
import { NotificationsServiceService } from './notifications-service.service';

function createService() {
  const emailService = {
    sendEmail: jest.fn().mockResolvedValue(undefined),
  };

  const service = new NotificationsServiceService(
    emailService as unknown as EmailService,
  );

  return { emailService, service };
}

describe('NotificationsServiceService', () => {
  it('sends welcome email to the registered user', async () => {
    const { emailService, service } = createService();

    const result = await service.sendWelcomeEmail({
      userId: 'user-1',
      email: 'customer@example.com',
      name: 'Customer One',
    });

    expect(result).toEqual({ sent: true });
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Welcome to Evento!',
      expect.stringContaining('Customer One'),
    );
  });

  it('sends ticket purchase email using the Kafka event recipient and event details', async () => {
    const { emailService, service } = createService();

    const result = await service.sendTicketPurchasedEmail({
      userId: 'user-1',
      userEmail: 'customer@example.com',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      ticketCode: 'ABC123',
      quantity: 2,
      totalPrice: 12345,
    });

    expect(result).toEqual({ sent: true });
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Your Ticket is Confirmed!',
      expect.stringContaining('Founders Night'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Your Ticket is Confirmed!',
      expect.stringContaining('ABC123'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Your Ticket is Confirmed!',
      expect.stringContaining('Bengaluru Convention Hub'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Your Ticket is Confirmed!',
      expect.stringMatching(/INR\s*123\.45/),
    );
  });

  it('skips ticket purchase email instead of sending to a fake recipient', async () => {
    const { emailService, service } = createService();

    const result = await service.sendTicketPurchasedEmail({
      userId: 'user-1',
      eventTitle: 'Founders Night',
      ticketCode: 'ABC123',
      quantity: 2,
      totalPrice: 12345,
    });

    expect(result).toEqual({ sent: false, reason: 'missing_email' });
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it('sends ticket cancellation email only when the event includes a recipient', async () => {
    const { emailService, service } = createService();

    const sent = await service.sendTicketCancelledEmail({
      ticketId: 'ticket-1',
      userId: 'user-1',
      userEmail: 'customer@example.com',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      ticketCode: 'ABC123',
      quantity: 2,
      totalPrice: 10000,
    });
    const skipped = await service.sendTicketCancelledEmail({
      ticketId: 'ticket-2',
      userId: 'user-2',
    });

    expect(sent).toEqual({ sent: true });
    expect(skipped).toEqual({ sent: false, reason: 'missing_email' });
    expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Cancelled',
      expect.stringContaining('Ticket Cancelled'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Cancelled',
      expect.stringContaining('Founders Night'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Cancelled',
      expect.stringContaining('Bengaluru Convention Hub'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Cancelled',
      expect.stringMatching(/INR\s*100\.00/),
    );
  });

  it('uses event-cancelled copy for organizer-driven attendee cancellations', async () => {
    const { emailService, service } = createService();

    const result = await service.sendTicketCancelledEmail({
      ticketId: 'ticket-1',
      userId: 'user-1',
      userEmail: 'customer@example.com',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      ticketCode: 'ABC123',
      quantity: 2,
      totalPrice: 10000,
      cancellationReason: 'EVENT_CANCELLED',
    });

    expect(result).toEqual({ sent: true });
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Cancelled',
      expect.stringContaining(
        'cancelled because the event listing was cancelled',
      ),
    );
    expect(emailService.sendEmail).not.toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Cancelled',
      expect.stringContaining('If you did not request this cancellation'),
    );
  });

  it('sends event cancellation email to the organizer from the Kafka event', async () => {
    const { emailService, service } = createService();

    const result = await service.sendEventCancelledEmail({
      eventId: 'event-1',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      organizerId: 'organizer-1',
      organizerEmail: 'organizer@example.com',
    });

    expect(result).toEqual({ sent: true });
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'organizer@example.com',
      'Event Cancelled',
      expect.stringContaining('Founders Night'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'organizer@example.com',
      'Event Cancelled',
      expect.stringContaining('Bengaluru Convention Hub'),
    );
  });

  it('skips event cancellation email instead of sending without an organizer recipient', async () => {
    const { emailService, service } = createService();

    const result = await service.sendEventCancelledEmail({
      eventId: 'event-1',
      eventTitle: 'Founders Night',
      organizerId: 'organizer-1',
    });

    expect(result).toEqual({ sent: false, reason: 'missing_email' });
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it('sends ticket check-in email using the Kafka event recipient and details', async () => {
    const { emailService, service } = createService();

    const result = await service.sendTicketCheckedInEmail({
      ticketId: 'ticket-1',
      userId: 'user-1',
      userEmail: 'customer@example.com',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      ticketCode: 'ABC123',
      quantity: 2,
    });

    expect(result).toEqual({ sent: true });
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Checked In',
      expect.stringContaining('Founders Night'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Checked In',
      expect.stringContaining('ABC123'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'customer@example.com',
      'Ticket Checked In',
      expect.stringContaining('Bengaluru Convention Hub'),
    );
  });

  it('skips ticket check-in email instead of sending without a recipient', async () => {
    const { emailService, service } = createService();

    const result = await service.sendTicketCheckedInEmail({
      ticketId: 'ticket-1',
      userId: 'user-1',
      eventTitle: 'Founders Night',
    });

    expect(result).toEqual({ sent: false, reason: 'missing_email' });
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });

  it('sends event published email to the organizer from the Kafka event', async () => {
    const { emailService, service } = createService();

    const result = await service.sendEventPublishedEmail({
      eventId: 'event-1',
      eventTitle: 'Founders Night',
      eventDate: '2026-07-10T18:30:00.000Z',
      eventLocation: 'Bengaluru Convention Hub',
      organizerId: 'organizer-1',
      organizerEmail: 'organizer@example.com',
    });

    expect(result).toEqual({ sent: true });
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'organizer@example.com',
      'Event Published',
      expect.stringContaining('Founders Night'),
    );
    expect(emailService.sendEmail).toHaveBeenCalledWith(
      'organizer@example.com',
      'Event Published',
      expect.stringContaining('Bengaluru Convention Hub'),
    );
  });

  it('skips event published email instead of sending without an organizer recipient', async () => {
    const { emailService, service } = createService();

    const result = await service.sendEventPublishedEmail({
      eventId: 'event-1',
      eventTitle: 'Founders Night',
      organizerId: 'organizer-1',
    });

    expect(result).toEqual({ sent: false, reason: 'missing_email' });
    expect(emailService.sendEmail).not.toHaveBeenCalled();
  });
});
