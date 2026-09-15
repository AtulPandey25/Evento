import {
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { TicketsServiceService } from './tickets-service.service';
import { CheckInTicketDto, PurchaseTicketDto } from '@app/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@app/kafka';

@Controller()
export class TicketsServiceController {
  private readonly logger = new Logger(TicketsServiceController.name);

  constructor(private readonly ticketsServiceService: TicketsServiceService) {}

  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'tickets-service' };
  }

  @Post('purchase')
  purchase(
    @Body() purchaseDto: PurchaseTicketDto,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.ticketsServiceService.purchase(purchaseDto, userId, userRole);
  }

  @Get('my-tickets')
  findMyTickets(@Headers('x-user-id') userId: string) {
    return this.ticketsServiceService.findMyTicket(userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.ticketsServiceService.findOne(id, userId);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.ticketsServiceService.cancel(id, userId);
  }

  @Post('check-in')
  checkIn(
    @Body() checkInDto: CheckInTicketDto,
    @Headers('x-user-id') organizerId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.ticketsServiceService.checkIn(
      checkInDto.ticketCode,
      organizerId,
      userRole,
    );
  }

  @Get('event/:eventId')
  findEventTickets(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Headers('x-user-id') organizerId: string,
    @Headers('x-user-role') userRole: string,
  ) {
    return this.ticketsServiceService.findEventTickets(
      eventId,
      organizerId,
      userRole,
    );
  }

  @EventPattern(KAFKA_TOPICS.EVENT_CANCELLED)
  async handleEventCancelled(
    @Payload()
    data: {
      eventId: string;
      eventTitle?: string;
      eventDate?: string | Date;
      eventLocation?: string;
    },
  ) {
    this.logger.log(`Received event cancellation event: ${JSON.stringify(data)}`);
    return this.ticketsServiceService.cancelTicketsForEvent(data);
  }
}
