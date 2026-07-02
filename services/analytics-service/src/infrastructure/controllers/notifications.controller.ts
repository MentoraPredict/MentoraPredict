import { Controller, Get, Param, Patch, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetMyNotificationsUseCase } from '../../application/use-cases/get-my-notifications.use-case';
import { MarkNotificationReadUseCase } from '../../application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from '../../application/use-cases/mark-all-notifications-read.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface JwtRequest {
  user?: { sub?: string; role?: string };
}

@ApiTags('notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(
    private readonly getMyNotificationsUC: GetMyNotificationsUseCase,
    private readonly markNotificationReadUC: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUC: MarkAllNotificationsReadUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: "Authenticated user's notifications (STUDENT or TEACHER — filtered by recipientId)" })
  @ApiResponse({ status: 200 })
  async getMyNotifications(
    @Req() req: JwtRequest,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const recipientId = req.user?.sub;
    if (!recipientId) throw new UnauthorizedException('Missing user identity');
    return this.getMyNotificationsUC.execute(
      recipientId,
      { status: status ?? 'UNREAD', type },
      { page: parseInt(page ?? '1', 10), limit: parseInt(limit ?? '20', 10) },
    );
  }

  @Patch('read-all')
  @ApiOperation({ summary: "Mark all of the authenticated user's UNREAD notifications as READ" })
  @ApiResponse({ status: 200 })
  async markAllRead(@Req() req: JwtRequest) {
    const recipientId = req.user?.sub;
    if (!recipientId) throw new UnauthorizedException('Missing user identity');
    return this.markAllNotificationsReadUC.execute(recipientId);
  }

  @Patch(':notificationId/read')
  @ApiOperation({ summary: 'Mark a single notification as read (owner only)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: 'Not the recipient of this notification' })
  @ApiResponse({ status: 404 })
  async markRead(@Param('notificationId') notificationId: string, @Req() req: JwtRequest) {
    const recipientId = req.user?.sub;
    if (!recipientId) throw new UnauthorizedException('Missing user identity');
    return this.markNotificationReadUC.execute(notificationId, recipientId);
  }
}
