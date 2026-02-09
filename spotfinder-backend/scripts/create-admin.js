const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function setAdmin(email) {
    console.log(`Setting ${email} as admin...`);
    
    // In our current code, the admin is actually hardcoded in the controllers 
    // to search for specific emails. However, you can use this script to 
    // verify the user exists or update a database flag if you add one later.
    
    const { data, error } = await supabase
        .from('users')
        .select('id, username')
        .eq('email', email)
        .single();
        
    if (error || !data) {
        console.error('User not found!');
        return;
    }
    
    console.log(`User found: ${data.username} (${data.id})`);
    console.log('---');
    console.log('CRITICAL: To enable admin powers for this user, ensure their email matches the one in:');
    console.log('1. spotfinder-backend/controllers/groupController.js (deleteGroup)');
    console.log('2. spotfinder-frontend/src/components/common/ModerationControls.jsx');
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node scripts/create-admin.js your-email@example.com');
} else {
    setAdmin(email);
}
