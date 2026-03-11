const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin tasks
);

async function setupAdmin() {
    const email = 'admin@gmail.com';
    const username = 'admin';
    const password = 'Admin123';

    console.log(`🚀 Setting up admin account: ${email}...`);

    try {
        // 1. Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // 2. Upsert user
        // We use email as the unique identifier.
        const { data, error } = await supabase
            .from('users')
            .upsert({
                email,
                username,
                password_hash: passwordHash,
                is_admin: true,
                reputation_score: 999
            }, { onConflict: 'email' })
            .select()
            .single();

        if (error) {
            console.error('❌ Error setting up admin:', error.message);
            console.log('NOTE: Ensure you have added the "is_admin" boolean column to your "users" table in Supabase.');
            return;
        }

        console.log('✨ Admin account configured successfully!');
        console.log('Email:', email);
        console.log('is_admin:', data.is_admin);

    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    }
}

setupAdmin();
