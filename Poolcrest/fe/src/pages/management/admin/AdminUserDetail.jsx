import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { profilesService, propertiesService, quotesService } from "../../../utils/djangoServices";
import Pagination from "../../../components/ui/Pagination";

const PAGE_SIZE = 8;

const statusOptions = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
//   { value: "active", label: "Active" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const AdminUserDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qStatus, setQStatus] = useState("");
  const [page, setPage] = useState(1);

  const statusBadgeMeta = useMemo(
    () => ({
      initialized: { label: "Initialized", className: "bg-yellow-100 text-yellow-700" },
      processed: { label: "Processed", className: "bg-blue-100 text-blue-700" },
      awaiting_payment: { label: "Awaiting Payment", className: "bg-indigo-100 text-indigo-700" },
      paid: { label: "Paid", className: "bg-emerald-100 text-emerald-700" },
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-700" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
      expired: { label: "Expired", className: "bg-gray-100 text-gray-500" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-500" },
    }),
    []
  );

  const fetchAll = async (signal, statusValue = qStatus) => {
    try {
      setLoading(true);
      setError(null);

      const [pRes, propRes, qRes] = await Promise.all([
        profilesService.getProfileById(id),
        propertiesService.getProperties({ customer: id }),
        quotesService.getQuotes({ customer: id, ...(statusValue ? { status: statusValue } : {}) }),
      ]);

      if (signal?.aborted) return;

      if (!pRes?.success) throw new Error(pRes?.error || "Failed to load profile");
      setProfile(pRes.data);

      setProperties(Array.isArray(propRes?.data) ? propRes.data : propRes?.data?.results || []);

      const items = Array.isArray(qRes?.data) ? qRes.data : qRes?.data?.results || [];
      setQuotes(items);
    } catch (e) {
      setError(e.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchAll(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAll(controller.signal, qStatus);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qStatus]);

  const start = (page - 1) * PAGE_SIZE;
  const pagedQuotes = useMemo(() => quotes.slice(start, start + PAGE_SIZE), [quotes, start]);

  const fmtDate = (v, withTime = false) => {
    if (!v) return "—";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    const opts = withTime
      ? { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }
      : { year: "numeric", month: "short", day: "2-digit" };
    return new Intl.DateTimeFormat(undefined, opts).format(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">User Details</h2>
          <p className="text-gray-600 text-sm">View properties and quotes for this customer.</p>
        </div>
        <Link
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm"
          to="/management-users"
        >
          <span aria-hidden>←</span>
          <span>Back to Users</span>
        </Link>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && profile && (
        <>
          <div className="bg-white rounded shadow p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-base font-medium truncate">{profile.full_name || "—"}</div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <div className="text-gray-500">Email</div>
                    <div className="text-gray-800 break-all">{profile.user_email || profile.user?.email || profile.email || "—"}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-gray-500">Phone</div>
                    <div className="text-gray-800">{profile.phone || "—"}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-gray-500">Date of Birth</div>
                    <div className="text-gray-800">{fmtDate(profile.date_of_birth || profile.dob || profile.birth_date)}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-gray-500">Customer Since</div>
                    <div className="text-gray-800">{fmtDate(profile.user?.date_joined || profile.date_joined || profile.created_at || profile.created || profile.registered_at)}</div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-gray-500">Last Login</div>
                    <div className="text-gray-800">{fmtDate(profile.user?.last_login || profile.last_login || profile.user_last_login, true)}</div>
                  </div>
                </div>
              </div>
              <div className="sm:mt-0">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {profile.role || "customer"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded shadow">
              <div className="p-4 border-b">
                <h3 className="font-medium">Properties</h3>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Name</th>
                      <th className="p-2">Address</th>
                      <th className="p-2">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td className="p-2">{p.property_name || p.display_name || "—"}</td>
                        <td className="p-2 whitespace-nowrap">{p.short_address || p.full_address || "—"}</td>
                        <td className="p-2">{p.is_active ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                    {properties.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-3 text-gray-500 text-center">No properties</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded shadow">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium">Quotes</h3>
                <select
                  value={qStatus}
                  onChange={(e) => {
                    setQStatus(e.target.value);
                    setPage(1);
                  }}
                  className="text-sm border rounded px-2 py-1"
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="min-w-full text-xs sm:text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Quote #</th>
                      <th className="p-2">Title</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedQuotes.map((q) => (
                      <tr key={q.id} className="border-b">
                        <td className="p-2">{q.quote_number}</td>
                        <td className="p-2">{q.title}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadgeMeta[q.status]?.className || "bg-gray-100 text-gray-600"}`}>
                            {statusBadgeMeta[q.status]?.label || q.status}
                          </span>
                        </td>
                        <td className="p-2">${q.total_amount}</td>
                        <td className="p-2 text-right">
                          <Link to={`/management-quotes/${q.id}`} className="text-blue-600 hover:underline">Open</Link>
                        </td>
                      </tr>
                    ))}
                    {quotes.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-3 text-gray-500 text-center">No quotes</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <Pagination total={quotes.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUserDetail;
