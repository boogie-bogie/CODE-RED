import { Module } from '@nestjs/common';
import { DestinationRiskService } from './destination-risk.service';
import { DestinationRiskController } from './destination-risk.controller';

@Module({
    providers : [DestinationRiskService],
    controllers : [DestinationRiskController]
})
export class DestinationRiskModule {}
