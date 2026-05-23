import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDjangoAuth } from "../../contexts/DjangoAuthContext";
import Header from "../../components/ui/Header";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Icon from "../../components/AppIcon";

const Profile = () => {
  const {
    user,
    userProfile,
    updateProfile,
    loading: authLoading,
    signOut,
    resetPassword,
    resendVerificationEmail,
  } = useDjangoAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company_name: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load user profile data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        phone: userProfile.phone || "",
        company_name: userProfile.company_name || "",
        address: userProfile.address || "",
      });
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");
    try {
      const res = await resendVerificationEmail();
      if (res?.success) {
        setSuccess("Verification email sent. Please check your inbox.");
      } else {
        setError(res?.error || "Failed to send verification email.");
      }
    } catch (e) {
      setError("Failed to send verification email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError("");
    setSuccess("");

    try {
      const result = await updateProfile(formData);

      if (result?.success) {
        setSuccess("Profile updated successfully!");
      } else {
        setError(result?.error || "Failed to update profile");
      }
    } catch (error) {
      setError("An error occurred while updating your profile");
      console.error("Profile update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Sends a password reset email to the user's email
  const handleResetPassword = async () => {
    const email = userProfile?.email || user?.email;
    if (!email) return;
    setIsResetting(true);
    setError("");
    setSuccess("");
    try {
      const result = await resetPassword(email);
      if (result?.success) {
        setSuccess(
          `Password reset email sent to ${email}. Please check your inbox.`
        );
      } else {
        setError(result?.error || "Failed to send reset email");
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icon
            name="Loader2"
            size={24}
            className="animate-spin text-blue-600"
          />
          <span className="text-gray-700">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          {/* Note: Tailwind breakpoints are mobile-first (min-width). Base styles apply to phones (<640px), xs:475 applies to larger phones, sm:640+, md:768+, lg:1024+. */}
          <div className="bg-white rounded-lg shadow p-6 mb-6 mt-20 xs:mt-16 sm:mt-16 md:mt-12 lg:mt-16">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="User" size={32} className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    My Profile
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-gray-600">
                      {userProfile?.email || user?.email}
                    </p>
                    {/* Email verified badge */}
                    {(() => {
                      const emailVerified =
                        userProfile?.email_verified ??
                        userProfile?.is_email_verified ??
                        user?.email_verified ??
                        user?.is_email_verified ??
                        user?.is_verified ??
                        false;
                      return (
                        <span
                          title={
                            emailVerified
                              ? "Email verified"
                              : "Email not verified"
                          }
                          className={
                            "inline-flex items-center px-2 py-0.5 text-xs rounded-full border " +
                            (emailVerified
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200")
                          }
                        >
                          <span
                            className={
                              "mr-1 inline-block w-1.5 h-1.5 rounded-full " +
                              (emailVerified ? "bg-green-500" : "bg-red-500")
                            }
                          />
                          {emailVerified ? "Verified" : "Not verified"}
                        </span>
                      );
                    })()}
                  </div>
                  {userProfile?.role && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      {userProfile.role.charAt(0).toUpperCase() +
                        userProfile.role.slice(1)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Icon name="LogOut" size={18} />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Icon
                  name="CheckCircle"
                  size={20}
                  className="text-green-600 mr-2"
                />
                <p className="text-green-700">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <Icon
                  name="AlertCircle"
                  size={20}
                  className="text-red-600 mr-2"
                />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Profile Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 mb-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Company
                </label>
                <Input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Acme Inc."
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={userProfile?.email || user?.email || ""}
                  disabled
                  className="bg-gray-50"
                />
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  {(() => {
                    const emailVerified =
                      userProfile?.email_verified ??
                      userProfile?.is_email_verified ??
                      user?.email_verified ??
                      user?.is_email_verified ??
                      user?.is_verified ??
                      false;
                    return (
                      <>
                        {!emailVerified && (
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={isResending}
                            className="text-blue-600 hover:text-blue-700 text-xs underline"
                          >
                            {isResending
                              ? "Sending…"
                              : "Send verification email"}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    id="password"
                    type="password"
                    value="••••••••••••••••••••••••"
                    disabled
                    className="bg-gray-50 flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResetPassword}
                    disabled={isUpdating || isResetting}
                  >
                    {isResetting ? "Sending..." : "Reset Password"}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  You can’t view your password. Use Reset Password to receive a
                  reset link by email.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, City, State 12345"
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => window.location.reload()}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="flex items-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Icon name="Save" size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Account Info */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account ID</span>
                <span className="text-gray-900 font-mono text-sm">
                  {(userProfile?.id || user?.id).slice(-12)}
                  {/* Display last 12 characters */}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Type</span>
                <span className="text-gray-900">
                  {userProfile?.role || "Customer"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Account Status</span>
                <span className="text-green-600 font-medium">
                  {userProfile?.status || "Active"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Member Since</span>
                <span className="text-gray-900">
                  {userProfile?.created_at
                    ? new Date(userProfile.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
