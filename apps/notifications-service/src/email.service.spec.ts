import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('EmailService', () => {
  const originalEnv = process.env;
  let sendMail: jest.Mock;

  beforeEach(() => {
    process.env = { ...originalEnv };
    sendMail = jest.fn().mockResolvedValue(undefined);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('initializes nodemailer with configured SMTP settings', () => {
    process.env.SMTP_HOST = 'mailhog';
    process.env.SMTP_PORT = '1025';
    const service = new EmailService();

    service.onModuleInit();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'mailhog',
      port: 1025,
      secure: false,
    });
  });

  it('uses local SMTP defaults when env settings are absent', () => {
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    const service = new EmailService();

    service.onModuleInit();

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,
    });
  });

  it('sends mail with Evento sender identity', async () => {
    const service = new EmailService();
    service.onModuleInit();

    await service.sendEmail('customer@example.com', 'Subject', '<p>Hello</p>');

    expect(sendMail).toHaveBeenCalledWith({
      from: '"EventoApp" <noreply@eventoapp.com>',
      to: 'customer@example.com',
      subject: 'Subject',
      html: '<p>Hello</p>',
    });
  });

  it('does not throw when the SMTP transport fails', async () => {
    sendMail.mockRejectedValueOnce(new Error('smtp unavailable'));
    const service = new EmailService();
    service.onModuleInit();

    await expect(
      service.sendEmail('customer@example.com', 'Subject', '<p>Hello</p>'),
    ).resolves.toBeUndefined();
  });
});
