import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BusinessService {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async update(id: string, updateData: any) {
    const supabase = this.databaseService.getClient();
    
    console.log('Business Service - Updating business with ID:', id);
    console.log('Business Service - Update data:', updateData);
    
    const { data, error } = await supabase
      .from('businesses')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Business Service - Update error:', error);
      console.error('Business Service - Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Business Service - Update successful:', { id: data.id, name: data.name });
    return data;
  }

  async updateGoogleRating(businessId: string, rating: number, placeId: string) {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .update({
        google_rating: rating,
        google_place_id: placeId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
} 