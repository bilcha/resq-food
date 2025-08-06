import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { AuthService } from './auth.service';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: any) {
    try {
      const authHeader = req.headers.authorization;
      console.log(
        'Firebase Strategy - Authorization header present:',
        !!authHeader,
      );

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Firebase Strategy - No valid authorization header');
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log('Firebase Strategy - Token extracted:', !!token);
      console.log('Firebase Strategy - Token length:', token?.length);

      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Use our AuthService to verify the token (which we know works)
      const decodedToken = await this.authService.verifyToken(token);
      console.log('Firebase Strategy - Token verified successfully');
      console.log('Firebase Strategy - Decoded token UID:', decodedToken.uid);
      console.log(
        'Firebase Strategy - Decoded token email:',
        decodedToken.email,
      );

      // Find or create user in database
      const user = await this.authService.findOrCreateUser(
        decodedToken.uid,
        decodedToken.email,
        decodedToken.name,
      );

      console.log('Firebase Strategy - User found/created:', {
        id: user?.id,
        firebase_uid: user?.firebase_uid,
      });
      return user;
    } catch (error) {
      console.error('Firebase Strategy - Validation error:', error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
