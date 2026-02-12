const { supabaseAdmin } = require('../lib/supabaseAdmin');

const CACHE_TTL_MS = 1000 * 60 * 10;
const courseDetailsCache = new Map();

const getCourseDetails = async (courseId) => {
  const now = Date.now();
  const cached = courseDetailsCache.get(courseId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('price, title')
    .eq('id', courseId)
    .single();

  if (error || !data) return null;

  const course = {
    price: Math.round(data.price * 100),
    name: data.title
  };
  courseDetailsCache.set(courseId, { value: course, expiresAt: now + CACHE_TTL_MS });
  return course;
};

module.exports = { getCourseDetails };
