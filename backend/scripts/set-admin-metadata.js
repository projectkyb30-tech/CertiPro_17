const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { supabaseAdmin } = require('../src/lib/supabaseAdmin');

async function setAdminMetadata() {
  try {
    const email = process.env.ADMIN_EMAIL;
    if (!email) {
      console.error('ADMIN_EMAIL is not set in backend/.env');
      process.exit(1);
    }

    console.log(`Searching for user with email: ${email}`);

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 100,
      email
    });

    if (error) {
      console.error('Error listing users:', error.message);
      process.exit(1);
    }

    const users = data?.users || [];
    const user = users.find((u) => u.email === email);

    if (!user) {
      console.error(`No user found with email ${email}`);
      process.exit(1);
    }

    const currentAppMeta = user.app_metadata || {};
    const currentUserMeta = user.user_metadata || {};

    const updates = {
      app_metadata: {
        ...currentAppMeta,
        role: 'admin'
      },
      user_metadata: {
        ...currentUserMeta,
        is_admin: true
      }
    };

    console.log('Updating user metadata for', email);

    const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      updates
    );

    if (updateError) {
      console.error('Failed to update user metadata:', updateError.message);
      process.exit(1);
    }

    console.log('Admin metadata set successfully for', updated.email);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error while setting admin metadata:', err.message);
    process.exit(1);
  }
}

setAdminMetadata();
