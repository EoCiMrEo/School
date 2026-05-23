import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { paymentsService } from "../../utils/djangoServices";
import Icon from "../../components/AppIcon";
import Header from "../../components/ui/Header";

const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    Number(amount || 0)
  );

const Billing = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const res = await paymentsService.getMyPayments();
      if (res.success) setItems(res.data);
      else setError(res.error || "Failed to load payments");
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <Icon name="Loader2" className="animate-spin text-blue-600" size={24} />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  return (
    <>
      <Header />
  {/* Keep spacing aligned with Header height */}
  <main className="pt-14 lg:pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Billing</h1>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Icon name="ArrowLeft" size={18} className="mr-1" />
              Back
            </button>
          </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">Date</th>
              <th className="p-3">Quote</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No payments yet.
                </td>
              </tr>
            )}
            {items.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">
                  {p.paid_at
                    ? new Date(p.paid_at).toLocaleString()
                    : new Date(p.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  {p.quote ? (
                    <Link
                      to={`/quotes/${p.quote}`}
                      className="text-blue-600 hover:underline"
                    >
                      {p.quote_number || p.quote}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3 uppercase">{p.provider || "stripe"}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      {
                        initiated: "bg-yellow-100 text-yellow-700",
                        paid: "bg-emerald-100 text-emerald-700",
                        failed: "bg-red-100 text-red-700",
                        refunded: "bg-blue-100 text-blue-700",
                        cancelled: "bg-gray-100 text-gray-600",
                      }[p.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {p.status?.[0]?.toUpperCase() + p.status?.slice(1)}
                  </span>
                </td>
                <td className="p-3 text-right font-medium">
                  {formatCurrency(p.amount, (p.currency || "USD").toUpperCase())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </main>
    </>
  );
};

export default Billing;
