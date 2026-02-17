const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');
const { 
  validate, 
  courseSchema, 
  updateCourseSchema, 
  userUpdateSchema,
  bulkIdsSchema
} = require('../utils/validation');
const adminService = require('../services/adminService');
const { sendSuccess, sendError } = require('../utils/response');

// Middleware for all admin routes
router.use(authenticateUser);
router.use(requireAdmin);

// --- Stats ---
router.get('/stats', async (req, res) => {
  try {
    const stats = await adminService.getStats();
    sendSuccess(res, stats, 'Admin stats retrieved successfully');
  } catch (error) {
    console.error('Stats error:', error);
    sendError(res, 'Failed to fetch stats', 500, error.message);
  }
});

// --- Users ---
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await adminService.listUsers(page, limit);
    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    sendError(res, error.message);
  }
});

// Delete User
router.delete('/users/:id', async (req, res) => {
  try {
    const result = await adminService.deleteUser(req.params.id);
    sendSuccess(res, result, 'User deleted successfully');
  } catch (error) {
    sendError(res, error.message);
  }
});

// Update User
router.put('/users/:id', validate(userUpdateSchema), async (req, res) => {
  try {
    const data = await adminService.updateUser(req.params.id, req.body);
    sendSuccess(res, data, 'User updated successfully');
  } catch (error) {
    sendError(res, error.message);
  }
});

// --- Bulk Operations ---

// Bulk Delete Users
router.post('/users/bulk-delete', validate(bulkIdsSchema), async (req, res) => {
  try {
    const { ids } = req.body;
    const results = await adminService.bulkDeleteUsers(ids);
    sendSuccess(res, results, 'Bulk delete users processed');
  } catch (error) {
    sendError(res, error.message);
  }
});

// Bulk Delete Courses
router.post('/courses/bulk-delete', validate(bulkIdsSchema), async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await adminService.bulkDeleteCourses(ids);
    sendSuccess(res, result, 'Bulk delete courses processed');
  } catch (error) {
    sendError(res, error.message);
  }
});

// --- Courses Management ---

// List all courses
router.get('/courses', async (req, res) => {
  try {
    const data = await adminService.listCourses();
    sendSuccess(res, data, 'Courses retrieved successfully');
  } catch (error) {
    sendError(res, error.message);
  }
});

// Create Course (accepts nested modules/lessons too)
router.post('/courses', validate(updateCourseSchema), async (req, res) => {
  try {
    const data = await adminService.createCourse(req.body);
    sendSuccess(res, data, 'Course created successfully', 201);
  } catch (error) {
    sendError(res, error.message);
  }
});

// Get Course Details
router.get('/courses/:id', async (req, res) => {
  try {
    const data = await adminService.getAdminCourseDetails(req.params.id);
    sendSuccess(res, data, 'Course details retrieved successfully');
  } catch (error) {
    sendError(res, error.message);
  }
});

// Update Course with Nested Modules & Lessons
router.put('/courses/:id', validate(updateCourseSchema), async (req, res) => {
  try {
    const course = await adminService.updateCourseFull(req.params.id, req.body);
    sendSuccess(res, course, 'Course updated successfully');
  } catch (error) {
    sendError(res, error.message);
  }
});

// Delete Course
router.delete('/courses/:id', async (req, res) => {
  try {
    const result = await adminService.deleteCourse(req.params.id);
    sendSuccess(res, result, 'Course deleted successfully');
  } catch (error) {
    console.error('Delete course error:', error);
    sendError(res, error.message);
  }
});

module.exports = { adminRouter: router };
