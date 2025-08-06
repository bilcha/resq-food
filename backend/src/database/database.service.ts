import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_KEY',
    );

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing Supabase configuration. SUPABASE_SERVICE_KEY is required for backend operations.',
      );
    }

    console.log(
      'Database Service - Initializing with service key (bypasses RLS)',
    );
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // Helper method for executing queries
  async query(sql: string, params?: any[]) {
    try {
      const { data, error } = await this.supabase.rpc('execute_sql', {
        sql,
        params: params || [],
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
}
