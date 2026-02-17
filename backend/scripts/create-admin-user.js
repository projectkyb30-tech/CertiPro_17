const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD in environment');
    process.exit(1);
  }

  console.log(`Attempting to create/login user: ${email}`);

  // Try to sign in first to see if it exists
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (!signInError && signInData.user) {
    console.log('User already exists and password is correct!');
    // Ensure admin flag on user_metadata for backend authorization
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: { is_admin: true }
    });
    if (updateError) {
      console.warn('Failed to set is_admin on user_metadata:', updateError.message);
    } else {
      console.log('Admin flag set on user_metadata.');
    }
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
        role: 'admin' // informational; backend checks is_admin in user_metadata
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
        // Try to sign in to set admin flag if confirmation not required
        const { data: postSignIn, error: postSignInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (!postSignInError && postSignIn?.user) {
          const { error: postUpdateError } = await supabase.auth.updateUser({
            data: { is_admin: true }
          });
          if (postUpdateError) {
            console.warn('Failed to set is_admin after sign up:', postUpdateError.message);
          } else {
            console.log('Admin flag set on user_metadata after sign up.');
          }
        } else {
          console.log('Cannot sign in immediately (email confirmation likely required). Set is_admin after confirming email.');
        }
    }
  }
}

createAdmin();
