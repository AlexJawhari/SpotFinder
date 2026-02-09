// IP-based geolocation endpoint – proxies to avoid CORS and mixed content from browser
const express = require('express');
const { getLocationFromIP } = require('../utils/ipGeolocation');

const router = express.Router();

router.get('/ip-location', async (req, res) => {
    try {
        const clientIp = req.ip || req.connection?.remoteAddress || null;
        // Debug logging for Render
        console.log('Detected IP:', clientIp);
        console.log('X-Forwarded-For:', req.headers['x-forwarded-for']);

        const location = await getLocationFromIP(clientIp);
        res.json(location);
    } catch (error) {
        console.error('Geolocation error:', error);
        res.json({
            latitude: 32.7767,
            longitude: -96.7970,
            city: 'Dallas',
            state: 'Texas',
            country: 'US'
        });
    }
});

module.exports = router;
