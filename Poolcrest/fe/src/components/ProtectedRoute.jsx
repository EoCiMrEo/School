import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDjangoAuth } from "../contexts/DjangoAuthContext";
import Icon from "./AppIcon";

const ProtectedRoute = ({ children, requiredRole = null, roles = null }) => {
  const { user, userProfile, loading, isAuthenticated, hasRole } =
    useDjangoAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icon
            name="Loader2"
            size={24}
            className="animate-spin text-blue-600"
          />
          <span className="text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  const authed =
    typeof isAuthenticated === "function"
      ? isAuthenticated()
      : !!isAuthenticated;
  if (!authed) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Role checks: either a single requiredRole or an array of roles
  const roleDenied = (() => {
    if (!hasRole) return false;
    if (roles && Array.isArray(roles)) {
      return !roles.some((r) => hasRole(r));
    }
    if (requiredRole) {
      return !hasRole(requiredRole);
    }
    return false;
  })();

  if (roleDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full p-8 text-center">
          <Icon name="Shield" size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
