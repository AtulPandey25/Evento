import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TicketsServiceController } from './../src/tickets-service.controller';
import { TicketsServiceService } from './../src/tickets-service.service';

describe('Tickets service health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TicketsServiceController],
      providers: [{ provide: TicketsServiceService, useValue: {} }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', service: 'tickets-service' });
  });
});
