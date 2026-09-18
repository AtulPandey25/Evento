import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsServiceService {
  private readonly logger = new Logger(NotificationsServiceService.name);

  constructor(private readonly emailService: EmailService) {}

  private formatMoney(cents: number) {
    return new Intl.NumberFormat('en-IN', {
      currency: 'INR',
      currencyDisplay: 'code',
      style: 'currency',
    }).format(cents / 100);
  }

  private formatEventDate(value: string | Date) {
    return new Date(value).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  async sendWelcomeEmail(data: {
    userId: string;
    email: string;
    name: string;
  }) {
    this.logger.log(`Sending welcome email to ${data.email}`);

    const html = `
      <h1>Welcome to Evento, ${data.name}!</h1>
      <p>Your account has been created successfully.</p>
      <p>You can now:</p>
      <ul>
        <li>Browse and discover events</li>
        <li>Purchase tickets</li>
        <li>Create your own events</li>
      </ul>
      <p>Happy eventing!</p>
    `;

    await this.emailService.sendEmail(
      data.email,
      'Welcome to Evento!',
      html,
    );

    return { sent: true as const };
  }

  async sendTicketPurchasedEmail(data: {
    userId: string;
    userEmail?: string;
    ticketCode: string;
    eventTitle: string;
    eventDate?: string | Date;
    eventLocation?: string;
    quantity: number;
    totalPrice: number;
  }) {
    if (!data.userEmail) {
      this.logger.warn(
        `Ticket purchase notification skipped: missing email for user ${data.userId}`,
      );
      return { sent: false as const, reason: 'missing_email' as const };
    }

    this.logger.log(`Sending ticket confirmation to ${data.userEmail}`);

    const html = `
      <h1>Ticket Confirmed</h1>
      <p>Your ticket purchase was successful.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Event:</strong> ${data.eventTitle}</p>
        ${data.eventDate ? `<p><strong>Date:</strong> ${this.formatEventDate(data.eventDate)}</p>` : ''}
        ${data.eventLocation ? `<p><strong>Venue:</strong> ${data.eventLocation}</p>` : ''}
        <p><strong>Ticket Code:</strong> ${data.ticketCode}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Total:</strong> ${this.formatMoney(data.totalPrice)}</p>
      </div>
      <p>Show this ticket code at the event entrance.</p>
    `;

    await this.emailService.sendEmail(
      data.userEmail,
      'Your Ticket is Confirmed!',
      html,
    );

    return { sent: true as const };
  }

  async sendTicketCancelledEmail(data: {
    ticketId: string;
    userId: string;
    userEmail?: string;
    ticketCode?: string;
    eventTitle?: string;
    eventDate?: string | Date;
    eventLocation?: string;
    quantity?: number;
    totalPrice?: number;
    cancellationReason?: 'EVENT_CANCELLED' | string;
  }) {
    if (!data.userEmail) {
      this.logger.warn(
        `Ticket cancellation notification skipped: missing email for user ${data.userId}`,
      );
      return { sent: false as const, reason: 'missing_email' as const };
    }

    this.logger.log(`Sending cancellation notice to ${data.userEmail}`);
    const wasEventCancelled = data.cancellationReason === 'EVENT_CANCELLED';

    const html = `
      <h1>Ticket Cancelled</h1>
      <p>${
        wasEventCancelled
          ? 'Your ticket has been cancelled because the event listing was cancelled.'
          : 'Your ticket has been cancelled as requested.'
      }</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${data.eventTitle ? `<p><strong>Event:</strong> ${data.eventTitle}</p>` : ''}
        ${data.eventDate ? `<p><strong>Date:</strong> ${this.formatEventDate(data.eventDate)}</p>` : ''}
        ${data.eventLocation ? `<p><strong>Venue:</strong> ${data.eventLocation}</p>` : ''}
        ${data.ticketCode ? `<p><strong>Ticket Code:</strong> ${data.ticketCode}</p>` : ''}
        ${data.quantity ? `<p><strong>Quantity:</strong> ${data.quantity}</p>` : ''}
        ${
          typeof data.totalPrice === 'number'
            ? `<p><strong>Total:</strong> ${this.formatMoney(data.totalPrice)}</p>`
            : ''
        }
      </div>
      ${
        wasEventCancelled
          ? '<p>No entry action is needed from you. The cancelled ticket will remain in your wallet for reference.</p>'
          : '<p>If you did not request this cancellation, please contact support.</p>'
      }
    `;

    await this.emailService.sendEmail(data.userEmail, 'Ticket Cancelled', html);

    return { sent: true as const };
  }

  async sendTicketCheckedInEmail(data: {
    ticketId: string;
    userId: string;
    userEmail?: string;
    ticketCode?: string;
    eventTitle?: string;
    eventDate?: string | Date;
    eventLocation?: string;
    quantity?: number;
  }) {
    if (!data.userEmail) {
      this.logger.warn(
        `Ticket check-in notification skipped: missing email for user ${data.userId}`,
      );
      return { sent: false as const, reason: 'missing_email' as const };
    }

    this.logger.log(`Sending check-in notice to ${data.userEmail}`);

    const html = `
      <h1>Ticket Checked In</h1>
      <p>Your ticket has been checked in successfully.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${data.eventTitle ? `<p><strong>Event:</strong> ${data.eventTitle}</p>` : ''}
        ${data.eventDate ? `<p><strong>Date:</strong> ${this.formatEventDate(data.eventDate)}</p>` : ''}
        ${data.eventLocation ? `<p><strong>Venue:</strong> ${data.eventLocation}</p>` : ''}
        ${data.ticketCode ? `<p><strong>Ticket Code:</strong> ${data.ticketCode}</p>` : ''}
        ${data.quantity ? `<p><strong>Quantity:</strong> ${data.quantity}</p>` : ''}
      </div>
      <p>Enjoy the event.</p>
    `;

    await this.emailService.sendEmail(data.userEmail, 'Ticket Checked In', html);

    return { sent: true as const };
  }

  async sendEventPublishedEmail(data: {
    eventId: string;
    eventTitle: string;
    eventDate?: string | Date;
    eventLocation?: string;
    organizerId: string;
    organizerEmail?: string;
  }) {
    if (!data.organizerEmail) {
      this.logger.warn(
        `Event publish notification skipped: missing email for organizer ${data.organizerId}`,
      );
      return { sent: false as const, reason: 'missing_email' as const };
    }

    this.logger.log(`Sending event publish notice to ${data.organizerEmail}`);

    const html = `
      <h1>Event Published</h1>
      <p>Your event listing is now live for ticket sales.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Event:</strong> ${data.eventTitle}</p>
        ${data.eventDate ? `<p><strong>Date:</strong> ${this.formatEventDate(data.eventDate)}</p>` : ''}
        ${data.eventLocation ? `<p><strong>Venue:</strong> ${data.eventLocation}</p>` : ''}
      </div>
      <p>Customers can now discover and book this event.</p>
    `;

    await this.emailService.sendEmail(
      data.organizerEmail,
      'Event Published',
      html,
    );

    return { sent: true as const };
  }

  async sendEventCancelledEmail(data: {
    eventId: string;
    eventTitle: string;
    eventDate?: string | Date;
    eventLocation?: string;
    organizerId: string;
    organizerEmail?: string;
  }) {
    if (!data.organizerEmail) {
      this.logger.warn(
        `Event cancellation notification skipped: missing email for organizer ${data.organizerId}`,
      );
      return { sent: false as const, reason: 'missing_email' as const };
    }

    this.logger.log(`Sending event cancellation notice to ${data.organizerEmail}`);

    const html = `
      <h1>Event Cancelled</h1>
      <p>Your event listing has been cancelled.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Event:</strong> ${data.eventTitle}</p>
        ${data.eventDate ? `<p><strong>Date:</strong> ${this.formatEventDate(data.eventDate)}</p>` : ''}
        ${data.eventLocation ? `<p><strong>Venue:</strong> ${data.eventLocation}</p>` : ''}
      </div>
      <p>The listing is no longer available for ticket sales.</p>
    `;

    await this.emailService.sendEmail(
      data.organizerEmail,
      'Event Cancelled',
      html,
    );

    return { sent: true as const };
  }
}
