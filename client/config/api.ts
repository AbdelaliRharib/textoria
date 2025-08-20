// API Configuration for different environments
// Updated to use Render backend URL
export const getApiUrl = () => {
  // Use environment variable or default to Render backend
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://textoria.onrender.com';
  // Ensure we have the /api prefix
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

export const API_BASE_URL = getApiUrl();

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    GITHUB: `${API_BASE_URL}/api/auth/github`,
  },
  GENERATE: `${API_BASE_URL}/api/generate`,
  GENERATIONS: `${API_BASE_URL}/api/generations`,
  USER: `${API_BASE_URL}/api/user`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  PAYMENTS: `${API_BASE_URL}/api/payments`,
  HEALTH: `${API_BASE_URL}/api/health`,
};

