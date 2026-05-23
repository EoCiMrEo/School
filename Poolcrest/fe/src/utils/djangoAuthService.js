/**
 * Django Authentication Service - SECURE VERSION
 * 
 * Handles all authentication operations with the Django backend using httpOnly cookies.
 * Tokens are stored in httpOnly cookies (managed by backend) for XSS protection.
 * Only non-sensitive profile data is stored in sessionStorage.
 */

import { api } from "./api";
import secureStorage from "./secureStorage";

const djangoAuthService = {
  /**
   * Sign in with email and password
   * Tokens are automatically stored in httpOnly cookies by the backend
   */
  signIn: async (email, password) => {
    try {
      const response = await api.post("/users/auth/login/", {
        email,
        password,
      });

      const { user, profile, session } = response.data || {};

      // Store only non-sensitive user profile in sessionStorage
      if (profile || user) {
        const userProfile = profile || user.profile || user;
        
        // Add session key for tracking
        if (session?.session_key) {
          userProfile.session_key = session.session_key;
        }
        
        secureStorage.setUserProfile(userProfile);
      }

      return {
        success: true,
        data: {
          user,
          profile: profile || user?.profile,
        },
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Sign up with email, password and user data
   * Automatically logs in the user after successful registration
   */
  signUp: async (email, password, userData = {}) => {
    try {
      const response = await api.post("/users/auth/register/", {
        email,
        password,
        password_confirm: password,
        first_name: userData.firstName || "",
        last_name: userData.lastName || "",
        full_name:
          userData.fullName ||
          `${userData.firstName} ${userData.lastName}`.trim(),
        phone: userData.phone || undefined,
        company_name: userData.companyName || undefined,
        date_of_birth: userData.dateOfBirth || undefined,
        role: userData.role || "customer",
      });

      const { user, profile, session } = response.data || {};

      // Store only non-sensitive user profile
      if (profile || user) {
        const userProfile = profile || user.profile || user;
        
        // Add session key for tracking
        if (session?.session_key) {
          userProfile.session_key = session.session_key;
        }
        
        secureStorage.setUserProfile(userProfile);
      }

      return {
        success: true,
        data: {
          user,
          profile: profile || user?.profile,
        },
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.email?.[0] ||
        error.response?.data?.password?.[0] ||
        "Registration failed. Please try again.";
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Sign out
   * Clears httpOnly cookies on the backend and local storage
   */
  signOut: async () => {
    try {
      const profile = secureStorage.getUserProfile();
      const session_key = profile?.session_key;

      // Call logout endpoint
      await api.post("/users/auth/logout/", {
        session_key,
      });

      // Clear all local storage
      secureStorage.clearAll();

      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local storage
      secureStorage.clearAll();
      
      console.log("Sign out error:", error);
      return { success: true }; // Return success since we cleared local state
    }
  },

  /**
   * Get current session/user
   * Fetches current user data from the server
   */
  getSession: async () => {
    try {
      const response = await api.get("/users/auth/me/");

      const data = response.data || {};
      const { user, profile, session } = data;

      const cached = secureStorage.getUserProfile();
      const baseProfile =
        profile ||
        user?.profile ||
        cached ||
        (user
          ? {
              id: user.id,
              user: user.id,
              email: user.email,
              full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
              role: user.profile?.role,
            }
          : null);

      const sessionKey = session?.session_key || cached?.session_key || baseProfile?.session_key;

      const normalizedProfile = baseProfile
        ? { ...baseProfile, session_key: sessionKey }
        : null;

      if (normalizedProfile) {
        secureStorage.setUserProfile(normalizedProfile);
      } else {
        secureStorage.removeUserProfile();
      }

      return {
        success: true,
        data: {
          user: user || data,
          profile: normalizedProfile,
          session: session || null,
        },
      };
    } catch (error) {
      return { success: false, error: "Failed to get session" };
    }
  },

  /**
   * Get user profile
   */
  getUserProfile: async (userId) => {
    try {
      // First check sessionStorage
      const cached = secureStorage.getUserProfile();
      if (cached && (cached.id === userId || cached.user === userId || cached.user_id === userId)) {
        return { success: true, data: cached };
      }

      // Fetch from API
      const response = await api.get(`/users/profiles/${userId}/`);

      // Cache the profile
      secureStorage.setUserProfile(response.data);

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to load user profile" };
    }
  },

  /**
   * Update user profile
   */
  updateUserProfile: async (userId, updates) => {
    try {
      const response = await api.patch(`/users/profiles/${userId}/`, updates);

      // Update cached profile
      secureStorage.setUserProfile(response.data);

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Failed to update profile" };
    }
  },

  /**
   * Reset password request
   */
  resetPassword: async (email) => {
    try {
      await api.post("/users/auth/password-reset/", { email });

      return {
        success: true,
        message: "Password reset email sent. Please check your inbox.",
      };
    } catch (error) {
      return { success: false, error: "Failed to send reset email" };
    }
  },

  /**
   * Confirm password reset
   */
  confirmPasswordReset: async (token, newPassword) => {
    try {
      await api.post("/users/auth/password-reset-confirm/", {
        token,
        password: newPassword,
        password_confirm: newPassword,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to reset password" };
    }
  },

  /**
   * Change password (for authenticated users)
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      await api.post("/users/auth/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPassword,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to change password" };
    }
  },

  /**
   * Verify email
   */
  verifyEmail: async (payload) => {
    try {
      const body =
        typeof payload === "string"
          ? { token: payload }
          : payload && typeof payload === "object"
          ? payload
          : {};
      await api.post("/users/auth/verify-email/", body);

      // Refresh session so FE sees is_email_verified=true
      try {
        await api.get("/users/auth/me/");
      } catch {}
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to verify email" };
    }
  },

  /**
   * Resend verification email
   */
  resendVerificationEmail: async () => {
    try {
      await api.post("/users/auth/resend-verification/");

      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to resend verification email" };
    }
  },

  /**
   * Helper to check if user is authenticated
   * Since tokens are in httpOnly cookies, we check for user profile
   */
  isAuthenticated: () => {
    const profile = secureStorage.getUserProfile();
    return !!profile;
  },

  /**
   * Helper to get current user from sessionStorage
   */
  getCurrentUser: () => {
    return secureStorage.getUserProfile();
  },

  /**
   * Refresh access token
   * The refresh token is automatically sent via httpOnly cookie
   */
  refreshToken: async () => {
    try {
      // Mark this request to skip interceptor refresh logic to avoid loops
      await api.post("/users/auth/refresh/", null, { _skipRetry: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to refresh token" };
    }
  },

  /**
   * Validate current session
   */
  validateSession: async () => {
    try {
      const response = await api.get("/users/auth/validate/");
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: "Invalid session" };
    }
  },
};

export default djangoAuthService;
