import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@ApiTags('business')
@Controller('business')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @Get()
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiResponse({ status: 200, description: 'List of businesses retrieved successfully' })
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

  @Put('profile')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update business profile' })
  @ApiResponse({ status: 200, description: 'Business profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Request() req, @Body() updateData: any) {
    console.log('Business Controller - User object:', req.user);
    console.log('Business Controller - User ID:', req.user?.id);
    return this.businessService.update(req.user.id, updateData);
  }

  @Post(':id/rating')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update Google rating for business' })
  @ApiResponse({ status: 200, description: 'Google rating updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateGoogleRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('placeId') placeId: string,
  ) {
    return this.businessService.updateGoogleRating(id, rating, placeId);
  }
} 