
/**
 * Utility for fetching with retries
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoff = 300
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Only retry on network errors or 5xx server errors
    // Don't retry on 4xx (client errors like 401, 403, 404)
    if (!response.ok && response.status >= 500 && retries > 0) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.warn(`Fetch failed, retrying in ${backoff}ms... (${retries} retries left)`, error);
    
    await new Promise(resolve => setTimeout(resolve, backoff));
    
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}
