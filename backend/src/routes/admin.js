const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { supabaseAdmin } = require('../lib/supabaseAdmin');
const { 
  validate, 
  courseSchema, 
  updateCourseSchema, 
  userUpdateSchema,
  createModuleSchema,
  createLessonSchema
} = require('../utils/validation');

// Middleware for all admin routes
router.use(authenticateUser);
router.use(requireAdmin);

// --- Stats ---
router.get('/stats', async (req, res) => {
  try {
    // Real DB Stats
    const { count: usersCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
    const { count: coursesCount } = await supabaseAdmin.from('courses').select('*', { count: 'exact', head: true });
    
    // Revenue logic: 300 Euro per user
    const totalRevenue = (usersCount || 0) * 300;

    // Get monthly user growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months + current
    
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('created_at')
      .gte('created_at', sixMonthsAgo.toISOString());

    // Group by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};
    
    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = months[d.getMonth()];
      monthlyData[key] = { name: key, users: 0, revenue: 0 };
    }

    profiles?.forEach(p => {
      const date = new Date(p.created_at);
      const key = months[date.getMonth()];
      if (monthlyData[key]) {
        monthlyData[key].users += 1;
        monthlyData[key].revenue += 300;
      }
    });

    // Convert to array and reverse to chronological order
    const chartData = Object.values(monthlyData).reverse();

    const stats = {
      totalUsers: usersCount || 0,
      activeCourses: coursesCount || 0,
      totalRevenue: totalRevenue,
      chartData: chartData,
      recentActivity: [
        { id: 1, action: 'System Ready', user: 'System', time: new Date() }
      ]
    };
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// --- Users ---
router.get('/users', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
    page: parseInt(page),
    perPage: parseInt(limit)
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json(users);
});

// Delete User
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'User deleted' });
});

// Update User
router.put('/users/:id', validate(userUpdateSchema), async (req, res) => {
  const { id } = req.params;
  const { role, banned } = req.body;
  
  const updates = {};
  if (role) updates.user_metadata = { role };
  if (banned !== undefined) updates.ban_duration = banned ? '876000h' : 'none';

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updates);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// --- Bulk Operations ---

// Bulk Delete Users
router.post('/users/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  
  const results = [];
  for (const id of ids) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) results.push({ id, status: 'failed', error: error.message });
    else results.push({ id, status: 'success' });
  }
  
  res.json({ message: 'Bulk delete processed', results });
});

// Bulk Delete Courses
router.post('/courses/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });

  const { error } = await supabaseAdmin
    .from('courses')
    .delete()
    .in('id', ids);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, count: ids.length });
});

// --- Courses Management ---

// List all courses
router.get('/courses', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, modules(*)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create Course
router.post('/courses', validate(courseSchema), async (req, res) => {
  const { title, description, price, icon, category } = req.body;
  
  // Default icon to category if not provided, to ensure frontend renders correct icon
  const courseIcon = icon || category || 'python';

  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert([{ title, description, price, icon: courseIcon, category, is_published: false }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get Course Details
router.get('/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, modules(*, lessons(*))')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Update Course with Nested Modules & Lessons
router.put('/courses/:id', validate(updateCourseSchema), async (req, res) => {
  const { id } = req.params;
  const { modules, ...courseData } = req.body;
  
  // 1. Update Course Base Data
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .update(courseData)
    .eq('id', id)
    .select()
    .single();

  if (courseError) return res.status(500).json({ error: courseError.message });

  // 2. Handle Nested Modules & Lessons
  if (modules && Array.isArray(modules)) {
    for (const module of modules) {
      const { lessons, id: moduleId, ...moduleData } = module;
      let currentModuleId = moduleId;

      // Upsert Module
      if (moduleId.toString().startsWith('temp-')) {
        const { data: newModule, error: modError } = await supabaseAdmin
          .from('modules')
          .insert({ ...moduleData, course_id: id })
          .select()
          .single();
        if (modError) continue;
        currentModuleId = newModule.id;
      } else {
        await supabaseAdmin.from('modules').update(moduleData).eq('id', moduleId);
      }

      // Upsert Lessons
      if (lessons && Array.isArray(lessons)) {
        for (const lesson of lessons) {
          const { id: lessonId, ...lessonData } = lesson;
          
          // Ensure we don't send temp IDs or invalid fields to DB
          const cleanLessonData = {
            title: lessonData.title,
            content: lessonData.content,
            type: lessonData.type, // 'text', 'video', 'quiz', 'react'
            order: lessonData.order,
            module_id: currentModuleId
          };

          if (lessonId.toString().startsWith('temp-')) {
            await supabaseAdmin.from('lessons').insert(cleanLessonData);
          } else {
            await supabaseAdmin.from('lessons').update(cleanLessonData).eq('id', lessonId);
          }
        }
      }
    }
  }

  res.json(course);
});

// Delete Course
router.delete('/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete course error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Unexpected delete error:', err);
    res.status(500).json({ error: 'Unexpected error during deletion' });
  }
});

// --- Modules & Lessons ---

// Add Module
router.post('/modules', async (req, res) => {
  const { course_id, title, order } = req.body;
  const { data, error } = await supabaseAdmin
    .from('modules')
    .insert([{ course_id, title, order }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add Lesson
router.post('/lessons', validate(createLessonSchema), async (req, res) => {
  const { module_id, title, content, type, order } = req.body;
  const { data, error } = await supabaseAdmin
    .from('lessons')
    .insert([{ module_id, title, content, type, order }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = { adminRouter: router };
