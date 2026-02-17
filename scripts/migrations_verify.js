import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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

// Load env vars from root .env and backend/.env
const rootEnv = parseEnv(path.join(rootDir, '.env'));
const backendEnv = parseEnv(path.join(rootDir, 'backend', '.env'));
const env = { ...rootEnv, ...backendEnv };

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;

function logSection(title) {
  console.log('\n' + title);
  console.log(''.padEnd(title.length, '-'));
}

async function verifyDatabaseConnectivity() {
  logSection('DATABASE CONNECTIVITY');
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing Supabase credentials (URL or Service Role Key).');
    return { ok: false };
  }
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    // Attempt a trivial query to validate connectivity
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('⚠️ Connected, but table "profiles" not accessible:', error.message);
      return { ok: true, warning: 'profiles not accessible' };
    }
    console.log('✅ Connected to Supabase and basic query succeeded.');
    return { ok: true };
  } catch (e) {
    console.log('❌ Failed to initialize Supabase client:', e.message);
    return { ok: false, error: e.message };
  }
}

function verifySqlMigrations() {
  logSection('SQL MIGRATIONS ORDER & DRIFT');
  const dbDir = path.join(rootDir, 'db');
  if (!fs.existsSync(dbDir)) {
    console.log('❌ db/ directory not found.');
    return { ok: false };
  }
  const files = fs.readdirSync(dbDir)
    .filter(f => f.toLowerCase().endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.log('⚠️ No SQL migration files found in db/.');
    return { ok: true, files: [] };
  }

  const issues = [];
  const prefixes = new Map();

  files.forEach((file) => {
    const m = file.match(/^(\d+)[-_]/); // e.g. 01_master_setup.sql or 12-security.sql
    if (!m) {
      issues.push(`File "${file}" lacks numeric prefix (expected NN_ or NN-).`);
      return;
    }
    const num = parseInt(m[1], 10);
    if (prefixes.has(num)) {
      issues.push(`Duplicate numeric prefix ${num} for files "${prefixes.get(num)}" and "${file}".`);
    } else {
      prefixes.set(num, file);
    }
  });

  // Check sequence continuity (optional; allow gaps but warn)
  const sortedNums = [...prefixes.keys()].sort((a, b) => a - b);
  for (let i = 1; i < sortedNums.length; i++) {
    const prev = sortedNums[i - 1];
    const curr = sortedNums[i];
    if (curr !== prev + 1) {
      issues.push(`Non-contiguous migration numbers: ${prev} -> ${curr}. Consider renumbering for clarity.`);
    }
  }

  console.log('🗂️ Migrations detected:');
  files.forEach(f => console.log('  - ' + f));

  if (issues.length) {
    console.log('\n❌ Issues:');
    issues.forEach(issue => console.log('  - ' + issue));
    return { ok: false, issues, files };
  }

  console.log('✅ Migrations use consistent numeric prefixes; no duplicates found.');
  return { ok: true, files };
}

async function main() {
  console.log('=== MIGRATIONS VERIFICATION REPORT ===');
  const db = await verifyDatabaseConnectivity();
  const mig = verifySqlMigrations();

  const ok = (db.ok !== false) && (mig.ok !== false);
  console.log('\nRESULT:', ok ? '✅ PASSED' : '❌ ATTENTION REQUIRED');
  process.exit(ok ? 0 : 1);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
