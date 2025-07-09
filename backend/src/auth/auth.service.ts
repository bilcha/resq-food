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
    console.log('Auth Service - Initializing Firebase Admin SDK...');
    
    // Option 1: Use service account JSON file path
    const serviceAccountPath = this.configService.get('FIREBASE_SERVICE_ACCOUNT_PATH');
    if (serviceAccountPath) {
      console.log('Auth Service - Using service account file path:', serviceAccountPath);
      if (!admin.apps.length) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        console.log('Auth Service - Firebase initialized with service account file');
      } else {
        this.firebaseApp = admin.app();
        console.log('Auth Service - Using existing Firebase app');
      }
      return;
    }

    // Option 2: Use individual environment variables
    const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
    const projectId = this.configService.get('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
    
    console.log('Auth Service - Firebase config check:');
    console.log('  - Project ID:', projectId ? 'SET' : 'MISSING');
    console.log('  - Client Email:', clientEmail ? 'SET' : 'MISSING');
    console.log('  - Private Key:', privateKey ? 'SET' : 'MISSING');
    
    if (!privateKey) {
      throw new Error('Firebase private key not found. Please set FIREBASE_PRIVATE_KEY or FIREBASE_SERVICE_ACCOUNT_PATH environment variable.');
    }

    // Clean and format the private key
    const cleanPrivateKey = privateKey
      .replace(/\\n/g, '\n')
      .trim();

    // Validate PEM format
    if (!cleanPrivateKey.includes('-----BEGIN PRIVATE KEY-----') || !cleanPrivateKey.includes('-----END PRIVATE KEY-----')) {
      console.error('Auth Service - Invalid private key format');
      throw new Error('Invalid Firebase private key format. Private key must be in PEM format with proper headers and footers.');
    }

    const serviceAccount = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: this.configService.get('FIREBASE_PRIVATE_KEY_ID'),
      private_key: cleanPrivateKey,
      client_email: clientEmail,
      client_id: this.configService.get('FIREBASE_CLIENT_ID'),
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${clientEmail}`,
    };

    try {
      if (!admin.apps.length) {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
        console.log('Auth Service - Firebase initialized with environment variables');
      } else {
        this.firebaseApp = admin.app();
        console.log('Auth Service - Using existing Firebase app');
      }
    } catch (error) {
      console.error('Auth Service - Firebase initialization failed:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      console.log('Auth Service - Verifying token...');
      console.log('Auth Service - Token length:', token?.length);
      console.log('Auth Service - Token prefix:', token?.substring(0, 20) + '...');
      
      // Check if Firebase Admin is properly initialized
      if (!admin.apps.length) {
        console.error('Auth Service - Firebase Admin not initialized!');
        throw new Error('Firebase Admin not initialized');
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Auth Service - Token verification successful');
      console.log('Auth Service - Decoded token UID:', decodedToken.uid);
      console.log('Auth Service - Decoded token email:', decodedToken.email);
      
      return decodedToken;
    } catch (error) {
      console.error('Auth Service - Token verification failed:', error);
      console.error('Auth Service - Error code:', error.code);
      console.error('Auth Service - Error message:', error.message);
      
      // Provide more specific error messages
      if (error.code === 'auth/id-token-expired') {
        throw new Error('Token expired');
      } else if (error.code === 'auth/invalid-id-token') {
        throw new Error('Invalid token format');
      } else if (error.code === 'auth/project-not-found') {
        throw new Error('Firebase project not found');
      } else if (error.code === 'auth/invalid-project-id') {
        throw new Error('Invalid Firebase project ID');
      }
      
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  async findOrCreateUser(firebaseUid: string, email: string, displayName?: string, address?: string) {
    const supabase = this.databaseService.getClient();
    
    console.log('Auth Service - Looking for user with Firebase UID:', firebaseUid);
    
    // Check if user exists
    const { data: existingUser, error: findError } = await supabase
      .from('businesses')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Auth Service - Error finding user:', findError);
      throw findError;
    }

    if (existingUser) {
      console.log('Auth Service - Found existing user:', { id: existingUser.id, email: existingUser.email });
      return existingUser;
    }

    console.log('Auth Service - Creating new user for:', { firebaseUid, email, displayName, address });

    // Create new user with basic info (without geocoding for now)
    // Address geocoding will be handled when the user updates their profile
    const { data: newUser, error: createError } = await supabase
      .from('businesses')
      .insert([
        {
          firebase_uid: firebaseUid,
          email,
          name: displayName || email.split('@')[0],
          address: address || null,
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('Auth Service - Error creating user:', createError);
      throw createError;
    }

    console.log('Auth Service - Created new user:', { id: newUser.id, email: newUser.email });
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

  // Test method to verify Firebase is working
  async testFirebaseConnection(): Promise<boolean> {
    try {
      console.log('Auth Service - Testing Firebase connection...');
      
      if (!admin.apps.length) {
        console.error('Auth Service - No Firebase apps initialized');
        return false;
      }

      // Try to get the Firebase app
      const app = admin.app();
      console.log('Auth Service - Firebase app found:', app.name);
      
      // Try to access Firebase Auth
      const auth = admin.auth();
      console.log('Auth Service - Firebase Auth accessible');
      
      return true;
    } catch (error) {
      console.error('Auth Service - Firebase connection test failed:', error);
      return false;
    }
  }
} 