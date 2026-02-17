const { supabaseAdmin } = require('../lib/supabaseAdmin');
const auditService = require('./auditService');

/**
 * Fetches dashboard statistics
 */
async function getStats() {
  // 1. Get counts using head:true (0 memory impact)
  const { count: usersCount } = await supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true });
  const { count: coursesCount } = await supabaseAdmin.from('courses').select('*', { count: 'exact', head: true });
  
  // 2. Get only necessary columns for revenue
  const { data: purchases } = await supabaseAdmin
    .from('user_purchases')
    .select('amount_total, created_at');
  
  const totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount_total / 100), 0) || 0;

  // 3. Get monthly data for the last 6 months using a more targeted query
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  
  const { data: monthlyRows, error: monthlyError } = await supabaseAdmin.rpc('admin_monthly_stats', {
    p_since: sixMonthsAgo.toISOString()
  });
  let chartData = [];
  if (monthlyError) {
    console.error('admin_monthly_stats error:', monthlyError);
  } else {
    chartData = (monthlyRows || []).map((r) => ({
      name: r.month,
      users: r.users,
      revenue: Number(r.revenue || 0)
    }));
  }

  return {
    totalUsers: usersCount || 0,
    activeCourses: coursesCount || 0,
    totalRevenue: totalRevenue,
    chartData: chartData,
    recentActivity: [
      { id: 1, action: 'Dashboard updated', user: 'System', time: new Date() }
    ]
  };
}

/**
 * Lists users with pagination
 */
async function listUsers(page = 1, limit = 10) {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
    page: parseInt(page),
    perPage: parseInt(limit)
  });

  if (error) throw error;
  return users;
}

/**
 * Deletes a user by ID
 */
async function deleteUser(id) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) throw error;

  await auditService.logAction('system-admin', 'DELETE_USER', { targetUserId: id });
  return { message: 'User deleted' };
}

/**
 * Updates a user's metadata (role, ban status)
 */
async function updateUser(id, { role, banned }) {
  const updates = {};
  if (role) updates.user_metadata = { role };
  if (banned !== undefined) updates.ban_duration = banned ? '876000h' : 'none';

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updates);
  if (error) throw error;
  return data;
}

/**
 * Bulk deletes users
 */
async function bulkDeleteUsers(ids) {
  const results = [];
  for (const id of ids) {
    try {
      await deleteUser(id);
      results.push({ id, status: 'success' });
    } catch (error) {
      results.push({ id, status: 'failed', error: error.message });
    }
  }
  return results;
}

/**
 * Bulk deletes courses
 */
async function bulkDeleteCourses(ids) {
  const { error } = await supabaseAdmin
    .from('courses')
    .delete()
    .in('id', ids);

  if (error) throw error;
  return { success: true, count: ids.length };
}

async function listCourses() {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, modules(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

const { randomUUID } = require('crypto');

function makeCourseId(title) {
  const base = (title || 'course')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

function makeItemId(kind, title) {
  const base = (title || kind || 'item')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

async function upsertModulesAndLessons(courseId, modules) {
  for (const module of modules) {
    const { lessons, id: moduleId, ...moduleData } = module;
    let currentModuleId = moduleId;
    const moduleDataNoOrder = (() => {
      const { order, ...rest } = moduleData;
      return rest;
    })();

    if (moduleId && moduleId.toString().startsWith('temp-')) {
      let newModule = null;
      let modError = null;
      const newModuleId = makeItemId('module', moduleData.title);
      // First try with 'order' included (if the column exists)
      ({ data: newModule, error: modError } = await supabaseAdmin
        .from('modules')
        .insert({ id: newModuleId, ...moduleData, course_id: courseId })
        .select()
        .single());
      // If the error indicates missing 'order' column, retry without it
      if (modError && /order|schema cache/i.test(modError.message || '')) {
        ({ data: newModule, error: modError } = await supabaseAdmin
          .from('modules')
          .insert({ id: newModuleId, ...moduleDataNoOrder, course_id: courseId })
          .select()
          .single());
      }
      if (modError) throw modError;
      if (!newModule) throw new Error('Failed to create module');
      currentModuleId = newModule.id;
    } else if (moduleId) {
      let modUpdateError = null;
      ({ error: modUpdateError } = await supabaseAdmin
        .from('modules')
        .update(moduleData)
        .eq('id', moduleId));
      if (modUpdateError && /order|schema cache/i.test(modUpdateError.message || '')) {
        ({ error: modUpdateError } = await supabaseAdmin
          .from('modules')
          .update(moduleDataNoOrder)
          .eq('id', moduleId));
      }
      if (modUpdateError) throw modUpdateError;
    }

    if (lessons && Array.isArray(lessons)) {
      for (const lesson of lessons) {
        const { id: lessonId, ...lessonData } = lesson;

        const cleanLessonData = {
          title: lessonData.title,
          content: lessonData.content,
          type: lessonData.type,
          order: lessonData.order,
          module_id: currentModuleId
        };

        if (lessonId && lessonId.toString().startsWith('temp-')) {
          const newLessonId = makeItemId('lesson', lessonData.title);
          const { error: lessonInsertError } = await supabaseAdmin
            .from('lessons')
            .insert({ id: newLessonId, ...cleanLessonData });
          if (lessonInsertError) throw lessonInsertError;
        } else if (lessonId) {
          const { error: lessonUpdateError } = await supabaseAdmin
            .from('lessons')
            .update(cleanLessonData)
            .eq('id', lessonId);
          if (lessonUpdateError) throw lessonUpdateError;
        }
      }
    }
  }
}

async function createCourse(courseData) {
  const { title, description, price, icon, category, modules } = courseData;
  const courseIcon = icon || category || 'python';
  const id = courseData.id || makeCourseId(title) || randomUUID();

  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert([{ id, title, description, price, icon: courseIcon, category, is_published: false }])
    .select();

  if (error) throw error;
  if (modules && Array.isArray(modules) && modules.length > 0) {
    await upsertModulesAndLessons(id, modules);
  }
  return getAdminCourseDetails(id);
}

/**
 * Gets full course details including modules and lessons
 */
async function getAdminCourseDetails(id) {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, modules(*, lessons(*))')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Course not found');
  }
  return data;
}

/**
 * Updates a course and its nested modules/lessons
 */
async function updateCourseFull(id, fullData) {
  const { modules, ...courseData } = fullData;
  
  // 1. Update Course Base Data
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .update(courseData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (courseError) throw courseError;
  if (!course) {
    throw new Error('Course not found');
  }

  await auditService.logAction('system-admin', 'UPDATE_COURSE_FULL', { courseId: id, title: courseData.title });

  if (modules && Array.isArray(modules)) {
    await upsertModulesAndLessons(id, modules);
  }

  return getAdminCourseDetails(id);
}

/**
 * Deletes a course
 */
async function deleteCourse(id) {
  const { error } = await supabaseAdmin
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

module.exports = {
  getStats,
  listUsers,
  deleteUser,
  updateUser,
  bulkDeleteUsers,
  bulkDeleteCourses,
  listCourses,
  createCourse,
  getAdminCourseDetails,
  updateCourseFull,
  deleteCourse
};
