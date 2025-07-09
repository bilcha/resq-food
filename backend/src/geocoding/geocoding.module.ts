import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeoccodingService } from './geocoding.service';
import { GeoccodingController } from './geocoding.controller';

@Module({
  imports: [ConfigModule],
  controllers: [GeoccodingController],
  providers: [GeoccodingService],
  exports: [GeoccodingService],
})
export class GeoccodingModule {} 