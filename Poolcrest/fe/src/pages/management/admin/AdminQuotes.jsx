import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllIfNeeded } from "../../../store/managementSlice";
import Button from "../../../components/ui/Button";
import Pagination from "../../../components/ui/Pagination";

const AdminQuotes = () => {
  const dispatch = useDispatch();
  const { quotes: quotesDomain } = useSelector((s) => s.management);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    dispatch(fetchAllIfNeeded(["quotes"]));
  }, [dispatch]);

  useEffect(() => {
    if (quotesDomain.status === "succeeded" || quotesDomain.items?.length) {
      setQuotes(quotesDomain.items);
      setLoading(false);
      setError(null);
      setPage(1);
    } else if (quotesDomain.status === "error") {
      setLoading(false);
      setError(quotesDomain.error || "Failed to load quotes");
    } else if (quotesDomain.status === "loading") {
      setLoading(true);
    }
  }, [quotesDomain]);

  const start = (page - 1) * pageSize;
  const paged = quotes.slice(start, start + pageSize);

  const statusBadgeMeta = useMemo(
    () => ({
      draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
      initialized: { label: "Initialized", className: "bg-yellow-100 text-yellow-700" },
      processed: { label: "Processed", className: "bg-blue-100 text-blue-700" },
      awaiting_payment: {
        label: "Awaiting Payment",
        className: "bg-indigo-100 text-indigo-700",
      },
      paid: { label: "Paid", className: "bg-emerald-100 text-emerald-700" },
      confirmed: { label: "Confirmed", className: "bg-green-100 text-green-700" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
      expired: { label: "Expired", className: "bg-gray-100 text-gray-500" },
      cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-500" },
    }),
    []
  );

  return (
    <div>
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Quotes</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Quote #</th>
                <th className="p-3">Title</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Status</th>
                <th className="p-3">Amount</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((q) => (
                <tr key={q.id} className="border-b">
                  <td className="p-3">{q.quote_number}</td>
                  <td className="p-3">{q.title}</td>
                  <td className="p-3">{q.customer_name || "—"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        statusBadgeMeta[q.status]?.className || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusBadgeMeta[q.status]?.label || q.status}
                    </span>
                  </td>
                  <td className="p-3">${q.total_amount}</td>
                  <td className="p-3">
                    <div className="flex justify-end">
                      <Link to={`/management-quotes/${q.id}`}>
                        <Button size="sm" variant="secondary" iconName="Eye" className="px-3">
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-gray-500 text-center">
                    No quotes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            total={quotes.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminQuotes;
