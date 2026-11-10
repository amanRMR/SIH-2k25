// API configuration utility
export const API_CONFIG = {
  // Use empty string to support both Vite proxy (dev) and Vercel rewrites (prod)
  baseURL: '',
  endpoints: {
    hospital: {
      login: '/api/hospitals/login',
      signup: '/api/hospitals/signup',
      refresh: '/api/hospitals/refresh-token',
      logout: '/api/hospitals/logout',
    },
    admin: {
      login: '/api/admins/login',
      signup: '/api/admins/signup',
      refresh: '/api/admins/refresh-token',
      logout: '/api/admins/logout',
    },
    employer: {
      login: '/api/employers/login',
      register: '/api/employers/register',
      workers: '/api/employers/workers',
      addWorker: '/api/employers/workers/add',
    },
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

// Helper function to get hospital API endpoints
export const getHospitalApiUrl = (endpoint) => {
  return buildApiUrl(API_CONFIG.endpoints.hospital[endpoint]);
};

// Helper function to get admin API endpoints
export const getAdminApiUrl = (endpoint) => {
  return buildApiUrl(API_CONFIG.endpoints.admin[endpoint]);
};

// Helper function to get employer API endpoints
export const getEmployerApiUrl = (endpoint) => {
  return buildApiUrl(API_CONFIG.endpoints.employer[endpoint]);
};
