// IP-based geolocation service using free APIs (server-side only – avoids CORS/mixed content)
// Falls back through multiple services for reliability
const axios = require('axios');

/**
 * Get user location from IP address
 * @param {string|null} clientIp - Client IP from req.ip (with trust proxy). If null, APIs use request origin.
 * @returns {Promise<{latitude: number, longitude: number, city: string, state: string, country: string}>}
 */
async function getLocationFromIP(clientIp) {
    try {
        // Try ipapi.co first (free tier: 1000 requests/day) – HTTPS, no CORS from server
        try {
            const url = clientIp ? `https://ipapi.co/${clientIp}/json/` : 'https://ipapi.co/json/';
            const response = await axios.get(url, {
                headers: { 'User-Agent': 'SpotFinder-Student-App/1.0' },
                timeout: 5000
            });

            const data = response.data;
            if (data && (data.latitude || data.lat)) {
                const lat = parseFloat(data.latitude || data.lat);
                const lng = parseFloat(data.longitude || data.lon);
                // Simple bounding box check for US (approximate)
                const isUS = data.country_code === 'US' || data.countryCode === 'US' ||
                    (lat >= 24.396308 && lat <= 49.384358 && lng >= -125.0 && lng <= -66.93457);

                if (!isNaN(lat) && !isNaN(lng) && isUS) {
                    return {
                        latitude: lat,
                        longitude: lng,
                        city: data.city || 'Unknown',
                        state: data.region || data.region_code || data.regionName || 'Unknown',
                        country: data.country_code || data.countryCode || 'US'
                    };
                }
            }
        } catch (e) {
            console.warn('ipapi.co failed, trying fallback:', e.message);
        }

        // Fallback: ip-api.com (HTTP only on free tier – fine from server, no mixed content)
        try {
            const finalUrl = clientIp
                ? `http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,region,regionName,city,lat,lon`
                : 'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,lat,lon';

            const response = await axios.get(finalUrl, {
                headers: { 'User-Agent': 'SpotFinder-Student-App/1.0' },
                timeout: 5000
            });

            const data = response.data;
            if (data.status === 'success' && data.lat && data.lon) {
                const lat = parseFloat(data.lat);
                const lng = parseFloat(data.lon);
                const isUS = data.countryCode === 'US' ||
                    (lat >= 24.396308 && lat <= 49.384358 && lng >= -125.0 && lng <= -66.93457);

                if (isUS) {
                    return {
                        latitude: lat,
                        longitude: lng,
                        city: data.city || 'Unknown',
                        state: data.regionName || data.region || 'Unknown',
                        country: data.countryCode || 'US'
                    };
                }
            }
        } catch (e) {
            console.warn('ip-api.com failed:', e.message);
        }

        // Default to Dallas if all else fails
        return {
            latitude: 32.7767,
            longitude: -96.7970,
            city: 'Dallas',
            state: 'Texas',
            country: 'US'
        };
    } catch (error) {
        console.error('IP geolocation error:', error);
        return {
            latitude: 32.7767,
            longitude: -96.7970,
            city: 'Dallas',
            state: 'Texas',
            country: 'US'
        };
    }
}

module.exports = { getLocationFromIP };
