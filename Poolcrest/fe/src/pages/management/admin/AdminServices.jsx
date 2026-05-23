import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllIfNeeded } from "../../../store/managementSlice";
import Icon from "../../../components/AppIcon";
import Pagination from "../../../components/ui/Pagination";
import { servicesService } from "../../../utils/djangoServices";

const AdminServices = () => {
  const dispatch = useDispatch();
  const { services: servicesDomain } = useSelector((s) => s.management);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchAllIfNeeded(["services"]));
  }, [dispatch]);

  useEffect(() => {
    if (servicesDomain.status === "succeeded" || servicesDomain.items?.length) {
      setServices(servicesDomain.items);
      setLoading(false);
      setError(null);
      setPage(1);
    } else if (servicesDomain.status === "error") {
      setLoading(false);
      setError(servicesDomain.error || "Failed to load services");
    } else if (servicesDomain.status === "loading") {
      setLoading(true);
    }
  }, [servicesDomain]);

  const start = (page - 1) * pageSize;
  const paged = services.slice(start, start + pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Services</h2>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
          disabled
        >
          + New Service (coming soon)
        </button>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Base Price</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Status</th>
                <th className="p-3 w-32">Tools</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.category || "—"}</td>
                  <td className="p-3">${s.base_price}</td>
                  <td className="p-3">{s.duration_minutes} min</td>
                  <td className="p-3">{s.status ? "Active" : "Inactive"}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <button
                        title="View"
                        className="hover:text-blue-600"
                        onClick={() => navigate(`/management-services/${s.id}`)}
                      >
                        <Icon name="Eye" size={18} />
                      </button>
                      <button
                        title="Edit"
                        className="hover:text-amber-600"
                        onClick={() =>
                          navigate(`/management-services/${s.id}/edit`)
                        }
                      >
                        <Icon name="Pencil" size={18} />
                      </button>
                      <button
                        title="Delete"
                        className="hover:text-red-600"
                        onClick={async () => {
                          if (!window.confirm("Delete this service?")) return;
                          const res = await servicesService.deleteService(s.id);
                          if (res.success) {
                            setServices((prev) =>
                              prev.filter((x) => x.id !== s.id)
                            );
                          } else {
                            alert(res.error || "Delete failed");
                          }
                        }}
                      >
                        <Icon name="Trash2" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-gray-500 text-center">
                    No services yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            total={services.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminServices;
