import { InjectRepository } from '@nestjs/typeorm';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DirectMessages } from '../common/entities/direct-messages.entity';
import { Repository } from 'typeorm';

@WebSocketGateway({ namespace: '/dm' })
export class DmGateway {
  @WebSocketServer() server: Server;

  constructor(
    @InjectRepository(DirectMessages)
    private readonly dmRepo: Repository<DirectMessages>,
  ) {}

  @SubscribeMessage('message')
  async handleMessage(socket: Socket, data: DirectMessages): Promise<void> {
    this.dmRepo.save({ ...data });

    const targetUserId = +data.roomName
      .split('_')
      .filter((id) => data.user_id !== +id)[0];
    const allSockets = await this.server.fetchSockets();

    let targetSocket;
    allSockets.forEach((soc) => {
      if (soc.handshake.auth.userId === targetUserId) {
        targetSocket = soc;
      }
    });

    if (targetSocket && [...targetSocket.rooms][1] !== data.roomName) {
      this.server.to('' + targetSocket.id).emit('notification', data.user_id);
    }

    this.server.in(data.roomName).emit('message', data);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(socket: Socket, roomName: string): Promise<void> {
    socket.leave([...socket.rooms][1]);
    socket.join(roomName);

    const history = await this.dmRepo.findBy({ roomName });
    socket.emit('joinRoom', { roomName, history });
  }

  handleDisconnect(socket: Socket): void {
    console.log(socket.id + ' is disconnected');
  }

  afterInit(): void {
    console.log('init');
  }
}
