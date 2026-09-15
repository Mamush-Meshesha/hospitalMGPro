export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = sessionStorage.getItem('token');
  const locationId = localStorage.getItem('locationId');
  
  const isFormData = options.body instanceof FormData;
  const headers: any = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(locationId ? { 'X-Location-Id': locationId } : {}),
    ...options.headers,
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }


  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-cache', // Force bypass browser caching
  });

  if (response.status === 401) {
    // Unauthorized, trigger logout via event
    window.dispatchEvent(new Event('auth-unauthorized'));
  }

  // Parse JSON if possible
  const contentType = response.headers.get("content-type");
  let data;
  if (contentType && contentType.indexOf("application/json") !== -1) {
    data = await response.json();
  }

  if (!response.ok) {
    throw new Error(data?.error || `API Error: ${response.status}`);
  }

  return data;
};
