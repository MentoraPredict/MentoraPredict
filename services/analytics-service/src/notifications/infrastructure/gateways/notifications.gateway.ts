import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationEntity } from '../../domain/entities/notification.entity';

interface SocketAuthPayload {
  sub?: string;
}

// Real-time push for the notification the recipient already has persisted
// via NotificationRepository — this is a delivery channel, not a source of
// truth. If nobody is connected, the notification still sits in Postgres and
// GET /api/v1/notifications/me picks it up on next load. One room per user
// (`user:{userId}`) keeps fan-out trivial regardless of how many tabs/devices
// the same user has open.
@Injectable()
@WebSocketGateway({
  path: '/api/socket.io',
  cors: { origin: true, credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    const token = this.extractToken(client);
    if (!token) {
      this.logger.warn(`Socket ${client.id} connected without a token — disconnecting`);
      client.disconnect(true);
      return;
    }

    try {
      const payload = this.jwtService.verify<SocketAuthPayload>(token);
      if (!payload.sub) throw new Error('Token has no subject');
      void client.join(`user:${payload.sub}`);
    } catch {
      this.logger.warn(`Socket ${client.id} sent an invalid token — disconnecting`);
      client.disconnect(true);
    }
  }

  handleDisconnect(): void {
    // Rooms are cleaned up automatically by socket.io on disconnect.
  }

  emitToUser(userId: string, notification: NotificationEntity): void {
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }

  private extractToken(client: Socket): string | null {
    const fromAuth = client.handshake.auth?.token as string | undefined;
    if (fromAuth) return fromAuth;

    const fromQuery = client.handshake.query?.token;
    if (typeof fromQuery === 'string') return fromQuery;

    const header = client.handshake.headers.authorization;
    if (header?.startsWith('Bearer ')) return header.slice(7);

    return null;
  }
}
