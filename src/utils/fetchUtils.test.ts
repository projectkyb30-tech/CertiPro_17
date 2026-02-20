
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry } from './fetchUtils';

// Mock global fetch
const globalFetch = global.fetch;

describe('fetchWithRetry', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    global.fetch = globalFetch;
    vi.useRealTimers();
  });

  it('should return response immediately on success', async () => {
    const mockResponse = { ok: true, status: 200 };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const response = await fetchWithRetry('https://api.test.com');
    
    expect(response).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on 500 server errors', async () => {
    const mockErrorResponse = { ok: false, status: 500 };
    (global.fetch as any).mockResolvedValue(mockErrorResponse);

    // Create promise but don't await it yet
    const promise = fetchWithRetry('https://api.test.com', {}, 2, 100);
    
    // Fast-forward time for backoff
    await vi.runAllTimersAsync();
    
    try {
        await promise;
    } catch (e) {
        // Expected to throw after retries exhausted
    }

    // Initial call + 2 retries = 3 calls
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('should NOT retry on 404 client errors', async () => {
    const mockClientError = { ok: false, status: 404 };
    (global.fetch as any).mockResolvedValue(mockClientError);

    const response = await fetchWithRetry('https://api.test.com');
    
    expect(response).toBe(mockClientError);
    expect(global.fetch).toHaveBeenCalledTimes(1); // No retries for 404
  });
});
