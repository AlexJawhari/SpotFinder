const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from the .env file in the parent directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log('Using Supabase URL:', process.env.SUPABASE_URL);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Overpass API URL
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Helper to fetch data from Overpass
async function fetchOverpassData(city, type, tagKey, tagValue, limit = 10) {
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

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.elements;
    } catch (error) {
        console.error(`Failed to fetch ${type} in ${city}:`, error.message);
        return [];
    }
}

// Helper to get or create a system user for attribution
async function getSystemUserId() {
    // Try to find a 'System' user
    const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'SpotFinderSystem')
        .limit(1);

    if (users && users.length > 0) {
        return users[0].id;
    }

    // Create if not exists (using random ID)
    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            email: 'system@spotfinder.app',
            username: 'SpotFinderSystem',
            password_hash: 'system_account_not_loginable',
            profile_image: 'https://ui-avatars.com/api/?name=Spot+Finder&background=0D8ABC&color=fff'
        })
        .select()
        .single();

    if (error) {
        // If email exists with diff username, fetch it
        if (error.code === '23505') {
            const { data: existing } = await supabase.from('users').select('id').eq('email', 'system@spotfinder.app').single();
            return existing.id;
        }
        console.error('Failed to create system user:', error);
        return null;
    }

    return newUser.id;
}

// Main seeding function
async function seedData() {
    console.log('🌱 Starting Data Seeding from OpenStreetMap...');

    const systemUserId = await getSystemUserId();
    if (!systemUserId) {
        console.error('❌ Could not get system user ID. Aborting.');
        return;
    }

    const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Austin', 'Seattle'];
    const CATEGORIES = [
        { type: 'library', key: 'amenity', value: 'library', amenities: ['wifi', 'quiet', 'books', 'study_space'] },
        { type: 'park', key: 'leisure', value: 'park', amenities: ['nature', 'open_space', 'family_friendly'] },
        { type: 'cafe', key: 'amenity', value: 'cafe', amenities: ['coffee', 'wifi', 'food'] }
    ];

    let totalInserted = 0;

    for (const city of CITIES) {
        console.log(`\n📍 Processing ${city}...`);

        for (const cat of CATEGORIES) {
            const places = await fetchOverpassData(city, cat.type, cat.key, cat.value, 10); // Fetch 10 per category per city
            console.log(`   Found ${places.length} ${cat.type}s`);

            for (const place of places) {
                const lat = place.lat || place.center?.lat;
                const lon = place.lon || place.center?.lon;
                const name = place.tags?.name;

                if (!lat || !lon || !name) continue;

                // Check if already exists (approximate check by name + city)
                const { data: existing } = await supabase
                    .from('locations')
                    .select('id')
                    .ilike('name', name)
                    .eq('city', city)
                    .limit(1);

                if (existing && existing.length > 0) {
                    process.stdout.write('.');
                    continue;
                }

                const location = {
                    name: name,
                    description: `A Popular ${cat.type} in ${city}. (Imported from OSM)`,
                    address: `${place.tags?.['addr:housenumber'] || ''} ${place.tags?.['addr:street'] || 'Downtown'}`,
                    city: city,
                    latitude: lat,
                    longitude: lon,
                    category: cat.type,
                    amenities: cat.amenities,
                    created_by: systemUserId,
                    images: [`https://source.unsplash.com/random/800x600?${cat.type}`]
                };

                const { error: insertError } = await supabase
                    .from('locations')
                    .insert(location);

                if (insertError) {
                    // console.error(`Failed to insert ${name}:`, insertError.message);
                } else {
                    totalInserted++;
                    process.stdout.write('+');
                }
            }
        }
    }

    console.log(`\n\n✅ Seeding Complete! Inserted ${totalInserted} new locations.`);
}

seedData();
