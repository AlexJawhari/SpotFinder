const axios = require('axios');

/**
 * Stealthy Yelp Scraper
 * Uses a search engine search to find the business information without 
 * triggering Yelp's direct Cloudflare protection as often.
 */
async function scrapeYelpData(businessName, city) {
    try {
        const query = encodeURIComponent(`${businessName} ${city} yelp`);
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
        };

        // Step 1: Search via DuckDuckGo to find the Yelp link - less likely to block
        const searchUrl = `https://duckduckgo.com/html/?q=${query}`;
        const searchResponse = await axios.get(searchUrl, { headers, timeout: 5000 });
        const searchHtml = searchResponse.data;

        // Find the first yelp.com/biz/ link
        const yelpLinkMatch = searchHtml.match(/https?:\/\/(?:www\.)?yelp\.com\/biz\/([^"&?\s]+)/);
        if (!yelpLinkMatch) {
            return { error: 'No Yelp page found for this location.', source: 'Yelp' };
        }

        const yelpUrl = yelpLinkMatch[0];
        
        // Step 2: Fetch the Yelp business page directly
        const yelpResponse = await axios.get(yelpUrl, { headers, timeout: 5000 });
        const html = yelpResponse.data;

        // Extract rating and review count
        const ratingMatch = html.match(/"ratingValue":\s*"?([\d.]+)"?/) || 
                           html.match(/aria-label="([\d.]+) star rating"/) ||
                           html.match(/([\d.]+) star rating/);
                           
        const reviewCountMatch = html.match(/"reviewCount":\s*"?(\d+)"?/) || 
                                html.match(/(\d+)\s+reviews/i) ||
                                html.match(/(\d+)\s+Reviews/);

        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
        const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[1], 10) : null;

        return {
            rating,
            reviewCount,
            yelpUrl,
            source: 'Yelp'
        };
    } catch (error) {
        console.error('Yelp scraping failed:', error.message);
        return {
            error: 'External ratings temporarily unavailable.',
            source: 'Yelp'
        };
    }
}

module.exports = { scrapeYelpData };
