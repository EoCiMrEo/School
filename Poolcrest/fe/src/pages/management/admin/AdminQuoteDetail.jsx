import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quotesService } from "../../../utils/djangoServices";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const Field = ({ label, children }) => (
  <div className="mb-3">
    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
    <div className="text-sm text-gray-900 font-medium">{children ?? "—"}</div>
  </div>
);

const TextArea = ({ value, onChange, placeholder, required = false }) => (
  <textarea
    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    rows={4}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
  />
);

const AdminQuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // form state
  const [internalNotes, setInternalNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const res = await quotesService.getQuoteById(id);
      if (res.success) {
        setQuote(res.data);
      } else {
        setError(res.error || "Failed to load quote");
      }
      setLoading(false);
    })();
  }, [id]);

  const statusMeta = useMemo(() => ({
    draft: { label: "Draft", cls: "bg-gray-100 text-gray-700" },
    initialized: { label: "Initialized", cls: "bg-yellow-100 text-yellow-700" },
    processed: { label: "Processed", cls: "bg-blue-100 text-blue-700" },
    awaiting_payment: { label: "Awaiting Payment", cls: "bg-indigo-100 text-indigo-700" },
    paid: { label: "Paid", cls: "bg-emerald-100 text-emerald-700" },
    confirmed: { label: "Confirmed", cls: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", cls: "bg-red-100 text-red-700" },
    expired: { label: "Expired", cls: "bg-gray-100 text-gray-500" },
    cancelled: { label: "Cancelled", cls: "bg-gray-100 text-gray-500" },
  }), []);

  const onConfirm = async () => {
    setSubmitting(true);
    setActionMsg(null);
    const res = await quotesService.adminConfirmQuote(quote.id, {
      internal_notes: internalNotes,
      customer_notes: customerNotes,
    });
    setSubmitting(false);
    if (!res.success) return setActionMsg(res.error);
    setActionMsg(res.message || "Quote confirmed");
    setQuote((q) => ({ ...q, ...res.data }));
  };

  const onReject = async () => {
    setSubmitting(true);
    setActionMsg(null);
    const res = await quotesService.adminRejectQuote(quote.id, {
      reason: rejectReason,
      internal_notes: internalNotes,
      customer_notes: customerNotes,
    });
    setSubmitting(false);
    if (!res.success) return setActionMsg(res.error);
    setActionMsg(res.message || "Quote rejected");
    setQuote((q) => ({ ...q, ...res.data }));
  };

  const onComplete = async () => {
    setSubmitting(true);
    setActionMsg(null);
    const res = await quotesService.adminCompleteQuote(quote.id, {
      internal_notes: internalNotes,
      customer_notes: customerNotes,
    });
    setSubmitting(false);
    if (!res.success) return setActionMsg(res.error);
    setActionMsg(res.message || "Quote marked as processed");
    setQuote((q) => ({ ...q, ...res.data }));
  };

  if (loading)
    return (
      <div className="min-h-[40vh] grid place-items-center">
        <Icon name="Loader2" className="animate-spin text-blue-600" size={24} />
      </div>
    );
  if (error)
    return <div className="text-red-600">{error}</div>;
  if (!quote) return <div>Not found</div>;

  const status = quote.status;
  const isPending = status === "initialized" || status === "draft";
  const isConfirmed = status === "confirmed";
  const isProcessed = status === "processed";
  const isRejected = status === "rejected" || status === "cancelled" || status === "expired";
  // Try to infer payment state from common fields if present
  const isPaid = Boolean(
    quote?.is_paid ||
      quote?.paid_at ||
      quote?.payment_status === "paid" ||
      quote?.paid === true ||
      quote?.metadata?.stripe?.paid === true
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">Quote #{quote.quote_number}</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)} iconName="ArrowLeft">
            Back
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 rounded bg-blue-50 text-blue-700 text-sm">{actionMsg}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Details */}
        <div className="bg-white rounded shadow p-4 sm:p-6">
          <h3 className="text-base font-semibold mb-3">Details</h3>
          <Field label="Title">{quote.title}</Field>
          <Field label="Customer">{quote.customer_name}</Field>
          <Field label="Status">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusMeta[status]?.cls || "bg-gray-100 text-gray-700"}`}>
              {statusMeta[status]?.label || status}
            </span>
          </Field>
          <Field label="Total">${Number(quote.total_amount || 0).toFixed(2)}</Field>
          <Field label="Created At">{new Date(quote.created_at).toLocaleString()}</Field>
          {quote.valid_until && (
            <Field label="Valid Until">{new Date(quote.valid_until).toLocaleDateString()}</Field>
          )}
          <Field label="Customer Notes">
            <div className="whitespace-pre-wrap text-sm text-gray-800">{quote.notes || "—"}</div>
          </Field>
          {quote.internal_notes && (
            <Field label="Internal Notes">
              <div className="whitespace-pre-wrap text-sm text-gray-800">{quote.internal_notes}</div>
            </Field>
          )}
        </div>

        {/* Right: Items */}
        <div className="bg-white rounded shadow p-4 sm:p-6">
          <h3 className="text-base font-semibold mb-3">Items</h3>
          {quote.items?.length ? (
            <ul className="divide-y">
              {quote.items.map((it) => (
                <li key={it.id} className="py-2 flex justify-between text-sm">
                  <span>{it.description || it.service_detail?.name || "Item"}</span>
                  <span>${Number(it.total_price || 0).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No items</div>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded shadow p-4 sm:p-6">
        <h3 className="text-base font-semibold mb-3">Admin Actions</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {!(isPaid || isProcessed) && (
            <>
              <div>
                <div className="text-sm font-medium mb-2">Confirm</div>
                <div className="space-y-2">
                  <TextArea
                    value={internalNotes}
                    onChange={setInternalNotes}
                    placeholder="Internal notes (required)"
                    required
                  />
                  <TextArea
                    value={customerNotes}
                    onChange={setCustomerNotes}
                    placeholder="Customer-visible notes (optional)"
                  />
                  <Button
                    variant="success"
                    size="sm"
                    iconName="CheckCircle2"
                    disabled={submitting || !internalNotes.trim()}
                    onClick={onConfirm}
                  >
                    Confirm
                  </Button>
                </div>
              </div>

              {!isConfirmed && !isRejected && (
                <div>
                  <div className="text-sm font-medium mb-2">Reject</div>
                  <div className="space-y-2">
                    <TextArea
                      value={rejectReason}
                      onChange={setRejectReason}
                      placeholder="Reason (required)"
                      required
                    />
                    <TextArea
                      value={internalNotes}
                      onChange={setInternalNotes}
                      placeholder="Internal notes (required)"
                      required
                    />
                    <TextArea
                      value={customerNotes}
                      onChange={setCustomerNotes}
                      placeholder="Customer-visible notes (optional)"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      iconName="XCircle"
                      disabled={submitting || !rejectReason.trim() || !internalNotes.trim()}
                      onClick={onReject}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {(isPaid || isProcessed) && (
            <div>
              <div className="text-sm font-medium mb-2">{isProcessed ? "Complete" : "Mark Processed"}</div>
              <div className="space-y-2">
                <TextArea
                  value={internalNotes}
                  onChange={setInternalNotes}
                  placeholder="Internal notes (required)"
                  required
                />
                <TextArea
                  value={customerNotes}
                  onChange={setCustomerNotes}
                  placeholder="Customer-visible notes (optional)"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  iconName="Wrench"
                  disabled={submitting || !internalNotes.trim()}
                  onClick={onComplete}
                >
                  {isProcessed ? "Complete" : "Mark Processed"}
                </Button>
              </div>
            </div>
          )}
          {!(isPaid || isProcessed) && (
            <div className="text-xs text-gray-500 self-end hidden md:block">
              Mark Processed becomes available after payment is completed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminQuoteDetail;
