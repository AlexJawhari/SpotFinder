// Thin wrapper around the Supabase client so the rest of the app has a single import.
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  // This will show up in local dev logs if env vars are missing.
  // It’s better to fail noisy here than debug silent 401s later.
  // eslint-disable-next-line no-console
  console.warn('Supabase environment variables are not set. API calls will fail until configured.');
}

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_KEY || ''
);

module.exports = { supabase };

