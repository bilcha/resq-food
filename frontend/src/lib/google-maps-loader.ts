import { Loader } from '@googlemaps/js-api-loader';

let loaderInstance: Loader | null = null;
let loadPromise: Promise<typeof google> | null = null;

export const getGoogleMapsLoader = (): Loader => {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places'],
      language: 'uk', // Ukrainian language
      region: 'UA', // Ukraine region for location bias
    });
  }
  return loaderInstance;
};

export const loadGoogleMaps = (): Promise<typeof google> => {
  if (!loadPromise) {
    const loader = getGoogleMapsLoader();
    loadPromise = loader.load();
  }
  return loadPromise;
};

export default { getGoogleMapsLoader, loadGoogleMaps };
