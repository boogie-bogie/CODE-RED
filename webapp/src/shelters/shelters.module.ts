import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelters } from 'webapp/src/common/entities/shelters.entity';
import { SheltersService } from './shelters.service';
import { SheltersController } from './shelters.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Shelters])
    ],
    providers : [SheltersService],
    controllers : [SheltersController]
})
export class SheltersModule {}
