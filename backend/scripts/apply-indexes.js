const { supabaseAdmin } = require('../src/lib/supabaseAdmin');

async function applyIndexes() {
  console.log('Applying performance indexes...');
  
  const queries = [
    'CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);',
    'CREATE INDEX IF NOT EXISTS idx_user_purchases_created_at ON user_purchases(created_at);',
    'CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);'
  ];

  for (const query of queries) {
    try {
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: query });
      if (error) {
        // If RPC is not available, we might need another way or just log it
        console.warn(`Could not apply index via RPC: ${query}`, error.message);
        console.info('Please apply this index manually in the Supabase SQL Editor.');
      } else {
        console.log(`Successfully applied: ${query}`);
      }
    } catch (err) {
      console.error(`Error applying index: ${query}`, err.message);
    }
  }
}

applyIndexes();
