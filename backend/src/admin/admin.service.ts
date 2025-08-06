import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(private databaseService: DatabaseService) {}

  async getPendingListings() {
    const supabase = this.databaseService.getClient();

    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        businesses (
          id,
          name,
          email,
          address
        )
      `,
      )
      .eq('is_approved', false)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data;
  }

  async approveListing(listingId: string) {
    const supabase = this.databaseService.getClient();

    const { data, error } = await supabase
      .from('listings')
      .update({
        is_approved: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async rejectListing(listingId: string) {
    const supabase = this.databaseService.getClient();

    const { data, error } = await supabase
      .from('listings')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getAnalytics() {
    const supabase = this.databaseService.getClient();

    const [
      { count: totalListings },
      { count: totalBusinesses },
      { count: activeListings },
      { count: pendingListings },
    ] = await Promise.all([
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('businesses').select('*', { count: 'exact', head: true }),
      supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_approved', true),
      supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .eq('is_active', true),
    ]);

    return {
      totalListings,
      totalBusinesses,
      activeListings,
      pendingListings,
    };
  }
}
