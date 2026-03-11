const axios = require('axios');

/**
 * Stealthy Yelp Scraper
 * Uses a search engine search to find the business information without 
 * triggering Yelp's direct Cloudflare protection as often.
 */
async function scrapeYelpData(businessName, city) {
    try {
        const query = encodeURIComponent(`${businessName} ${city} yelp`);
        // Use a generic user agent to look like a browser
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        };

        // We'll try to find the Yelp page first via Bing/DuckDuckGo or direct Yelp search
        // For simplicity and speed in this demo, we'll try to hit the Yelp search page directly 
        // with a mobile user agent which sometimes has fewer blocks.
        const yelpSearchUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(businessName)}&find_loc=${encodeURIComponent(city)}`;
        
        const response = await axios.get(yelpSearchUrl, { headers, timeout: 5000 });
        const html = response.data;

        // Simplified extraction using regex - improved to catch more variations
        const ratingMatch = html.match(/"ratingValue":\s*"?([\d.]+)"?/) || 
                           html.match(/aria-label="([\d.]+) star rating"/) ||
                           html.match(/([\d.]+) star rating/);
                           
        const reviewCountMatch = html.match(/"reviewCount":\s*"?(\d+)"?/) || 
                                html.match(/(\d+)\s+reviews/i);

        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
        const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[1], 10) : null;

        // Also try to find a link to the actual yelp page
        const yelpLinkMatch = html.match(/href="(\/biz\/[^"]+)"/);
        const yelpUrl = yelpLinkMatch ? `https://www.yelp.com${yelpLinkMatch[1]}` : null;

        return {
            rating,
            reviewCount,
            yelpUrl,
            source: 'Yelp'
        };
    } catch (error) {
        console.error('Yelp scraping failed:', error.message);
        return {
            error: 'Could not fetch external reviews at this time.',
            source: 'Yelp'
        };
    }
}

module.exports = { scrapeYelpData };
