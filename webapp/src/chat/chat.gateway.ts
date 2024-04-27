// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   MessageBody,
//   ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { ChatFilterService } from './chat-filter.service';

// @WebSocketGateway({ namespace: 'chat' })
// export class ChatGateway {
//   @WebSocketServer() server: Server;

//   constructor(private readonly chatFilterService: ChatFilterService) {}

//   @SubscribeMessage('message')
//   handleMessage(
//     @MessageBody() data: string,
//     @ConnectedSocket() socket: Socket,
//   ): void {
//     const filteredMessage = this.chatFilterService.filterMessage(data);

//     this.server.emit('message', { message: filteredMessage });
//   }

//   handleConnection(client: any): void {
//     console.log(`Client connected: ${client.id}`);
//   }

//   handleDisconnect(client: any): void {
//     console.log(`Client disconnected: ${client.id}`);
//   }
// }

//ver2

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatFilterService } from './chat-filter.service';
import { string } from 'joi';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatFilterService: ChatFilterService) {}

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { message: string; clientId: string }, // 메시지와 클라이언트 ID를 함께 받음
    @ConnectedSocket() socket: Socket,
  ): void {
    const { message, clientId } = data;
    const filteredMessage = this.chatFilterService.filterMessage({
      message,
      clientId,
    });
    const formattedMessage = `${filteredMessage}`;

    this.server.emit('message', formattedMessage); // 클라이언트에게 포맷된 메시지 전송
  }

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
  }
}
