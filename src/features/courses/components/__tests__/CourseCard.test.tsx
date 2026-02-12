import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourseCard from '../CourseCard';
import { Course } from '../../../../types';
import { ROUTES } from '../../../../routes/paths';
import type { billingApi as billingApiType } from '../../../billing/api/billingApi';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useUserStore
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User'
};

const mockUseUserStore = vi.fn();
vi.mock('../../../../store/useUserStore', () => ({
  useUserStore: () => mockUseUserStore(),
}));

type CreateCheckoutSessionArgs = Parameters<(typeof billingApiType)['createCheckoutSession']>;
type SyncPurchaseArgs = Parameters<(typeof billingApiType)['syncPurchase']>;

const mockCreateCheckoutSession = vi.fn();
const mockSyncPurchase = vi.fn();
vi.mock('../../../billing/api/billingApi', () => ({
  billingApi: {
    createCheckoutSession: (...args: CreateCheckoutSessionArgs) => mockCreateCheckoutSession(...args),
    syncPurchase: (...args: SyncPurchaseArgs) => mockSyncPurchase(...args),
  },
}));

describe('CourseCard', () => {
  const mockCourse: Course = {
    id: '1',
    title: 'Test Python Course',
    description: 'Learn Python from scratch',
    icon: 'python',
    totalLessons: 10,
    durationHours: 5,
    price: 99,
    isLocked: false,
    progress: 50,
    isPublished: true,
    modules: [],
  };

  // Save original window.location
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserStore.mockReturnValue({ user: mockUser });
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' } as Location
    });
    
    // Mock alert
    global.alert = vi.fn();
  });

  afterEach(() => {
    // Restore window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation
    });
  });

  it('renders course details correctly', () => {
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText('Test Python Course')).toBeInTheDocument();
    expect(screen.getByText('Learn Python from scratch')).toBeInTheDocument();
    expect(screen.getByText('10 Lecții')).toBeInTheDocument();
    expect(screen.getByText('5 ore')).toBeInTheDocument();
  });

  it('navigates to lessons when unlocked course "Continuă" button is clicked', () => {
    render(<CourseCard course={mockCourse} />);
    
    const continueButton = screen.getByText('Continuă');
    fireEvent.click(continueButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.LESSONS);
  });

  it('initiates checkout flow when locked course button is clicked', async () => {
    const lockedCourse = { ...mockCourse, isLocked: true };
    const mockCheckoutUrl = 'https://checkout.stripe.com/session123';
    
    mockCreateCheckoutSession.mockResolvedValue({ url: mockCheckoutUrl });

    render(<CourseCard course={lockedCourse} />);
    
    const unlockButton = screen.getByText('Deblochează Cursul Complet');
    fireEvent.click(unlockButton);
    
    // Wait for async operations
    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: lockedCourse.id
        })
      );
    });
    
    // Verify redirection
    expect(window.location.href).toBe(mockCheckoutUrl);
    
    // Verify NO navigation to old checkout route
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
