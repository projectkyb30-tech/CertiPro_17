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

jest.mock('../src/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: jest.fn(),
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

      const res = await request(app).get('/api/admin/stats');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalUsers');
    });
  });

  describe('POST /api/admin/courses', () => {
    it('should create a course with valid data', async () => {
      const courseData = {
        title: 'New Course',
        price: 99,
        category: 'python'
      };

      const mockSingle = jest.fn().mockResolvedValue({ data: { id: '1', ...courseData }, error: null });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
      
      supabaseAdmin.from.mockReturnValue({
        insert: mockInsert
      });

      const res = await request(app)
        .post('/api/admin/courses')
        .send(courseData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New Course');
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
        .send({ ids: ['1', '2'] });

      expect(res.status).toBe(200);
      expect(res.body.results.length).toBe(2);
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
