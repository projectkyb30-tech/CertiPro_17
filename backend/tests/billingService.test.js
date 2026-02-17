const { withRetry } = require('../src/services/billingService');

describe('withRetry helper', () => {
  test('returns result when function eventually succeeds', async () => {
    let attempts = 0;
    const fn = jest.fn().mockImplementation(() => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return 'ok';
    });

    const result = await withRetry(fn, {
      retries: 3,
      delayMs: 1,
      factor: 1,
      shouldRetry: (err) => err.message === 'Temporary failure'
    });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('throws error after max retries exceeded', async () => {
    const fn = jest.fn().mockImplementation(() => {
      throw new Error('Always fails');
    });

    await expect(
      withRetry(fn, {
        retries: 2,
        delayMs: 1,
        factor: 1,
        shouldRetry: () => true
      })
    ).rejects.toThrow('Always fails');

    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });
});

