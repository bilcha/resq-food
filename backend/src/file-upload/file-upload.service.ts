import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  constructor(private databaseService: DatabaseService) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'listings',
  ): Promise<string> {
    const supabase = this.databaseService.getClient();

    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const supabase = this.databaseService.getClient();

    // Extract file path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(-2).join('/'); // Get last two parts: folder/filename

    const { error } = await supabase.storage.from('images').remove([filePath]);

    if (error) {
      throw error;
    }
  }
}
