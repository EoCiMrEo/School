/**
 * Django Auth Context
 * Authentication context that works with Django backend
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import djangoAuthService from "../utils/djangoAuthService";
import secureStorage from "../utils/secureStorage";

const DjangoAuthContext = createContext();

export function DjangoAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);

        const cachedProfile = djangoAuthService.getCurrentUser();

        if (cachedProfile && isMounted) {
          setUserProfile(cachedProfile);
        }

        const loadSession = async () => {
          const sessionResult = await djangoAuthService.getSession();
          if (!sessionResult?.success) {
            return false;
          }

          if (isMounted) {
            setUser(sessionResult.data.user || null);
            setUserProfile(sessionResult.data.profile || null);
          }
          return true;
        };

        let hydrated = await loadSession();

        if (!hydrated) {
          const refreshResult = await djangoAuthService.refreshToken();
          if (refreshResult?.success) {
            hydrated = await loadSession();
          }
        }

        if (!hydrated && isMounted) {
          secureStorage.clearAll();
          setUser(null);
          setUserProfile(null);
          if (cachedProfile) {
            setAuthError("Session expired. Please login again.");
          }
        }
      } catch (error) {
        if (isMounted) {
          console.log("Auth initialization error:", error);
          // Don't set error for initialization failures
          setUser(null);
          setUserProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setAuthError(null);
      const result = await djangoAuthService.signIn(email, password);

      if (!result?.success) {
        setAuthError(result?.error || "Login failed");
        return { success: false, error: result?.error };
      }

      // Set user and profile from response
      setUser(result.data.user);
      setUserProfile(result.data.profile);

      return { success: true, data: result.data };
    } catch (error) {
      const errorMsg = "Something went wrong during login. Please try again.";
      setAuthError(errorMsg);
      console.log("Sign in error:", error);
      return { success: false, error: errorMsg };
    }
  };

  // Sign up function
  const signUp = async (email, password, userData = {}) => {
    try {
      setAuthError(null);
      const result = await djangoAuthService.signUp(email, password, userData);

      if (!result?.success) {
        setAuthError(result?.error || "Signup failed");
        return { success: false, error: result?.error };
      }

      // Auto-login after signup
      if (result.data.user && result.data.profile) {
        setUser(result.data.user);
        setUserProfile(result.data.profile);
      }

      return { success: true, data: result.data };
    } catch (error) {
      const errorMsg = "Something went wrong during signup. Please try again.";
      setAuthError(errorMsg);
      console.log("Sign up error:", error);
      return { success: false, error: errorMsg };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setAuthError(null);
      await djangoAuthService.signOut();

      // Clear state
      setUser(null);
      setUserProfile(null);

      return { success: true };
    } catch (error) {
      // Still clear state even if API call fails
      setUser(null);
      setUserProfile(null);

      console.log("Sign out error:", error);
      return { success: true }; // Return success since we cleared local state
    }
  };

  // Update profile function
  const updateProfile = async (updates) => {
    try {
      setAuthError(null);

      if (!userProfile?.id) {
        const errorMsg = "User not authenticated";
        setAuthError(errorMsg);
        return { success: false, error: errorMsg };
      }

      const result = await djangoAuthService.updateUserProfile(
        userProfile.id,
        updates
      );

      if (!result?.success) {
        setAuthError(result?.error || "Profile update failed");
        return { success: false, error: result?.error };
      }

      setUserProfile(result.data);
      return { success: true, data: result.data };
    } catch (error) {
      const errorMsg =
        "Something went wrong updating profile. Please try again.";
      setAuthError(errorMsg);
      console.log("Update profile error:", error);
      return { success: false, error: errorMsg };
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setAuthError(null);
      const result = await djangoAuthService.resetPassword(email);

      if (!result?.success) {
        setAuthError(result?.error || "Password reset failed");
        return { success: false, error: result?.error };
      }

      return { success: true };
    } catch (error) {
      const errorMsg =
        "Something went wrong sending reset email. Please try again.";
      setAuthError(errorMsg);
      console.log("Reset password error:", error);
      return { success: false, error: errorMsg };
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setAuthError(null);
      const result = await djangoAuthService.changePassword(
        currentPassword,
        newPassword
      );

      if (!result?.success) {
        setAuthError(result?.error || "Password change failed");
        return { success: false, error: result?.error };
      }

      return { success: true };
    } catch (error) {
      const errorMsg = "Failed to change password. Please try again.";
      setAuthError(errorMsg);
      console.log("Change password error:", error);
      return { success: false, error: errorMsg };
    }
  };

  // Verify email function (accepts token string or { token | code, email? })
  const verifyEmail = async (payload) => {
    try {
      setAuthError(null);
      const result = await djangoAuthService.verifyEmail(payload);

      if (!result?.success) {
        setAuthError(result?.error || "Email verification failed");
        return { success: false, error: result?.error };
      }

      // Refresh local session state so is_email_verified is reflected
      try {
        const refreshed = await djangoAuthService.getSession();
        if (refreshed?.success) {
          setUser(refreshed.data.user);
          setUserProfile(refreshed.data.profile);
        }
      } catch {}

      return { success: true };
    } catch (error) {
      const errorMsg = "Failed to verify email. Please try again.";
      setAuthError(errorMsg);
      console.log("Verify email error:", error);
      return { success: false, error: errorMsg };
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    try {
      setAuthError(null);
      const result = await djangoAuthService.resendVerificationEmail();

      if (!result?.success) {
        setAuthError(result?.error || "Failed to resend verification email");
        return { success: false, error: result?.error };
      }

      return { success: true };
    } catch (error) {
      const errorMsg = "Failed to resend verification email. Please try again.";
      setAuthError(errorMsg);
      console.log("Resend verification error:", error);
      return { success: false, error: errorMsg };
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const result = await djangoAuthService.getSession();
      
      if (result?.success) {
        setUser(result.data.user);
        setUserProfile(result.data.profile);
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.log("Refresh session error:", error);
      return { success: false };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return userProfile?.role === role;
  };

  // Check if user is staff (admin, manager, or technician)
  const isStaff = () => {
    return ["admin", "manager", "technician"].includes(userProfile?.role);
  };

  // Check if user is admin
  const isAdmin = () => {
    return userProfile?.role === "admin";
  };

  // Check if user is customer
  const isCustomer = () => {
    return userProfile?.role === "customer";
  };

  const value = {
    user,
    userProfile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    changePassword,
    verifyEmail,
    resendVerificationEmail,
    refreshSession,
    clearError: () => setAuthError(null),
    isAuthenticated: () => djangoAuthService.isAuthenticated() || !!user,
    hasRole,
    isStaff,
    isAdmin,
    isCustomer,
  };

  return (
    <DjangoAuthContext.Provider value={value}>
      {children}
    </DjangoAuthContext.Provider>
  );
}

export const useDjangoAuth = () => {
  const context = useContext(DjangoAuthContext);
  if (!context) {
    throw new Error("useDjangoAuth must be used within a DjangoAuthProvider");
  }
  return context;
};

export default DjangoAuthContext;
