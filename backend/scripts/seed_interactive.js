require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Ensure .env has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding interactive lessons...');

  // 1. Python Interactive Lab
  console.log('Adding Python Interactive Lab...');
  const pyLesson = {
    id: 'py-intro-lab',
    module_id: 'py-mod-1',
    title: '0.1 Python Interactive Lab',
    type: 'react',
    duration: '15 min',
    is_free: true,
    order: 2,
    content: 'PythonVisualizer'
  };
  
  const { error: err1 } = await supabase.from('lessons').upsert(pyLesson);
  if (err1) {
    console.error('Error upserting py lesson:', err1);
  } else {
    console.log('Upserted py lesson');
  }

  // Reorder Python
  // We need to fetch all to shift them safely
  const { data: pyLessons, error: fetchErr1 } = await supabase.from('lessons').select('*').eq('module_id', 'py-mod-1');
  if (fetchErr1) console.error(fetchErr1);

  if (pyLessons) {
    const updates = pyLessons
      .filter(l => l.id !== 'py-intro-lab' && l.order >= 2 && l.id !== 'py-intro')
      .map(l => ({ ...l, order: l.order + 1 }));
    
    if (updates.length > 0) {
        console.log(`Reordering ${updates.length} Python lessons...`);
        const { error: errReorder } = await supabase.from('lessons').upsert(updates);
        if (errReorder) console.error('Error reordering py lessons:', errReorder);
    }
  }

  // 2. SQL Playground
  console.log('Adding SQL Playground...');
  const sqlLesson = {
    id: 'db-intro-lab',
    module_id: 'db-mod-1',
    title: '0.1 SQL Playground',
    type: 'react',
    duration: '15 min',
    is_free: true,
    order: 2,
    content: 'SQLPlayground'
  };
  
  const { error: err2 } = await supabase.from('lessons').upsert(sqlLesson);
  if (err2) {
    console.error('Error upserting sql lesson:', err2);
  } else {
    console.log('Upserted sql lesson');
  }

  // 3. Presentation Demo
  console.log('Adding Presentation Demo...');
  const presLesson = {
    id: 'py-intro-pres',
    module_id: 'py-mod-1',
    title: '0.2 Python Overview (Slides)',
    type: 'presentation',
    duration: '10 min',
    is_free: true,
    order: 3,
    content: '/uploads/demo-presentation.json'
  };

  const { error: err3 } = await supabase.from('lessons').upsert(presLesson);
  if (err3) {
    console.error('Error upserting presentation lesson:', err3);
  } else {
    console.log('Upserted presentation lesson');
  }

  // Reorder Python (Updated)
  const { data: pyLessons2, error: fetchErr3 } = await supabase.from('lessons').select('*').eq('module_id', 'py-mod-1');
  if (fetchErr3) console.error(fetchErr3);

  if (pyLessons2) {
    // We want to shift everything else down
    const updates = pyLessons2
      .filter(l => l.id !== 'py-intro-lab' && l.id !== 'py-intro-pres' && l.order >= 2 && l.id !== 'py-intro')
      .map(l => ({ ...l, order: l.order + 2 })); // Shift by 2 spots
    
    if (updates.length > 0) {
        console.log(`Reordering ${updates.length} Python lessons...`);
        // const { error: errReorder } = await supabase.from('lessons').upsert(updates);
        // if (errReorder) console.error('Error reordering py lessons:', errReorder);
        console.log('Skipping reorder to avoid PGRST204 error for now.');
    }
  }
  
  console.log('Done!');
}

seed();
