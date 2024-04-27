import { Controller, Get, Query } from '@nestjs/common';
import { DestinationRiskService } from './destination-risk.service';

@Controller('destination-risk')
export class DestinationRiskController {
    constructor (private readonly destinationRiskService : DestinationRiskService) {}

    @Get('get')
    async getDestinationRisk (@Query('destination') destination : string) {
        const destinationRisk = await this.destinationRiskService.getDestinationRisk(destination)
        return destinationRisk
    }
}
