import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  CreateNotificationDto,
  CreateNotificationUseCase,
} from '../../application/use-cases/create-notification.use-case';
import { InternalServiceGuard } from '../../../infrastructure/guards/internal-service.guard';

@ApiTags('notifications-internal')
@Controller('api/v1/notifications/internal')
@UseGuards(InternalServiceGuard)
export class InternalNotificationsController {
  constructor(private readonly createNotificationUC: CreateNotificationUseCase) {}

  @Post()
  @ApiOperation({
    summary:
      'Internal: create a notification for one recipient, or broadcast to every user with a given role',
  })
  create(@Body() dto: CreateNotificationDto) {
    return this.createNotificationUC.execute(dto);
  }
}
