import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/notifications', cors: true })
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger = new Logger(NotificationGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * client should call "join" with their userId after connecting
     * e.g. socket.emit('join', { userId })
     */
    @SubscribeMessage('join')
    onJoin(client: Socket, payload: { userId: string }) {
        if (payload?.userId) {
            client.join(payload.userId);
            this.logger.log(`Socket ${client.id} joined room ${payload.userId}`);
        }
    }

    // optional: allow client to leave
    @SubscribeMessage('leave')
    onLeave(client: Socket, payload: { userId: string }) {
        if (payload?.userId) {
            client.leave(payload.userId);
        }
    }

    // helper used by listener to push notification to a user room
    pushNotificationToUser(userId: string, notification: any) {
        this.server.to(userId).emit('notification', notification);
    }
}
