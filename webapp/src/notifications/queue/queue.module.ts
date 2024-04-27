import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MaydayModule } from 'webapp/src/mayday/mayday.module';
import { RescueQueueConsumer } from './rescue-queue.consumer copy';
import { QueueService } from './queue.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'rescueServiceQueue',
      },
      {
        name: 'chatServiceQueue',
      },
    ),
  ],
  providers: [RescueQueueConsumer, QueueService],
  exports: [QueueService],
})
export class QueueModule {}
