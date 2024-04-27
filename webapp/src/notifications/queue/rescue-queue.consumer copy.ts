import { OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Err } from 'joi';
import { MaydayService } from 'webapp/src/mayday/mayday.service';

@Processor('rescueServiceQueue')
export class RescueQueueConsumer {
  constructor() {}

  @OnQueueFailed()
  errHandler(job: Job, err: Err) {
    console.log('error: ' + err);
    throw err;
  }

  @Process('send-request')
  async handleSendRequestRescue(job: Job) {
    const requestRescueData = job.data;
    console.log(`구조 요청 알림: ${requestRescueData.message}`);
  }

  @Process('send-accept')
  async handleSendAcceptRescue(job: Job) {
    const acceptRescueData = job.data;
    console.log(`구조 요청 수락 알림: ${acceptRescueData.message}`);
  }
}
