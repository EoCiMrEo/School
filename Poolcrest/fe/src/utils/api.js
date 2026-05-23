/**
 * Django Backend API Configuration - SECURE VERSION
 * 
 * This replaces localStorage-based token management with secure httpOnly cookies.
 * Tokens are now stored in httpOnly cookies and automatically sent with requests.
 * 
 * SECURITY IMPROVEMENTS:
 * - Tokens stored in httpOnly cookies (not accessible to JavaScript)
 * - Automatic CSRF token handling for state-changing requests
 * - withCredentials enabled for cross-origin cookie support
 * - No manual token management needed
 */

import axios from 'axios';
import secureStorage from './secureStorage';

// Backend API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://your-production-domain.com/api')
  : '/api'; // Proxied by Vite to http://localhost:8000/api

// Create axios instance with secure defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT: Send cookies with requests
});

// Track in-flight refresh calls so concurrent 401s wait for a single refresh.
let refreshPromise = null;

const ensureTokenRefresh = () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/users/auth/refresh/', null, { _skipRetry: true })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// CSRF Token management
const csrfTokenManager = {
  token: null,
  
  /**
   * Get CSRF token from cookie
   * Django sets this as 'csrftoken' cookie
   */
  getToken: () => {
    if (csrfTokenManager.token) {
      return csrfTokenManager.token;
    }
    
    // Try to get from cookie
    const name = 'csrftoken';
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    
    if (parts.length === 2) {
      csrfTokenManager.token = parts.pop().split(';').shift();
      return csrfTokenManager.token;
    }
    
    return null;
  },
  
  /**
   * Fetch CSRF token from server
   * Calls a public endpoint that issues the CSRF cookie.
   */
  fetchToken: async () => {
    try {
      // Public endpoint that forces Django to set the CSRF cookie
      await api.get('/users/auth/csrf/', { _skipRetry: true });
      return csrfTokenManager.getToken();
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    }
  },
  
  /**
   * Clear cached token
   */
  clearToken: () => {
    csrfTokenManager.token = null;
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();
    const method = config.method?.toUpperCase();
    const url = config.url;
    
    // Log all requests with details
    console.log(`%c🚀 API REQUEST [${timestamp}]`, 'color: #4CAF50; font-weight: bold');
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${config.baseURL}${url}`);
    console.log(`   Headers:`, {
      'Content-Type': config.headers['Content-Type'],
      'X-CSRFToken': config.headers['X-CSRFToken'] ? '***' : 'none',
      'X-Session-Key': config.headers['X-Session-Key'] ? '***' : 'none',
    });
    if (config.data && method !== 'GET') {
      console.log(`   Data:`, config.data);
    }
    console.log(`   Credentials: ${config.withCredentials ? 'included' : 'omitted'}`);
    
    // Add CSRF token for state-changing requests
    const methodsRequiringCSRF = ['post', 'put', 'patch', 'delete'];
    if (methodsRequiringCSRF.includes(config.method?.toLowerCase())) {
      const csrfToken = csrfTokenManager.getToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    // Add session key if available (for session tracking)
    const profile = secureStorage.getUserProfile();
    if (profile && profile.session_key) {
      config.headers['X-Session-Key'] = profile.session_key;
    }
    
    return config;
  },
  (error) => {
    console.error('%c❌ REQUEST ERROR', 'color: #f44336; font-weight: bold', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();
    const method = response.config.method?.toUpperCase();
    const url = response.config.url;
    const status = response.status;
    
    // Log successful responses with details
    console.log(`%c✅ API RESPONSE [${timestamp}]`, 'color: #2196F3; font-weight: bold');
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${response.config.baseURL}${url}`);
    console.log(`   Status: ${status} ${response.statusText}`);
    console.log(`   Data:`, response.data);
    
    // Check if cookies were set
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      console.log(`   🍪 Set-Cookie Header Present: Yes`);
    }
    
    // Check current cookies in browser
    const cookies = document.cookie;
    if (cookies) {
      console.log(`   🍪 Current Browser Cookies:`, cookies.split('; ').map(c => c.split('=')[0]));
    } else {
      console.log(`   🍪 Current Browser Cookies: None`);
    }
    
    // Check for httpOnly cookies (can't access but can verify via network tab)
    console.log(`   💡 Check DevTools → Application → Cookies for httpOnly cookies`);
    
    return response;
  },
  async (error) => {
    const timestamp = new Date().toISOString();
    const originalRequest = error.config;
    const method = originalRequest?.method?.toUpperCase();
    const url = originalRequest?.url;
    const status = error.response?.status;
    
    // Log errors with details
    console.log(`%c❌ API ERROR [${timestamp}]`, 'color: #f44336; font-weight: bold');
    console.log(`   Method: ${method}`);
    console.log(`   URL: ${originalRequest?.baseURL}${url}`);
    console.log(`   Status: ${status || 'Network Error'}`);
    console.log(`   Error:`, error.response?.data || error.message);
    console.log(`   Retry attempted: ${originalRequest?._retry ? 'Yes' : 'No'}`);
    
    // If this error is from the refresh endpoint itself or marked to skip, do NOT try to refresh again
    const isRefreshRequest = typeof url === 'string' && url.includes('/users/auth/refresh/');
    const isLoginRequest = typeof url === 'string' && url.includes('/users/auth/login/');
    if (originalRequest?._skipRetry || isRefreshRequest || isLoginRequest) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - try to refresh token once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log(`%c🔄 TOKEN REFRESH ATTEMPT`, 'color: #FF9800; font-weight: bold');
      
      try {
        // Try to refresh the token once and share the promise among concurrent callers
        // The refresh token is automatically sent via httpOnly cookie
        await ensureTokenRefresh();
        
        console.log(`%c✅ TOKEN REFRESH SUCCESS`, 'color: #4CAF50; font-weight: bold');
        
        // Retry original request
        // New access token will be automatically sent via cookie
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear all auth data and redirect to login
        console.log(`%c❌ TOKEN REFRESH FAILED`, 'color: #f44336; font-weight: bold');
        console.error('Token refresh error:', refreshError);
        
        secureStorage.clearAll();
        csrfTokenManager.clearToken();
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/auth/login')) {
          console.log('%c⚠️  REDIRECTING TO LOGIN', 'color: #FF9800; font-weight: bold');
          window.location.href = '/auth/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.detail?.includes('CSRF')) {
      console.warn('%c⚠️  CSRF TOKEN INVALID - FETCHING NEW TOKEN', 'color: #FF9800; font-weight: bold');
      await csrfTokenManager.fetchToken();
      
      // Retry the request with new CSRF token
      return api(originalRequest);
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      console.error('%c🚫 FORBIDDEN: Permission denied', 'color: #f44336; font-weight: bold');
    } else if (error.response?.status === 404) {
      console.error('%c🔍 NOT FOUND: Resource does not exist', 'color: #f44336; font-weight: bold');
    } else if (error.response?.status === 500) {
      console.error('%c💥 SERVER ERROR: Internal server error', 'color: #f44336; font-weight: bold');
    }
    
    return Promise.reject(error);
  }
);

// Initialize on app load
if (typeof window !== 'undefined') {
  // Prime CSRF token as early as possible for SPA-first flows
  csrfTokenManager.fetchToken();

  // Run migration from localStorage to cookies
  secureStorage.migrateFromLocalStorage();
}

export { api, csrfTokenManager, API_BASE_URL };
export default api;
