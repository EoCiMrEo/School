import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllIfNeeded } from "../../../store/managementSlice";
import Pagination from "../../../components/ui/Pagination";

const AdminProperties = () => {
  const dispatch = useDispatch();
  const { properties: propertiesDomain } = useSelector((s) => s.management);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    dispatch(fetchAllIfNeeded(["properties"]));
  }, [dispatch]);

  useEffect(() => {
    if (
      propertiesDomain.status === "succeeded" ||
      propertiesDomain.items?.length
    ) {
      setProperties(propertiesDomain.items);
      setLoading(false);
      setError(null);
      setPage(1);
    } else if (propertiesDomain.status === "error") {
      setLoading(false);
      setError(propertiesDomain.error || "Failed to load properties");
    } else if (propertiesDomain.status === "loading") {
      setLoading(true);
    }
  }, [propertiesDomain]);

  const start = (page - 1) * pageSize;
  const paged = properties.slice(start, start + pageSize);

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Properties</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Address</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3">{p.property_name || "—"}</td>
                  <td className="p-3">{p.short_address || p.address || "—"}</td>
                  <td className="p-3">
                    {p.owner_name || p.customer_name || "—"}
                  </td>
                  <td className="p-3">{p.is_active ? "Active" : "Inactive"}</td>
                </tr>
              ))}
              {properties.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-gray-500 text-center">
                    No properties yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            total={properties.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
