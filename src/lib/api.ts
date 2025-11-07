/**
 * Utility function for making POST requests with JSON data
 * @param url - The URL to POST to
 * @param data - The JSON data to send
 * @param options - Additional fetch options
 * @returns Promise<Response>
 */
export async function postJson(url: string, data: any, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    mode: 'cors',
    ...options,
    body: JSON.stringify(data),
  });
}