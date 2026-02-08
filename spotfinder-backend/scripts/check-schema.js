const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function checkSchema() {
    console.log('🔍 Checking Database Schema Integrity...');

    // 1. Check for 'Events' table
    console.log('1. Testing Events Table...');
    const { data: user } = await supabase.from('users').select('id').limit(1).single();

    if (!user) {
        console.error('❌ No users found. Cannot test foreign keys.');
        return;
    }

    const { error: eventError } = await supabase.from('events').insert({
        title: 'Schema Test Event',
        start_time: new Date().toISOString(),
        created_by: user.id
    });

    if (eventError) {
        console.error('❌ Events Table Error:', eventError.message);
        if (eventError.message.includes('relation "events" does not exist')) {
            console.error('   -> Table missing.');
        } else if (eventError.message.includes('foreign key constraint')) {
            console.error('   -> Foreign Key mismatch (Likely auth.users vs public.users issue).');
        }
    } else {
        console.log('✅ Events Table OK.');
        // Cleanup
        await supabase.from('events').delete().eq('title', 'Schema Test Event');
    }

    // 2. Check for 'Groups' table
    console.log('2. Testing Groups Table...');
    const { error: groupError } = await supabase.from('groups').insert({
        name: 'Schema Test Group',
        created_by: user.id
    });

    if (groupError) {
        console.error('❌ Groups Table Error:', groupError.message);
    } else {
        console.log('✅ Groups Table OK.');
        await supabase.from('groups').delete().eq('name', 'Schema Test Group');
    }

}

checkSchema();
