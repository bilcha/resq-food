import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './firebase.strategy';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { DatabaseModule } from '../database/database.module';
import { BusinessModule } from '../business/business.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase' }),
    DatabaseModule,
    forwardRef(() => BusinessModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseStrategy,
    FirebaseAuthGuard,
  ],
  exports: [AuthService, FirebaseAuthGuard],
})
export class AuthModule {} 