import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHospitalApiUrl, getAdminApiUrl } from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // 'hospital' or 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedUser = localStorage.getItem('user');
      const storedUserType = localStorage.getItem('userType');

      if (storedUser && storedUserType) {
        // Optimistically set user state
        setUser(JSON.parse(storedUser));
        setUserType(storedUserType);

        try {
          let endpoint;
          if (storedUserType === 'hospital') {
            endpoint = getHospitalApiUrl('refresh');
          } else if (storedUserType === 'admin') {
            endpoint = getAdminApiUrl('refresh');
          }

          if (endpoint) {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
              },
              credentials: 'include',
            });

            if (!response.ok) {
              throw new Error('Session verification failed');
            }
            // Session is valid
          }
        } catch (error) {
          console.warn("Session expired or invalid:", error);
          // Clear invalid session
          setUser(null);
          setUserType(null);
          localStorage.removeItem('user');
          localStorage.removeItem('userType');
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (credentials, type) => {
    try {
      let endpoint;
      if (type === 'hospital') {
        endpoint = getHospitalApiUrl('login');
      } else if (type === 'admin') {
        endpoint = getAdminApiUrl('login');
      } else {
        throw new Error('Invalid user type');
      }

      console.log('Using API Key:', import.meta.env.VITE_API_KEY ? '***' + import.meta.env.VITE_API_KEY.slice(-4) : 'undefined');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,
        },
        credentials: 'include', // Important for HttpOnly cookies
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login failed with status:', response.status, errorText);
        throw new Error(`Login failed: ${response.status} ${errorText}`);
      }

      const userData = await response.json();

      // No token handling here, just user data
      setUser(userData);
      setUserType(type);

      // Store in localStorage (only user info, not tokens)
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userType', type);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      let endpoint;
      if (userType === 'hospital') {
        endpoint = getHospitalApiUrl('logout');
      } else if (userType === 'admin') {
        endpoint = getAdminApiUrl('logout');
      }

      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_API_KEY,
          },
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      setUser(null);
      setUserType(null);
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      // Redirect is handled by the component calling logout or by the protected route
    }
  };

  const signup = async (userData, type) => {
    try {
      let endpoint;
      if (type === 'hospital') {
        endpoint = getHospitalApiUrl('signup');
      } else if (type === 'admin') {
        endpoint = getAdminApiUrl('signup');
      } else {
        throw new Error('Invalid user type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    const headers = {
      'x-api-key': import.meta.env.VITE_API_KEY,
      ...options.headers,
    };

    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
      ...options,
      headers,
      credentials: 'include', // Always include credentials
    };

    try {
      let response = await fetch(url, fetchOptions);

      if (response.status === 401) {
        // Token might be expired, try to refresh
        console.log('Access token expired, attempting refresh...');

        let refreshEndpoint;
        // Determine user type for refresh. 
        // If userType is not set in state (e.g. race condition), try to get from localStorage
        const currentType = userType || localStorage.getItem('userType');

        if (currentType === 'hospital') {
          refreshEndpoint = getHospitalApiUrl('refresh');
        } else if (currentType === 'admin') {
          refreshEndpoint = getAdminApiUrl('refresh');
        }

        if (refreshEndpoint) {
          try {
            const refreshResponse = await fetch(refreshEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_API_KEY,
              },
              credentials: 'include',
            });

            if (refreshResponse.ok) {
              console.log('Token refresh successful, retrying original request...');
              // Retry original request
              response = await fetch(url, fetchOptions);
            } else {
              console.error('Token refresh failed, logging out...');
              await logout();
              throw new Error('Session expired');
            }
          } catch (refreshError) {
            console.error('Error during token refresh:', refreshError);
            await logout();
            throw refreshError;
          }
        } else {
          // If we don't know the user type, we can't refresh.
          await logout();
        }
      }

      return response;
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  };

  const value = {
    user,
    userType,
    loading,
    login,
    logout,
    signup,
    fetchWithAuth,
    isAuthenticated: !!user, // Check for user existence instead of token
    isHospital: userType === 'hospital',
    isAdmin: userType === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
