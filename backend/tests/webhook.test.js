const { handleWebhookEvent } = require('../src/services/billingService');
const { supabaseAdmin } = require('../src/lib/supabaseAdmin');

describe('Stripe Webhook Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('handles checkout.session.completed and records purchase + enrollment', async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    const maybeSingleMock = jest.fn().mockResolvedValue({ data: null, error: null });

    supabaseAdmin.from = jest.fn((table) => {
      if (table === 'user_purchases') {
        return {
          insert: insertMock
        };
      }
      if (table === 'enrollments') {
        return {
          select: jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock }),
          insert: jest.fn().mockResolvedValue({ error: null })
        };
      }
      return {
        select: jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
      };
    });

    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test',
          payment_intent: 'pi_test',
          amount_total: 1000,
          currency: 'eur',
          metadata: {
            userId: 'user-1',
            courseId: 'course-1'
          }
        }
      }
    };

    await handleWebhookEvent(event);

    expect(supabaseAdmin.from).toHaveBeenCalledWith('user_purchases');
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        course_id: 'course-1',
        status: 'paid'
      })
    );
  });
});
