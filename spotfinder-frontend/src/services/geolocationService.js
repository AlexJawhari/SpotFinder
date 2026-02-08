import api from './api';

export const geolocationService = {
    // Uses backend proxy to avoid CORS (ipapi.co) and mixed content (ip-api.com HTTP on HTTPS pages)
    getLocationFromIP: async () => {
        try {
            const { data } = await api.get('/geolocation/ip-location');
            return data;
        } catch (error) {
            return {
                latitude: 32.7767,
                longitude: -96.7970,
                city: 'Dallas',
                state: 'Texas',
                country: 'US'
            };
        }
    }
};
