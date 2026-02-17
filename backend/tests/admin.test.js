const request = require('supertest');

// Mocks
jest.mock('../src/middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.user = { id: 'test-admin-id', email: 'admin@test.com' };
    next();
  }
}));

jest.mock('../src/middleware/adminAuth', () => ({
  requireAdmin: (req, res, next) => next()
}));

// Mock external deps used in app.js to avoid requiring installed packages
jest.mock('helmet', () => () => (req, res, next) => next(), { virtual: true });

jest.mock('../src/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn(),
    rpc: jest.fn(),
    auth: {
      admin: {
        listUsers: jest.fn(),
        deleteUser: jest.fn(),
        updateUserById: jest.fn()
      }
    }
  }
}));

jest.mock('../src/lib/monitoring', () => ({
  captureException: jest.fn()
}));

const { createApp } = require('../src/app');
const { supabaseAdmin } = require('../src/lib/supabaseAdmin');

const app = createApp();

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/stats', () => {
    it('should return stats', async () => {
      // Mock chain for from('profiles').select(...)
      const mockSelect = jest.fn().mockResolvedValue({ count: 100, data: [] });
      supabaseAdmin.from.mockReturnValue({
        select: mockSelect
      });
      supabaseAdmin.rpc.mockResolvedValue({
        data: [
          { month: 'Sep', users: 10, revenue: 1000 },
          { month: 'Oct', users: 12, revenue: 1200 }
        ],
        error: null
      });

      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsers');
    });
  });

  describe('POST /api/admin/courses', () => {
    it('should create a course with valid data', async () => {
      const courseData = {
        title: 'New Course',
        price: 99,
        category: 'python'
      };

      const mockInsertSelect = jest.fn().mockResolvedValue({
        data: [{ id: '1', ...courseData }],
        error: null
      });
      const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });

      const mockDetailsMaybeSingle = jest.fn().mockResolvedValue({
        data: { id: '1', ...courseData, modules: [] },
        error: null
      });
      const mockDetailsEq = jest.fn().mockReturnValue({ maybeSingle: mockDetailsMaybeSingle });
      const mockDetailsSelect = jest.fn().mockReturnValue({ eq: mockDetailsEq });

      supabaseAdmin.from.mockImplementation((table) => {
        if (table === 'courses') {
          return {
            insert: mockInsert,
            select: mockDetailsSelect
          };
        }
        return { select: jest.fn() };
      });

      const res = await request(app)
        .post('/api/admin/courses')
        .send(courseData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Course');
    });

    it('should fail validation with missing title', async () => {
      const res = await request(app)
        .post('/api/admin/courses')
        .send({ price: 99 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/admin/users/bulk-delete', () => {
    it('should delete multiple users', async () => {
      supabaseAdmin.auth.admin.deleteUser.mockResolvedValue({ error: null });

      const res = await request(app)
        .post('/api/admin/users/bulk-delete')
        .send({ ids: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(supabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledTimes(2);
    });

    it('should validate ids is array', async () => {
      const res = await request(app)
        .post('/api/admin/users/bulk-delete')
        .send({ ids: 'not-array' });

      expect(res.status).toBe(400);
    });
  });
});
