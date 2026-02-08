// IP-based geolocation service using free APIs (server-side only – avoids CORS/mixed content)
// Falls back through multiple services for reliability

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
            const response = await fetch(url, {
                headers: { 'User-Agent': 'SpotFinder-Student-App/1.0' }
            });

            if (response.ok) {
                const data = await response.json();
                const lat = parseFloat(data.latitude);
                const lng = parseFloat(data.longitude);
                const isUS = data.country_code === 'US' ||
                    (lat >= 24.396308 && lat <= 49.384358 && lng >= -125.0 && lng <= -66.93457);

                if (lat && lng && isUS) {
                    return {
                        latitude: lat,
                        longitude: lng,
                        city: data.city || 'Unknown',
                        state: data.region || data.region_code || 'Unknown',
                        country: data.country_code || 'US'
                    };
                }
            }
        } catch (e) {
            // ipapi.co failed, try fallback
        }

        // Fallback: ip-api.com (HTTP only on free tier – fine from server, no mixed content)
        try {
            const finalUrl = clientIp
                ? `http://ip-api.com/json/${clientIp}?fields=status,message,country,countryCode,region,regionName,city,lat,lon`
                : 'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,lat,lon';
            const response = await fetch(finalUrl, {
                headers: { 'User-Agent': 'SpotFinder-Student-App/1.0' }
            });

            if (response.ok) {
                const data = await response.json();
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
            }
        } catch (e) {
            // ip-api.com failed
        }

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
