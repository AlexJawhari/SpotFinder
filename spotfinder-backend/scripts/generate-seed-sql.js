const fs = require('fs');

// Overpass API URL
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

async function fetchOverpassData(city, type, tagKey, tagValue, limit = 5) {
    const query = `
        [out:json][timeout:25];
        area[name="${city}"]->.searchArea;
        (
          node["${tagKey}"="${tagValue}"](area.searchArea);
          way["${tagKey}"="${tagValue}"](area.searchArea);
        );
        out center ${limit};
    `;

    try {
        const response = await fetch(OVERPASS_API, {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.elements;
    } catch (error) {
        return [];
    }
}

async function generateSql() {
    console.log('Generating SQL...');

    let sql = `-- AUTO-GENERATED SEED DATA
-- Run this in Supabase SQL Editor to populate the map

-- 1. Create System User (if not exists)
INSERT INTO users (id, email, username, password_hash, profile_image)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'system@spotfinder.app', 'SpotFinderSystem', 'hash', 'https://ui-avatars.com/api/?name=System')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Locations
`;

    const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Austin', 'San Francisco'];
    const CATEGORIES = [
        { type: 'library', key: 'amenity', value: 'library', amenities: `{wifi, quiet, books}` },
        { type: 'park', key: 'leisure', value: 'park', amenities: `{nature, open_space}` },
        { type: 'cafe', key: 'amenity', value: 'cafe', amenities: `{coffee, wifi}` }
    ];

    for (const city of CITIES) {
        for (const cat of CATEGORIES) {
            const places = await fetchOverpassData(city, cat.type, cat.key, cat.value, 3);
            for (const place of places) {
                const lat = place.lat || place.center?.lat;
                const lon = place.lon || place.center?.lon;
                const name = place.tags?.name?.replace(/'/g, "''"); // Escape single quotes

                if (!lat || !lon || !name) continue;

                const street = place.tags?.['addr:street'] ? `${place.tags['addr:street']}` : 'Downtown';
                const desc = `Great ${cat.type} in ${city}`;

                sql += `
INSERT INTO locations (name, description, address, city, category, latitude, longitude, amenities, created_by)
VALUES ('${name}', '${desc}', '${street}', '${city}', '${cat.type}', ${lat}, ${lon}, '${cat.amenities}', '00000000-0000-0000-0000-000000000001');
`;
            }
        }
    }

    fs.writeFileSync('database/seed_map.sql', sql);
    console.log('Done! SQL written to database/seed_map.sql');
}

generateSql();
