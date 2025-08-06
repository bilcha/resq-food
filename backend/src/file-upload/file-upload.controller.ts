import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileUploadService } from './file-upload.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@ApiTags('file-upload')
@Controller('upload')
export class FileUploadController {
  constructor(private fileUploadService: FileUploadService) {}

  @Post('image')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    const imageUrl = await this.fileUploadService.uploadImage(file, folder);
    return { imageUrl };
  }

  @Delete('image')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete an image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteImage(@Body('imageUrl') imageUrl: string) {
    await this.fileUploadService.deleteImage(imageUrl);
    return { message: 'Image deleted successfully' };
  }
}
