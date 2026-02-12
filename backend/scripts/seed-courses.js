const { supabaseAdmin } = require('../src/lib/supabaseAdmin');

const courses = [
  {
    title: 'Python Fundamentals',
    description: 'Learn Python from scratch. Covers syntax, data structures, and basic algorithms.',
    price: 300,
    category: 'python',
    is_published: true,
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'
  },
  {
    title: 'Mastering SQL',
    description: 'Deep dive into SQL databases. Learn queries, joins, and database design.',
    price: 300,
    category: 'sql',
    is_published: true,
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'
  },
  {
    title: 'Networking Essentials',
    description: 'Understand computer networking concepts, protocols, and architecture.',
    price: 300,
    category: 'networking',
    is_published: true,
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' // Placeholder icon
  }
];

async function seedCourses() {
  console.log('Starting course seed...');

  for (const course of courses) {
    // Check if course exists by category (assuming one per category for now, or title)
    const { data: existing } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('category', course.category)
      .single();

    if (existing) {
      console.log(`Course ${course.title} (category: ${course.category}) already exists.`);
    } else {
      console.log(`Creating course: ${course.title}...`);
      const { error } = await supabaseAdmin
        .from('courses')
        .insert([course]);
      
      if (error) {
        console.error(`Error creating ${course.title}:`, error.message);
      } else {
        console.log(`Successfully created ${course.title}`);
      }
    }
  }

  console.log('Seed completed.');
}

seedCourses();
