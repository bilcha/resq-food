import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('profile')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('verify-token')
  @ApiOperation({ summary: 'Verify Firebase token' })
  @ApiResponse({ status: 200, description: 'Token verified successfully' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verifyToken(@Body('token') token: string) {
    try {
      console.log('Auth Controller - verify-token endpoint called');
      console.log('Auth Controller - Token received:', !!token);

      const decodedToken = await this.authService.verifyToken(token);
      console.log('Auth Controller - Token decoded successfully');

      const user = await this.authService.findOrCreateUser(
        decodedToken.uid,
        decodedToken.email,
        decodedToken.name,
      );
      console.log('Auth Controller - User found/created successfully');

      return { valid: true, user };
    } catch (error) {
      console.error('Auth Controller - verify-token error:', error);
      return { valid: false, error: error.message };
    }
  }

  @Get('test-firebase')
  @ApiOperation({ summary: 'Test Firebase connection' })
  @ApiResponse({ status: 200, description: 'Firebase connection test result' })
  async testFirebase() {
    const isConnected = await this.authService.testFirebaseConnection();
    return {
      firebaseConnected: isConnected,
      timestamp: new Date().toISOString(),
    };
  }
}
