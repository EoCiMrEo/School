import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";

const tabs = [
  { name: "Services", path: "/management-services" },
  { name: "Promotions", path: "/management-promotions" },
  { name: "Users", path: "/management-users" },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 pb-6 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Management</h1>
          <Link
            to="/management"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm"
          >
            <span aria-hidden>←</span>
            <span>Back to Management Home</span>
          </Link>
        </div>

        <div className="flex space-x-4 border-b border-gray-200 mb-6">
          {tabs.map((t) => (
            <NavLink
              key={t.path}
              to={t.path}
              className={({ isActive }) =>
                `px-3 py-2 -mb-px border-b-2 text-sm ${
                  isActive
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`
              }
            >
              {t.name}
            </NavLink>
          ))}
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
