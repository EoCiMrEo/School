import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { profilesService } from "../../../utils/djangoServices";
import Pagination from "../../../components/ui/Pagination";
import Input from "../../../components/ui/Input";

const PAGE_SIZE = 10;

const AdminUsers = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchProfiles = async (signal) => {
    setLoading(true);
    setError(null);
    const params = { role: "customer" };
    if (search && search.trim().length > 1) params.search = search.trim();
    const res = await profilesService.getProfiles(params);
    if (signal?.aborted) return;
    if (res && res.success) {
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setItems(data);
      setPage(1);
      setLoading(false);
    } else {
      setError(res?.error || "Failed to load users");
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProfiles(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const id = setTimeout(() => fetchProfiles(controller.signal), 300);
    return () => {
      controller.abort();
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const start = (page - 1) * PAGE_SIZE;
  const paged = useMemo(() => items.slice(start, start + PAGE_SIZE), [items, start]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Users</h2>
        <div className="w-64">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3">{u.full_name || "—"}</td>
                  <td className="p-3">{u.user_email || u.user?.email || u.email || "—"}</td>
                  <td className="p-3">{u.phone || "—"}</td>
                  <td className="p-3">{u.role || "customer"}</td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <Link
                        className="text-blue-600 hover:underline"
                        to={`/management-users/${u.id}`}
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-gray-500 text-center">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            total={items.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
