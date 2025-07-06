import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListingService } from './listing.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@ApiTags('listings')
@Controller('listings')
export class ListingController {
  constructor(private listingService: ListingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all listings' })
  @ApiResponse({ status: 200, description: 'List of listings retrieved successfully' })
  async findAll(@Query() filters: any) {
    return this.listingService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID' })
  @ApiResponse({ status: 200, description: 'Listing retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async findOne(@Param('id') id: string) {
    return this.listingService.findOne(id);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create new listing' })
  @ApiResponse({ status: 201, description: 'Listing created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() listingData: any) {
    return this.listingService.create(req.user.id, listingData);
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update listing' })
  @ApiResponse({ status: 200, description: 'Listing updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(@Param('id') id: string, @Request() req, @Body() updateData: any) {
    return this.listingService.update(id, req.user.id, updateData);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete listing' })
  @ApiResponse({ status: 200, description: 'Listing deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.listingService.delete(id, req.user.id);
  }

  @Get('business/:businessId')
  @ApiOperation({ summary: 'Get listings by business ID' })
  @ApiResponse({ status: 200, description: 'Business listings retrieved successfully' })
  async getByBusiness(@Param('businessId') businessId: string) {
    return this.listingService.getByBusiness(businessId);
  }
} 