const { z } = require('zod');

// Middleware factory
const validate = (schema) => (req, res, next) => {
  try {
    // Validate body, query, or params based on schema structure if needed
    // Here we primarily validate req.body
    schema.parse(req.body);
    next();
  } catch (err) {
    console.log('Caught error in validation:', err.name);
    if (err instanceof z.ZodError || err.name === 'ZodError') {
       const errors = err.errors || err.issues || [];
       return res.status(400).json({ 
         error: 'Validation failed', 
         details: errors.map(e => ({ path: e.path ? e.path.join('.') : 'unknown', message: e.message })) 
       });
     }
    console.error('Validation unexpected error:', err);
    next(err);
  }
};

// Schemas
const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  icon: z.string().optional(),
  category: z.enum(['python', 'sql', 'networking', 'cybersecurity', 'web']).optional().default('python'),
  is_published: z.boolean().optional()
});

const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  type: z.enum(['text', 'video', 'quiz', 'react', 'presentation']),
  order: z.number().int().optional(),
  module_id: z.string().optional(), // Optional because it might be part of a nested update
  id: z.string().optional() // For updates
});

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  order: z.number().int().optional(),
  course_id: z.string().optional(),
  id: z.string().optional(),
  lessons: z.array(lessonSchema).optional()
});

const updateCourseSchema = courseSchema.partial().extend({
  modules: z.array(moduleSchema).optional()
});

const userUpdateSchema = z.object({
  role: z.enum(['admin', 'user', 'instructor']).optional(),
  banned: z.boolean().optional()
});

const createModuleSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1),
  order: z.number().int().default(0)
});

const createLessonSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(1),
  content: z.string().optional(),
  type: z.enum(['text', 'video', 'quiz', 'react', 'presentation']),
  order: z.number().int().default(0)
});

module.exports = {
  validate,
  courseSchema,
  updateCourseSchema,
  userUpdateSchema,
  createModuleSchema,
  createLessonSchema
};
