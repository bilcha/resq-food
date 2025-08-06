import { Module, forwardRef } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { AuthModule } from '../auth/auth.module';
import { GeoccodingModule } from '../geocoding/geocoding.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [forwardRef(() => AuthModule), GeoccodingModule, DatabaseModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
