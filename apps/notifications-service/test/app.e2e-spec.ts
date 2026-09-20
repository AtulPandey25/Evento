import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { NotificationsServiceController } from './../src/notifications-service.controller';
import { NotificationsServiceService } from './../src/notifications-service.service';

describe('Notifications service health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsServiceController],
      providers: [{ provide: NotificationsServiceService, useValue: {} }],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok', service: 'notifications-service' });
  });
});
