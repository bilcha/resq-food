import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { GeoccodingService } from '../geocoding/geocoding.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(
    private databaseService: DatabaseService,
    private geoccodingService: GeoccodingService,
  ) {}

  async create(firebaseUid: string, createBusinessDto: CreateBusinessDto) {
    const supabase = this.databaseService.getClient();

    try {
      // Geocode the address to get coordinates and place information
      const geoccodingResult = await this.geoccodingService.geocodeAddress(createBusinessDto.address);
      
      if (!geoccodingResult) {
        throw new BadRequestException('Could not geocode the provided address. Please provide a valid address.');
      }

      const businessData = {
        firebase_uid: firebaseUid,
        name: createBusinessDto.name,
        email: createBusinessDto.email,
        phone: createBusinessDto.phone,
        address: geoccodingResult.formattedAddress, // Use the formatted address from Google
        latitude: geoccodingResult.latitude,
        longitude: geoccodingResult.longitude,
        google_place_id: geoccodingResult.placeId,
        description: createBusinessDto.description,
        is_active: true,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('businesses')
        .insert([businessData])
        .select()
        .single();

      if (error) {
        console.error('Business Service - Create error:', error);
        throw error;
      }

      console.log('Business Service - Create successful:', { id: data.id, name: data.name });
      return data;

    } catch (error) {
      console.error('Business Service - Create error:', error);
      throw error;
    }
  }

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

  async findByFirebaseUid(firebaseUid: string) {
    const supabase = this.databaseService.getClient();
    
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  async update(firebaseUid: string, updateBusinessDto: UpdateBusinessDto) {
    const supabase = this.databaseService.getClient();
    
    console.log('Business Service - Updating business with Firebase UID:', firebaseUid);
    console.log('Business Service - Update data:', updateBusinessDto);

    try {
      let updateData: any = {
        ...updateBusinessDto,
        updated_at: new Date().toISOString(),
      };

      // If address is being updated, geocode it
      if (updateBusinessDto.address) {
        const geoccodingResult = await this.geoccodingService.geocodeAddress(updateBusinessDto.address);
        
        if (!geoccodingResult) {
          throw new BadRequestException('Could not geocode the provided address. Please provide a valid address.');
        }

        updateData = {
          ...updateData,
          address: geoccodingResult.formattedAddress, // Use the formatted address from Google
          latitude: geoccodingResult.latitude,
          longitude: geoccodingResult.longitude,
          google_place_id: geoccodingResult.placeId,
        };
      }
    
      const { data, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('firebase_uid', firebaseUid)
        .select()
        .single();

      if (error) {
        console.error('Business Service - Update error:', error);
        console.error('Business Service - Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('Business Service - Update successful:', { id: data.id, name: data.name });
      return data;

    } catch (error) {
      console.error('Business Service - Update error:', error);
      throw error;
    }
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