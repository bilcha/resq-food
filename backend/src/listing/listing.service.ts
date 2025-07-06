import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ListingService {
  constructor(private databaseService: DatabaseService) {}

  async findAll(filters?: any) {
    const supabase = this.databaseService.getClient();
    
    let query = supabase
      .from('listings')
      .select(`
        *,
        businesses (
          id,
          name,
          address,
          latitude,
          longitude,
          google_rating,
          google_place_id
        )
      `)
      .eq('is_active', true)
      .eq('is_approved', true);

    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.is_free !== undefined) {
        query = query.eq('is_free', filters.is_free);
      }
      if (filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }
      if (filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        businesses (
          id,
          name,
          address,
          latitude,
          longitude,
          google_rating,
          google_place_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async create(businessId: string, listingData: any) {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          business_id: businessId,
          title: listingData.title,
          description: listingData.description,
          category: listingData.category,
          price: listingData.price,
          is_free: listingData.is_free || false,
          image_url: listingData.image_url,
          available_from: listingData.available_from,
          available_until: listingData.available_until,
          quantity: listingData.quantity || 1,
          is_active: true,
          is_approved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id: string, businessId: string, updateData: any) {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('listings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('business_id', businessId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async delete(id: string, businessId: string) {
    const supabase = this.databaseService.getClient();
    
    const { error } = await supabase
      .from('listings')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('business_id', businessId);

    if (error) {
      throw error;
    }

    return { message: 'Listing deleted successfully' };
  }

  async getByBusiness(businessId: string) {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data;
  }
} 