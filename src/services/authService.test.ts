
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';
import { supabase } from './supabase';

// Mock supabase client
vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      verifyOtp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and return user profile', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        app_metadata: { role: 'user' }
      };

      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        full_name: 'Test User'
      };

      // Mock SignIn response
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock Profile fetch response
      const mockSelect = vi.fn().mockReturnValue({
        data: mockProfile,
        error: null
      });
      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSelect
          })
        })
      });

      const result = await authService.login('test@example.com', 'password');

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      });
      expect(result.id).toBe('123');
      expect(result.fullName).toBe('Test User');
    });

    it('should throw error on invalid credentials', async () => {
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' }
      });

      await expect(authService.login('wrong@test.com', 'badpass'))
        .rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser = {
        id: '456',
        email: 'new@example.com',
        app_metadata: { role: 'user' }
      };

      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      // Mock getUserProfile call to throw, triggering the optimistic return
      vi.spyOn(authService, 'getUserProfile').mockRejectedValueOnce(new Error('Profile not ready'));

      // Mock optimistic profile return since getUserProfile might fail/delay
      const result = await authService.register('new@example.com', 'password', 'New User');

      expect(supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@example.com',
        options: expect.objectContaining({
          data: { full_name: 'New User' }
        })
      }));
      expect(result.email).toBe('new@example.com');
    });
  });
});
