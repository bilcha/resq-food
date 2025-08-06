import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

@ApiTags('business')
@Controller('business')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiResponse({
    status: 200,
    description: 'List of businesses retrieved successfully',
  })
  async findAll() {
    return this.businessService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business by ID' })
  @ApiResponse({ status: 200, description: 'Business retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new business with address geocoding' })
  @ApiResponse({ status: 201, description: 'Business created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid address or validation failed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createBusinessDto: CreateBusinessDto) {
    console.log(
      'Business Controller - Create business for user:',
      req.user?.id,
    );
    console.log('Business Controller - Create data:', createBusinessDto);
    return this.businessService.create(
      req.user.firebase_uid,
      createBusinessDto,
    );
  }

  @Put('profile')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update business profile with optional address geocoding',
  })
  @ApiResponse({
    status: 200,
    description: 'Business profile updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid address or validation failed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Request() req,
    @Body() updateBusinessDto: UpdateBusinessDto,
  ) {
    console.log('Business Controller - User object:', req.user);
    console.log(
      'Business Controller - User Firebase UID:',
      req.user?.firebase_uid,
    );
    return this.businessService.update(
      req.user.firebase_uid,
      updateBusinessDto,
    );
  }

  @Post(':id/rating')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update Google rating for business' })
  @ApiResponse({
    status: 200,
    description: 'Google rating updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateGoogleRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('placeId') placeId: string,
  ) {
    return this.businessService.updateGoogleRating(id, rating, placeId);
  }
}
