import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllIfNeeded } from "../../store/managementSlice";
import Header from "components/ui/Header";

const ManagementHome = () => {
  const dispatch = useDispatch();
  const { services, promotions, users, quotes } = useSelector(
    (s) => s.management
  );

  useEffect(() => {
    dispatch(fetchAllIfNeeded(["services", "promotions", "users", "quotes"]));
  }, [dispatch]);

  const sections = [
    { name: "Services", path: "/management-services", total: services.count },
    {
      name: "Promotions",
      path: "/management-promotions",
      total: promotions.count,
    },
    { name: "Users", path: "/management-users", total: users.count },
    { name: "Quotes", path: "/management-quotes", total: quotes.count },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Management</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sections.map((s) => (
              <Link
                key={s.name}
                to={s.path}
                className="p-6 bg-white rounded shadow hover:shadow-md transition"
              >
                <div className="text-lg font-semibold">{s.name}</div>
                <div className="text-sm text-gray-500">
                  Administer {s.name.toLowerCase()}.
                </div>
                {typeof s.total === "number" && (
                  <div className="mt-3 inline-flex items-center text-sm font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                    Total {s.name}: <span className="ml-1">{s.total}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementHome;
