// Resilient API Client for HealOps Dashboard
// Automatically uses relative /api (proxied by Nginx on port 80/8080)
// and falls back to http://localhost:4000 if running in standalone mode.

const isViteDev = window.location.port === '5173';
const BACKEND_FALLBACK = 'http://localhost:4000';

export async function fetchApi(endpoint: string, options?: RequestInit): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Primary attempt: relative URL for production/Nginx proxy (port 8080/80)
  const primaryUrl = isViteDev ? `${BACKEND_FALLBACK}${cleanEndpoint}` : cleanEndpoint;
  
  try {
    const res = await fetch(primaryUrl, options);
    if (res.ok) return res;
    // If not OK but returned response, still return
    return res;
  } catch (primaryErr) {
    // If primary failed due to network error, try direct fallback to localhost:4000
    if (!isViteDev) {
      try {
        const fallbackUrl = `${BACKEND_FALLBACK}${cleanEndpoint}`;
        const fallbackRes = await fetch(fallbackUrl, options);
        return fallbackRes;
      } catch (fallbackErr) {
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
}
