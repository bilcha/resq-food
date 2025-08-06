import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(FirebaseAuthGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('pending-listings')
  @ApiOperation({ summary: 'Get pending listings for approval' })
  @ApiResponse({
    status: 200,
    description: 'Pending listings retrieved successfully',
  })
  async getPendingListings() {
    return this.adminService.getPendingListings();
  }

  @Post('approve-listing/:id')
  @ApiOperation({ summary: 'Approve a listing' })
  @ApiResponse({ status: 200, description: 'Listing approved successfully' })
  async approveListing(@Param('id') id: string) {
    return this.adminService.approveListing(id);
  }

  @Post('reject-listing/:id')
  @ApiOperation({ summary: 'Reject a listing' })
  @ApiResponse({ status: 200, description: 'Listing rejected successfully' })
  async rejectListing(@Param('id') id: string) {
    return this.adminService.rejectListing(id);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics dashboard data' })
  @ApiResponse({
    status: 200,
    description: 'Analytics data retrieved successfully',
  })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }
}
