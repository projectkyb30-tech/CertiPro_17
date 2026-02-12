
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
      env[key] = value;
    }
  });
  return env;
}

const rootEnv = parseEnv(path.join(rootDir, '.env'));
const backendEnv = parseEnv(path.join(rootDir, 'backend', '.env'));
const env = { ...rootEnv, ...backendEnv };

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function inspectSchemaVersion() {
  try {
    console.log('🔍 Checking Schema Version...');

    // Check 'courses' table columns by trying to select them
    const { data: dataPublished, error: errorPublished } = await supabase
      .from('courses')
      .select('is_published')
      .limit(1);

    const { data: dataLocked, error: errorLocked } = await supabase
      .from('courses')
      .select('is_locked')
      .limit(1);

    console.log('\n📊 COLUMN CHECK:');
    
    let isNewSchema = false;
    let isOldSchema = false;

    if (!errorPublished) {
      console.log('✅ Found "is_published" column (New Schema Indicator)');
      isNewSchema = true;
    } else {
      console.log('❌ Missing "is_published" column');
    }

    if (!errorLocked) {
      console.log('✅ Found "is_locked" column (Old Schema Indicator)');
      isOldSchema = true;
    } else {
      console.log('❌ Missing "is_locked" column');
    }

    console.log('\n📝 CONCLUSION:');
    if (isNewSchema && !isOldSchema) {
      console.log('🚀 DATABASE IS UP TO DATE (New Schema Active)');
    } else if (isOldSchema && !isNewSchema) {
      console.log('⚠️  DATABASE IS OLD (Needs Reset Script)');
    } else if (isNewSchema && isOldSchema) {
      console.log('⚠️  DATABASE IS HYBRID (Mixed Columns - Recommend Reset)');
    } else {
      console.log('❓ Unknown State');
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

inspectSchemaVersion();
