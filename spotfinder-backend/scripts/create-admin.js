const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

async function createAdmin() {
    const email = 'alexjw99@gmail.com';
    const password = 'AdminPassword123!';
    const username = 'AdminAlex';

    console.log(`Setting up admin user: ${email}...`);

    const passwordHash = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
        .from('users')
        .upsert({
            email,
            username,
            password_hash: passwordHash,
            reputation_score: 1000,
            profile_image: 'https://ui-avatars.com/api/?name=Admin+Alex&background=0D8ABC&color=fff'
        }, { onConflict: 'email' })
        .select()
        .single();

    if (error) {
        console.error('Error creating admin:', error);
    } else {
        console.log('Admin user ready!');
        console.log('Email:', email);
        console.log('Password:', password);
    }
}

createAdmin();
