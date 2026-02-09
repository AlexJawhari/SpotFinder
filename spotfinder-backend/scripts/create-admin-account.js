const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function createAdmin() {
    const email = 'admin@gmail.com';
    const username = 'admin';
    const password = 'Adminpassword';

    console.log(`🚀 Attempting to create user: ${username} (${email})...`);

    try {
        // 1. Check if user exists
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            console.log('✅ User already exists.');
            return;
        }

        // 2. Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // 3. Insert user
        const { data, error } = await supabase
            .from('users')
            .insert({
                email,
                username,
                password_hash: passwordHash,
                reputation_score: 999 // Mark as high rep / admin
            })
            .select()
            .single();

        if (error) {
            if (error.code === '42501') {
                console.error('❌ RLS Error: Your Supabase Key does not have permission to insert into the "users" table.');
                console.error('Please go to the Supabase Dashboard and add a policy to allow public inserts on "users" OR use the SERVICE_ROLE_KEY.');
            } else {
                console.error('❌ Database Error:', error.message);
            }
            return;
        }

        console.log('✨ Admin account created successfully!');
        console.log('Email:', email);
        console.log('Username:', username);
        console.log('Password:', password);

    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    }
}

createAdmin();
