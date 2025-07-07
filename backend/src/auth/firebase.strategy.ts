import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'dummy-secret-not-used-for-firebase', // Fixed: Added dummy secret
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const decodedToken = await this.authService.verifyToken(token);
      
      // Find or create user in database
      const user = await this.authService.findOrCreateUser(
        decodedToken.uid,
        decodedToken.email,
        decodedToken.name,
      );

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 