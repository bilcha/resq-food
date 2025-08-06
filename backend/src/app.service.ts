import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { message: string; timestamp: string; version: string } {
    return {
      message: 'ResQ Food API is running successfully',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  getVersion(): { version: string; name: string } {
    return {
      version: '1.0.0',
      name: 'ResQ Food API',
    };
  }
}
