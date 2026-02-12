
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Manual .env parser
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
      env[key] = value;
    }
  });
  return env;
}

// Load env vars from root .env and backend/.env
const rootEnv = parseEnv(path.join(rootDir, '.env'));
const backendEnv = parseEnv(path.join(rootDir, 'backend', '.env'));

const env = { ...rootEnv, ...backendEnv };

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
// Try to find the service role key
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials.');
  console.error('URL found:', !!supabaseUrl);
  console.error('Service Key found:', !!supabaseServiceKey);
  process.exit(1);
}

console.log('🔌 Connecting to Supabase...');
// console.log('URL:', supabaseUrl); 

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function inspectDB() {
  try {
    console.log('🔍 Inspecting database tables...');

    // Since we can't query information_schema directly with supabase-js easily without raw sql access
    // (unless we use the REST API to query a view, but standard setup restricts this),
    // we will try to list common tables we expect to see.
    
    // We'll try to select 1 row from each expected table to see if it exists.
    const expectedTables = [
      'profiles', 
      'courses', 
      'modules', 
      'lessons', 
      'enrollments', 
      'payments', 
      'user_progress'
    ];
    
    const existingTables = [];
    const missingTables = [];

    for (const table of expectedTables) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (!error) {
        existingTables.push(table);
      } else {
        // console.log(`Error checking ${table}:`, error.message);
        missingTables.push(table);
      }
    }

    console.log('\n📊 REPORT:');
    console.log('--------------------------------------------------');
    if (existingTables.length > 0) {
      console.log('✅ EXISTING TABLES (Found):');
      existingTables.forEach(t => console.log(`   - ${t}`));
    }
    
    if (missingTables.length > 0) {
      console.log('\n❌ MISSING TABLES (Not Found):');
      missingTables.forEach(t => console.log(`   - ${t}`));
    }
    console.log('--------------------------------------------------');

    if (missingTables.length === expectedTables.length) {
      console.log('⚠️  It looks like the database is EMPTY or keys are invalid.');
    } else if (missingTables.includes('enrollments')) {
      console.log('💡 "enrollments" table is missing. You need to run the new setup script!');
    } else {
      console.log('✅ Database structure looks partially or fully ready.');
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

inspectDB();
