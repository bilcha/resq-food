import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FirebaseAuthGuard extends AuthGuard('firebase') {
  canActivate(context: ExecutionContext) {
    console.log('FirebaseAuthGuard - Guard activated');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('FirebaseAuthGuard - handleRequest called');
    console.log('FirebaseAuthGuard - Error:', err?.message || 'none');
    console.log('FirebaseAuthGuard - User:', user ? { id: user.id, firebase_uid: user.firebase_uid } : 'none');
    console.log('FirebaseAuthGuard - Info:', info?.message || 'none');
    
    if (err || !user) {
      console.log('FirebaseAuthGuard - Authentication failed');
      throw err || new Error('Authentication failed');
    }
    
    console.log('FirebaseAuthGuard - Authentication successful');
    return user;
  }
} 