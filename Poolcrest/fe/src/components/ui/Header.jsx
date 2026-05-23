import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDjangoAuth } from "../../contexts/DjangoAuthContext";
import Icon from "../AppIcon";
import Button from "./Button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMgmtOpenMobile, setIsMgmtOpenMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut, loading } = useDjangoAuth();

  const navigationItems = [
    { name: "Home", path: "/homepage", icon: "Home" },
    { name: "Services", path: "/services", icon: "Wrench" },
    {
      name: "Emergency Repairs",
      path: "/emergency-repairs",
      icon: "AlertTriangle",
    },
    // { name: "Maintenance Plans", path: "/maintenance-plans", icon: "Calendar" },
    { name: "About Us", path: "/about-poolcrest", icon: "Users" },
  ];

  const userMenuItems = [
    { name: "Profile", path: "/auth/profile", icon: "User" },
    { name: "My Properties", path: "/properties", icon: "Home" },
    { name: "My Quotes", path: "/quotes", icon: "FileText" },
    // { name: "Appointments", path: "/appointments", icon: "Calendar" },
    { name: "Billing", path: "/billing", icon: "CreditCard" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const displayName = userProfile?.full_name || user?.email || "User";
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link to="/homepage" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
              <Icon name="Waves" size={24} color="white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Poolcrest</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Get Quote Button - Always visible */}
            <Link to="/request-quote" className="hidden sm:block">
              <Button size="sm" className="shadow-md">
                Get Quote
              </Button>
            </Link>

            {/* User Menu or Login Button */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="User" size={18} className="text-blue-600" />
                  </div>
                  {/* User name: hidden on very small screens, truncate to avoid overflow */}
                  <span className="hidden sm:inline-block text-sm font-medium text-gray-800 max-w-[140px] truncate">
                    {displayName}
                  </span>
                  <Icon
                    name="ChevronDown"
                    size={16}
                    className={`text-gray-600 transition-transform ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile?.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userProfile?.email || user?.email}
                      </p>
                    </div>

                    {/* Management section for staff roles with hover submenu */}
                    {["admin", "manager", "owner"].includes(
                      userProfile?.role
                    ) && (
                      <>
                        <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-400">
                          Management
                        </div>
                        {/* Desktop: hover flyout; Mobile: click to expand inline */}
                        <div className="relative group">
                          <button
                            className="flex w-full items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors lg:cursor-default"
                            onClick={() => setIsMgmtOpenMobile((v) => !v)}
                          >
                            <Icon name="Settings" size={16} />
                            <span>Admin Management</span>
                            <Icon
                              name="ChevronRight"
                              size={16}
                              className="ml-auto text-gray-400 hidden lg:block"
                            />
                            <Icon
                              name={
                                isMgmtOpenMobile ? "ChevronUp" : "ChevronDown"
                              }
                              size={16}
                              className="ml-auto text-gray-400 lg:hidden"
                            />
                          </button>
                          {/* Desktop hover menu */}
                          <div className="absolute right-full top-0 hidden lg:group-hover:block lg:bg-white lg:rounded-lg lg:shadow-xl lg:border lg:border-gray-100 lg:w-60 lg:py-2">
                            <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-400">
                              Management
                            </div>
                            <Link
                              to="/management"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Icon name="LayoutDashboard" size={16} />
                              <span>Dashboard</span>
                            </Link>
                            <div className="my-1 border-t border-gray-100"></div>
                            <Link
                              to="/management-services"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Icon name="Wrench" size={16} />
                              <span>Services</span>
                            </Link>
                            <Link
                              to="/management-promotions"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Icon name="Percent" size={16} />
                              <span>Promotions</span>
                            </Link>
                            <Link
                              to="/management-users"
                              onClick={() => setIsProfileMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Icon name="Users" size={16} />
                              <span>Users</span>
                            </Link>
                            {/* Removed Quotes/Properties from Management flyout per request */}
                          </div>
                          {/* Mobile inline submenu */}
                          {isMgmtOpenMobile && (
                            <div className="lg:hidden pl-10 pr-2 py-2 space-y-1">
                              <Link
                                to="/management"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                              >
                                <Icon name="LayoutDashboard" size={16} />
                                <span>Dashboard</span>
                              </Link>
                              <div className="border-t border-gray-100 my-1" />
                              <Link
                                to="/management-services"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                              >
                                <Icon name="Wrench" size={16} />
                                <span>Services</span>
                              </Link>
                              <Link
                                to="/management-promotions"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                              >
                                <Icon name="Percent" size={16} />
                                <span>Promotions</span>
                              </Link>
                              <Link
                                to="/management-users"
                                onClick={() => setIsProfileMenuOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                              >
                                <Icon name="Users" size={16} />
                                <span>Users</span>
                              </Link>
                              {/* Removed Quotes/Properties from Management submenu per request */}
                            </div>
                          )}
                        </div>
                        <div className="border-t border-gray-100 my-2"></div>
                      </>
                    )}

                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name={item.icon} size={16} />
                        <span>{item.name}</span>
                      </Link>
                    ))}

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <Icon name="LogOut" size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth/login">
                <Button variant="secondary" size="sm">
                  <Icon name="LogIn" size={16} className="mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Icon
                name={isMenuOpen ? "X" : "Menu"}
                size={24}
                className="text-gray-700"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <nav className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            <Link
              to="/request-quote"
              onClick={() => setIsMenuOpen(false)}
              className="block sm:hidden"
            >
              <Button className="w-full mt-4">Get Quote</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
