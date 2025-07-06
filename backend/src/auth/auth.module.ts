import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseStrategy } from './firebase.strategy';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase' }),
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