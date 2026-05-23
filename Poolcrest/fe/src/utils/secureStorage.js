/**
 * Secure Storage Utility
 * 
 * This utility provides secure storage mechanisms to prevent XSS attacks.
 * 
 * SECURITY PRINCIPLES:
 * 1. NEVER store sensitive tokens (access_token, refresh_token) in localStorage or sessionStorage
 * 2. Authentication tokens should be stored in httpOnly cookies (handled by backend)
 * 3. Only non-sensitive user data can be stored in sessionStorage (cleared on tab close)
 * 4. localStorage should only be used for user preferences, not authentication data
 * 
 * WHY httpOnly COOKIES?
 * - Cannot be accessed by JavaScript (prevents XSS attacks)
 * - Automatically sent with requests (no manual token management)
 * - Can be secured with Secure, SameSite, and other flags
 * - Browser handles storage and deletion
 */

const secureStorage = {
  /**
   * Store non-sensitive user profile data in sessionStorage
   * This is cleared when the browser tab is closed
   * @param {object} profile - User profile data (non-sensitive)
   */
  setUserProfile: (profile) => {
    try {
      if (!profile) {
        secureStorage.removeUserProfile();
        return;
      }
      
      // Only store non-sensitive profile information
      const safeProfile = {
        id: profile.id,
        user_id: profile.user_id || profile.user,
        email: profile.email || profile.user_email,
        full_name: profile.full_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        phone: profile.phone,
        // Note: We intentionally include the app-level session_key used for
        // server-side session tracking. This is NOT a JWT/token and carries
        // no privileges by itself; it's safe to keep in sessionStorage and
        // helps the API correlate the browser session for security features
        // and precise logout of only this device.
        session_key: profile.session_key,
        // Do NOT store: passwords or JWTs (access/refresh tokens are httpOnly cookies)
      };
      
      sessionStorage.setItem('user_profile', JSON.stringify(safeProfile));
    } catch (error) {
      console.error('Failed to store user profile:', error);
    }
  },

  /**
   * Get user profile from sessionStorage
   * @returns {object|null} User profile or null
   */
  getUserProfile: () => {
    try {
      const profile = sessionStorage.getItem('user_profile');
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Failed to retrieve user profile:', error);
      return null;
    }
  },

  /**
   * Remove user profile from sessionStorage
   */
  removeUserProfile: () => {
    try {
      sessionStorage.removeItem('user_profile');
    } catch (error) {
      console.error('Failed to remove user profile:', error);
    }
  },

  /**
   * Clear all authentication data
   * This should be called on logout
   */
  clearAll: () => {
    try {
      // Clear sessionStorage
      sessionStorage.removeItem('user_profile');
      
      // Clear any legacy localStorage items (for migration)
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('session_key');
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },

  /**
   * Store user preferences (non-sensitive)
   * These persist across sessions
   * @param {string} key - Preference key
   * @param {any} value - Preference value
   */
  setPreference: (key, value) => {
    try {
      localStorage.setItem(`pref_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to store preference:', error);
    }
  },

  /**
   * Get user preference
   * @param {string} key - Preference key
   * @returns {any} Preference value or null
   */
  getPreference: (key) => {
    try {
      const value = localStorage.getItem(`pref_${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Failed to retrieve preference:', error);
      return null;
    }
  },

  /**
   * Remove user preference
   * @param {string} key - Preference key
   */
  removePreference: (key) => {
    try {
      localStorage.removeItem(`pref_${key}`);
    } catch (error) {
      console.error('Failed to remove preference:', error);
    }
  },

  /**
   * Migrate from old localStorage-based auth to cookie-based auth
   * This should run once on app initialization
   */
  migrateFromLocalStorage: () => {
    try {
      // Check if old tokens exist
      const hasOldTokens = localStorage.getItem('access_token') || 
                          localStorage.getItem('refresh_token');
      
      if (hasOldTokens) {
        console.warn('Old token storage detected. Please log in again for enhanced security.');
        
        // Clear old tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('session_key');
        
        // Keep profile for migration
        const oldProfile = localStorage.getItem('user_profile');
        if (oldProfile) {
          try {
            const profile = JSON.parse(oldProfile);
            secureStorage.setUserProfile(profile);
            localStorage.removeItem('user_profile');
          } catch (e) {
            localStorage.removeItem('user_profile');
          }
        }
        
        return true; // Migration occurred
      }
      
      return false; // No migration needed
    } catch (error) {
      console.error('Failed to migrate storage:', error);
      return false;
    }
  },
};

export default secureStorage;
