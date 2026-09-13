import { NestFactory } from '@nestjs/core';
import { TicketsServiceModule } from './tickets-service.module';
import { ValidationPipe } from '@nestjs/common';
import { SERVICES_PORTS } from '@app/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { KAFKA_BROKER, KAFKA_CLIENT_ID } from '@app/kafka';

async function bootstrap() {
  const app = await NestFactory.create(TicketsServiceModule);

  //Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: `${KAFKA_CLIENT_ID}-tickets`,
        brokers: [KAFKA_BROKER],
      },
      consumer: {
        groupId: 'tickets-service-group',
      },
    },
  });

  await app.startAllMicroservices();

  await app.listen(SERVICES_PORTS.TICKETS_SERVICE);
  console.log(
    `Tickets Service is running on port ${SERVICES_PORTS.TICKETS_SERVICE}`,
  );
  console.log('Tickets Kafka consumer started');
}
bootstrap();
