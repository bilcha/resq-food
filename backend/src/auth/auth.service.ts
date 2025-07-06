import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
  private firebaseApp: admin.app.App;

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const serviceAccount = {
      type: 'service_account',
      project_id: this.configService.get('FIREBASE_PROJECT_ID'),
      private_key_id: this.configService.get('FIREBASE_PRIVATE_KEY_ID'),
      private_key: this.configService.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      client_email: this.configService.get('FIREBASE_CLIENT_EMAIL'),
      client_id: this.configService.get('FIREBASE_CLIENT_ID'),
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${this.configService.get('FIREBASE_CLIENT_EMAIL')}`,
    };

    if (!admin.apps.length) {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    } else {
      this.firebaseApp = admin.app();
    }
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async findOrCreateUser(firebaseUid: string, email: string, displayName?: string) {
    const supabase = this.databaseService.getClient();
    
    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('businesses')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      throw findError;
    }

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from('businesses')
      .insert([
        {
          firebase_uid: firebaseUid,
          email,
          name: displayName || email.split('@')[0],
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return newUser;
  }

  async getUserByFirebaseUid(firebaseUid: string) {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
} 