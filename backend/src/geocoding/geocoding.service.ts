import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@googlemaps/google-maps-services-js';

export interface GeoccodingResult {
  latitude: number;
  longitude: number;
  placeId: string;
  formattedAddress: string;
}

@Injectable()
export class GeoccodingService {
  private readonly logger = new Logger(GeoccodingService.name);
  private readonly googleMapsClient: Client;

  constructor(private configService: ConfigService) {
    this.googleMapsClient = new Client({});
    this.validateApiKeySetup();
  }

  private validateApiKeySetup() {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

    if (!apiKey) {
      this.logger.error('Google Maps API key not configured');
      throw new Error(
        'Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY in your .env file.',
      );
    }

    if (apiKey.length < 30) {
      this.logger.warn('Google Maps API key appears to be invalid (too short)');
    }

    this.logger.log('Google Maps API key configured successfully');
  }

  async geocodeAddress(address: string): Promise<GeoccodingResult | null> {
    try {
      const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

      this.logger.log(`Geocoding address: ${address}`);

      const response = await this.googleMapsClient.geocode({
        params: {
          address,
          key: apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        this.logger.error(
          `Geocoding failed with status: ${response.data.status}`,
        );
        if (response.data.error_message) {
          this.logger.error(`Error message: ${response.data.error_message}`);
        }

        // Provide helpful error messages for common issues
        if (response.data.status === 'REQUEST_DENIED') {
          const errorMsg = response.data.error_message || '';
          if (errorMsg.includes('referer restrictions')) {
            throw new Error(
              'API key has referrer restrictions that prevent server-side usage. Please create a server-side API key or remove referrer restrictions.',
            );
          } else if (errorMsg.includes('API key not valid')) {
            throw new Error(
              'Invalid API key. Please check your GOOGLE_MAPS_API_KEY in .env file.',
            );
          } else {
            throw new Error(`Request denied: ${errorMsg}`);
          }
        }

        return null;
      }

      const results = response.data.results;
      if (results.length === 0) {
        this.logger.warn(`No results found for address: ${address}`);
        return null;
      }

      const result = results[0];
      const location = result.geometry.location;

      const geoccodingResult: GeoccodingResult = {
        latitude: location.lat,
        longitude: location.lng,
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
      };

      this.logger.log(
        `Geocoding successful for address: ${address}`,
        geoccodingResult,
      );
      return geoccodingResult;
    } catch (error) {
      this.logger.error(`Error geocoding address: ${address}`, error);
      throw new Error(`Failed to geocode address: ${error.message}`);
    }
  }

  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<GeoccodingResult | null> {
    try {
      const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

      this.logger.log(
        `Reverse geocoding coordinates: ${latitude}, ${longitude}`,
      );

      const response = await this.googleMapsClient.reverseGeocode({
        params: {
          latlng: { lat: latitude, lng: longitude },
          key: apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        this.logger.error(
          `Reverse geocoding failed with status: ${response.data.status}`,
        );
        if (response.data.error_message) {
          this.logger.error(`Error message: ${response.data.error_message}`);
        }
        return null;
      }

      const results = response.data.results;
      if (results.length === 0) {
        this.logger.warn(
          `No results found for coordinates: ${latitude}, ${longitude}`,
        );
        return null;
      }

      const result = results[0];
      const location = result.geometry.location;

      const geoccodingResult: GeoccodingResult = {
        latitude: location.lat,
        longitude: location.lng,
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
      };

      this.logger.log(
        `Reverse geocoding successful for coordinates: ${latitude}, ${longitude}`,
        geoccodingResult,
      );
      return geoccodingResult;
    } catch (error) {
      this.logger.error(
        `Error reverse geocoding coordinates: ${latitude}, ${longitude}`,
        error,
      );
      throw new Error(
        `Failed to reverse geocode coordinates: ${error.message}`,
      );
    }
  }
}
