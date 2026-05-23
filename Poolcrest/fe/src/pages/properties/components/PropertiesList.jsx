import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { propertiesService } from "../../../utils/djangoServices";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const PropertiesList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await propertiesService.getMyProperties();
      if (res.success) setItems(res.data);
      else setError(res.error || "Failed to load properties");
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">My Properties</h1>
          <Button onClick={() => navigate("/properties/create")}>
            + Add Property
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-48">
            <Icon
              name="Loader2"
              size={24}
              className="animate-spin text-blue-600"
            />
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Icon
              name="Home"
              size={48}
              className="mx-auto mb-4 text-gray-400"
            />
            <p className="text-gray-600 mb-4">No properties found</p>
            <Button onClick={() => navigate("/properties/create")}>
              Create your first property
            </Button>
          </div>
        )}

        {/* Table */}
        {!loading && items.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Pool
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {p.property_name || p.display_name}
                        </span>
                        {p.is_primary && (
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                      {p.short_address || p.full_address}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                      {p.pool_type || "—"} / {p.pool_size || "—"}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          p.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <Link
                        to={`/properties/${p.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesList;
