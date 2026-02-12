const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// In your current setup, SUPABASE_SERVICE_ROLE_KEY in .env is actually the ANON key, which is fine for signUp
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@certipro.com';
  const password = 'admin123';

  console.log(`Attempting to create/login user: ${email} with password: ${password}`);

  // Try to sign in first to see if it exists
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (!signInError && signInData.user) {
    console.log('User already exists and password is correct!');
    return;
  }

  // If sign in failed, try to sign up
  console.log('User not found or password incorrect. Attempting to create...');
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Admin User',
        role: 'admin' // Adding metadata just in case
      }
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User creation request sent.');
    if (data.user && data.user.identities && data.user.identities.length === 0) {
        console.log('User already exists (but maybe different password or provider).');
    } else {
        console.log('User created successfully!');
        console.log('NOTE: If "Confirm Email" is enabled in Supabase, you must confirm the email before logging in.');
        console.log('Check your Supabase Dashboard > Authentication > Users to verify.');
    }
  }
}

createAdmin();
