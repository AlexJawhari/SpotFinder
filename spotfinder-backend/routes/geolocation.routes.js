// IP-based geolocation endpoint – proxies to avoid CORS and mixed content from browser
const express = require('express');
const { getLocationFromIP } = require('../utils/ipGeolocation');

const router = express.Router();

router.get('/ip-location', async (req, res) => {
    try {
        let clientIp = req.ip;

        // Handle X-Forwarded-For for Render/Proxies
        const forwardedFor = req.headers['x-forwarded-for'];
        if (forwardedFor) {
            clientIp = forwardedFor.split(',')[0].trim();
        }

        if (!clientIp || clientIp === '::1' || clientIp === '127.0.0.1' || isPrivateIp(clientIp)) {
            // If we still have a local/private IP, we can't do much on the server.
            // But we want to avoid sending private IPs to the geolocation APIs.
            console.log('Skipping geolocation for local/private IP:', clientIp);
            return res.json(getDefaultLocation());
        }

        console.log('Final IP for geolocation:', clientIp);
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
