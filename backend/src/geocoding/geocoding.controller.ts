import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GeoccodingService } from './geocoding.service';

@ApiTags('geocoding')
@Controller('geocoding')
export class GeoccodingController {
  constructor(private geoccodingService: GeoccodingService) {}

  @Get('test')
  @ApiOperation({ 
    summary: 'Test geocoding by address (No authentication required)',
    description: 'Convert an address to coordinates using Google Maps API. For testing purposes only.' 
  })
  @ApiQuery({ 
    name: 'address', 
    description: 'Address to geocode', 
    example: '123 Main St, New York, NY 10001' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Address geocoded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            placeId: { type: 'string' },
            formattedAddress: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid address or missing address parameter' })
  @ApiResponse({ status: 500, description: 'Geocoding service error' })
  async testGeocode(@Query('address') address: string) {
    if (!address) {
      throw new BadRequestException('Address parameter is required');
    }

    try {
      const result = await this.geoccodingService.geocodeAddress(address);
      
      if (!result) {
        return {
          success: false,
          error: 'Could not geocode the provided address. Please check if the address is valid.',
          input: address
        };
      }

      return {
        success: true,
        data: {
          latitude: result.latitude,
          longitude: result.longitude,
          placeId: result.placeId,
          formattedAddress: result.formattedAddress
        },
        input: address
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        input: address
      };
    }
  }

  @Get('reverse-test')
  @ApiOperation({ 
    summary: 'Test reverse geocoding by coordinates (No authentication required)',
    description: 'Convert coordinates to address using Google Maps API. For testing purposes only.' 
  })
  @ApiQuery({ 
    name: 'lat', 
    description: 'Latitude', 
    example: '40.7128' 
  })
  @ApiQuery({ 
    name: 'lng', 
    description: 'Longitude', 
    example: '-74.0060' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Coordinates reverse geocoded successfully' 
  })
  @ApiResponse({ status: 400, description: 'Invalid coordinates or missing parameters' })
  async testReverseGeocode(@Query('lat') lat: string, @Query('lng') lng: string) {
    if (!lat || !lng) {
      throw new BadRequestException('Both lat and lng parameters are required');
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid coordinates. Latitude and longitude must be valid numbers.');
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Invalid latitude. Must be between -90 and 90.');
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Invalid longitude. Must be between -180 and 180.');
    }

    try {
      const result = await this.geoccodingService.reverseGeocode(latitude, longitude);
      
      if (!result) {
        return {
          success: false,
          error: 'Could not reverse geocode the provided coordinates.',
          input: { latitude, longitude }
        };
      }

      return {
        success: true,
        data: {
          latitude: result.latitude,
          longitude: result.longitude,
          placeId: result.placeId,
          formattedAddress: result.formattedAddress
        },
        input: { latitude, longitude }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        input: { latitude, longitude }
      };
    }
  }
} 