import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDjangoAuth } from "../../contexts/DjangoAuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Icon from "../../components/AppIcon";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, authError, clearError } = useDjangoAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (clearError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result?.success) {
        navigate("/homepage");
      }
    } catch (error) {
      console.log("Login submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            to="/homepage"
            className="inline-flex items-center space-x-3 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
              <Icon name="Waves" size={24} color="white" />
            </div>
            <div>
              <span className="text-2xl font-inter font-bold text-gray-900">
                Welcome to
              </span>
            </div>
            <div>
              <span className="text-2xl font-inter font-bold text-blue-800">
                Poolcrest
              </span>
            </div>
          </Link>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form
          className="mt-8 space-y-6 bg-white rounded-lg shadow-xl p-8"
          onSubmit={handleSubmit}
        >
          {/* Error Message */}
          {authError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{authError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                <Icon name={showPassword ? "EyeOff" : "Eye"} size={20} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-medium mb-2">
              Demo Credentials:
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    email: "customer@poolcrest.com",
                    password: "mypassMypass!23",
                  });
                }}
                className="text-xs text-blue-600 hover:underline block"
              >
                Customer: customer@poolcrest.com / mypassMypass!23
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    email: "admin@poolcrest.com",
                    password: "adminAdmin!23",
                  });
                }}
                className="text-xs text-blue-600 hover:underline block"
              >
                Admin: admin@poolcrest.com / adminAdmin!23
              </button>
            </div>
          </div>
        </form>

        {/* Sign up link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
