import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { quotesService } from "../../../utils/djangoServices";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const status = quote?.status;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await quotesService.getQuoteById(id);
      if (res.success) setQuote(res.data);
      else setError(res.error || "Failed to load quote");
      setLoading(false);
    };
    load();
  }, [id]);

  // Show simple status notice when redirected back from Stripe and refresh quote
  useEffect(() => {
    const usp = new URLSearchParams(window.location.search);
    const p = usp.get("payment");
    const sessionId = usp.get("session_id");
    if (p === "success") setSuccessMsg("Payment completed successfully.");
    if (p === "cancelled")
      setActionError("Payment was cancelled. You can try again.");

    const shouldRefresh = p === "success" || p === "cancelled";
    if (!shouldRefresh) return;

    let cancelled = false;
    const refetch = async () => {
      const res = await quotesService.getQuoteById(id);
      if (cancelled) return;
      if (res.success) setQuote(res.data);
    };

    // If we have session_id after success, ask backend to verify and update
    const maybeVerify = async () => {
      if (p === "success") {
        await quotesService.verifyPayment(id, sessionId);
      }
    };

    // Initial verification then refresh
    maybeVerify().finally(refetch);

    // If success, poll a couple of times to allow webhook to update metadata
    if (p === "success") {
      const t1 = setTimeout(refetch, 1500);
      const t2 = setTimeout(refetch, 3000);
      const t3 = setTimeout(refetch, 5000);
      return () => {
        cancelled = true;
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, []);

  const isDraft = status === "draft";
  const isConfirmed = status === "confirmed";
  const isAwaitingPayment = status === "awaiting_payment";
  // Try to infer payment state from common fields if present
  const isPaid = Boolean(
    quote?.is_paid ||
      quote?.paid_at ||
      quote?.payment_status === "paid" ||
      quote?.paid === true ||
      quote?.metadata?.stripe?.paid === true
  );

  const [payLoading, setPayLoading] = useState(false);
  const handleMakePayment = async () => {
    // Prefer server-provided payment URL if already present
    const paymentUrl = quote?.payment_url || quote?.checkout_url || null;
    if (paymentUrl) {
      window.location.href = paymentUrl;
      return;
    }
    setPayLoading(true);
    const res = await quotesService.createCheckoutSession(quote.id);
    setPayLoading(false);
    if (res.success && res.url) {
      window.location.href = res.url;
      return;
    }
    // Fallback in case of error
    setActionError(res.error || "Unable to start payment. Please try again later.");
  };

  const statusMeta = {
    label:
      {
        draft: "Draft",
        initialized: "Pending",
        processed: "In Progress",
        awaiting_payment: "Awaiting Payment",
        paid: "Paid",
        confirmed: "Confirmed",
        rejected: "Rejected",
        expired: "Expired",
        cancelled: "Cancelled",
      }[status] || status || "Unknown",
    badgeClass: `inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
      {
        draft: "bg-gray-100 text-gray-700",
        initialized: "bg-yellow-100 text-yellow-700",
        processed: "bg-blue-100 text-blue-700",
        awaiting_payment: "bg-indigo-100 text-indigo-700",
        paid: "bg-emerald-100 text-emerald-700",
        confirmed: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
        expired: "bg-gray-100 text-gray-500",
        cancelled: "bg-gray-100 text-gray-500",
      }[status] || "bg-gray-100 text-gray-700"
    }`,
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Icon name="Loader2" size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
        <Button variant="secondary" onClick={() => navigate("/quotes")}>
          Back to Quotes
        </Button>
      </div>
    );
  }

  if (!quote) return null;

  const handleEdit = () => {
    navigate(`/quotes/create?edit=${quote.id}`, {
      state: { editQuoteId: quote.id },
    });
  };

  const handleSubmitDraft = async () => {
    if (
      !window.confirm(
        "Submit this draft quote now? You won't be able to edit it afterwards."
      )
    ) {
      return;
    }

    setActionError(null);
    setActionLoading(true);
    const result = await quotesService.submitDraftQuote(quote.id);
    setActionLoading(false);

    if (result.success) {
      navigate("/quotes");
    } else {
      setActionError(result.error || "Failed to submit quote");
    }
  };

  const handleDeleteDraft = async () => {
    if (
      !window.confirm(
        "Delete this draft quote? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionError(null);
    setActionLoading(true);
    const result = await quotesService.deleteDraftQuote(quote.id);
    setActionLoading(false);

    if (result.success) {
      navigate("/quotes");
    } else {
      setActionError(result.error || "Failed to delete quote");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Quote #{quote.quote_number}</h1>
        <div className="flex items-center gap-2">
          {isDraft && (
            <>
              <Button
                variant="secondary"
                onClick={handleEdit}
                disabled={actionLoading}
                iconName="Edit3"
                size="sm"
              >
                Edit
              </Button>
              <Button
                variant="success"
                onClick={handleSubmitDraft}
                disabled={actionLoading}
                iconName="Send"
                size="sm"
              >
                Submit
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteDraft}
                disabled={actionLoading}
                iconName="Trash2"
                size="sm"
              >
                Delete
              </Button>
            </>
          )}
          {(isConfirmed || isAwaitingPayment) && !isPaid && (
            <Button
              variant="primary"
              onClick={handleMakePayment}
              iconName="CreditCard"
              size="sm"
              disabled={payLoading}
            >
              {payLoading ? "Starting…" : "Make Payment"}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => navigate("/quotes")}
            iconName="ArrowLeft"
            size="sm"
          >
            Back
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-700">{successMsg}</div>
      )}
      {actionError && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700">{actionError}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Title:</strong> {quote.title}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Status:</strong>{" "}
            <span className={statusMeta.badgeClass}>{statusMeta.label}</span>
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <strong>Total:</strong> ${quote.total_amount || 0}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Created:</strong>{" "}
            {new Date(quote.created_at).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Items</h2>
          {quote.items?.length ? (
            <>
              {/* Desktop/tablet: table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-2">Item</th>
                      <th className="py-2 px-2 text-right">Unit Price</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 pl-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.items.map((it) => {
                      const name = it.description || it.service_detail?.name || it.service?.name || "Item";
                      const qty = Number(it.quantity ?? 1);
                      const unit = Number(it.unit_price ?? it.price ?? 0);
                      const total = Number(it.total_price ?? qty * unit);
                      return (
                        <tr key={it.id} className="border-b">
                          <td className="py-2 pr-2">
                            <div className="font-medium text-gray-900">{name}</div>
                            {it.service_detail?.category && (
                              <div className="text-xs text-gray-500">{it.service_detail.category}</div>
                            )}
                          </td>
                          <td className="py-2 px-2 text-right">${unit.toFixed(2)}</td>
                          <td className="py-2 px-2 text-right">{qty}</td>
                          <td className="py-2 pl-2 text-right font-medium">${total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: card rows */}
              <ul className="md:hidden space-y-3">
                {quote.items.map((it) => {
                  const name = it.description || it.service_detail?.name || it.service?.name || "Item";
                  const qty = Number(it.quantity ?? 1);
                  const unit = Number(it.unit_price ?? it.price ?? 0);
                  const total = Number(it.total_price ?? qty * unit);
                  return (
                    <li key={it.id} className="border rounded-md p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{name}</div>
                          <div className="text-xs text-gray-500">{qty} × ${unit.toFixed(2)}</div>
                        </div>
                        <div className="text-sm font-semibold">${total.toFixed(2)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-sm text-gray-500">No items</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;
