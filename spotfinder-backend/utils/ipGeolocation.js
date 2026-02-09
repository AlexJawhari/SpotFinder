// IP-based geolocation service using free APIs (server-side only – avoids CORS/mixed content)
// Falls back through multiple services for reliability
const axios = require('axios');

/**
 * Get user location from IP address
 * @param {string|null} clientIp - Client IP from req.ip (with trust proxy). If null, APIs use request origin.
 * @returns {Promise<{latitude: number, longitude: number, city: string, state: string, country: string}>}
 */
async function getLocationFromIP(clientIp) {
    // Handle localhost/private IPs explicitly to avoid wasted API calls
    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp?.startsWith('192.168.') || clientIp?.startsWith('10.')) {
        console.log('Local/Private IP detected:', clientIp);
        // We could return null here to let the frontend ask for browser geolocation, 
        // but for now we'll return a default so the map works.
    }

    try {
        // Service 1: ipapi.co (HTTPS, JSON)
        try {
            const url = (clientIp && !isPrivateIp(clientIp)) ? `https://ipapi.co/${clientIp}/json/` : 'https://ipapi.co/json/';
            const response = await axios.get(url, {
                headers: { 'User-Agent': 'SpotFinder-Student-App/1.0' },
                timeout: 3000 // Short timeout to fail fast
            });

            const data = response.data;
            if (isValidLocation(data)) {
                // The original code had a US check here. Now formatLocation will handle it.
                const formatted = formatLocation(data);
                if (isUSLocation(formatted.latitude, formatted.longitude, formatted.country)) {
                    return formatted;
                }
            }
        } catch (e) {
            console.warn(`ipapi.co failed (${e.message}). Trying fallback...`);
        }

        // Service 2: ip-api.com (HTTP, JSON)
        try {
            const baseUrl = 'http://ip-api.com/json/';
            const query = '?fields=status,message,country,countryCode,region,regionName,city,lat,lon';
            const finalUrl = (clientIp && !isPrivateIp(clientIp)) ? `${baseUrl}${clientIp}${query}` : `${baseUrl}${query}`;

            const response = await axios.get(finalUrl, {
                headers: { 'User-Agent': 'SpotFinder-Student-App/1.0' },
                timeout: 3000
            });

            const data = response.data;
            if (data.status === 'success' && data.lat && data.lon) {
                if (isUSLocation(data.lat, data.lon, data.countryCode)) {
                    return {
                        latitude: data.lat,
                        longitude: data.lon,
                        city: data.city || 'Unknown',
                        state: data.regionName || data.region || 'Unknown',
                        country: data.countryCode || 'US'
                    };
                }
            }
        } catch (e) {
            console.warn(`ip-api.com failed (${e.message}).`);
        }

        console.warn('All geolocation services failed or returned non-US location. Defaulting to Dallas.');
        return getDefaultLocation();

    } catch (error) {
        console.error('Critical IP geolocation error:', error);
        return getDefaultLocation();
    }
}

function isPrivateIp(ip) {
    return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.');
}

function isValidLocation(data) {
    return data && (data.latitude || data.lat) && (data.longitude || data.lon);
}

function isUSLocation(lat, lng, countryCode) {
    // Basic bounding box for US (continental + parts of Alaska/Hawaii)
    // and check country code if available
    if (countryCode === 'US') return true;

    // Fallback bbox check
    return (lat >= 24.0 && lat <= 49.5 && lng >= -125.0 && lng <= -66.0);
}

function formatLocation(data) {
    const lat = parseFloat(data.latitude || data.lat);
    const lng = parseFloat(data.longitude || data.lon);

    // If outside US, fallback to Dallas (as per project requirement to focus on US/Dallas for MVP)
    // Or we could return the actual location if we wanted to support global.
    // For now, let's allow actual location if it's broadly valid, but prefer US.

    return {
        latitude: lat,
        longitude: lng,
        city: data.city || 'Unknown',
        state: data.region || data.region_code || data.regionName || 'Unknown',
        country: data.country_code || data.countryCode || 'US'
    };
}

function getDefaultLocation() {
    return {
        latitude: 32.7767,
        longitude: -96.7970,
        city: 'Dallas',
        state: 'Texas',
        country: 'US'
    };
}

module.exports = { getLocationFromIP };
