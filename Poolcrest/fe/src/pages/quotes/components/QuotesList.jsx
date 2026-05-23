/**
 * Quotes List Component using Django Backend
 * Shows how to fetch and display quotes from Django API
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDjangoAuth } from "../../../contexts/DjangoAuthContext";
import { quotesService } from "../../../utils/djangoServices";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const QuotesList = ({ admin = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer, isStaff } = useDjangoAuth();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, confirmed, rejected, processed, draft

  useEffect(() => {
    if (isAuthenticated()) {
      loadQuotes();
    }
  }, [isAuthenticated, filter]);

  const loadQuotes = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      // If this page is opened in admin mode (via /quotes-admin), always show all
      if (admin) {
        const params = {};
        if (filter !== "all") {
          if (filter === "pending") {
            params.status_group = "pending";
          } else {
            params.status = filter;
          }
        }
        result = await quotesService.getQuotes(params);
      } else if (isCustomer()) {
        const params = {};
        if (filter !== "all") {
          if (filter === "pending") {
            params.status_group = "pending";
          } else {
            params.status = filter;
          }
        }
        result = await quotesService.getMyQuotes(params);
      } else {
        // Staff can see all quotes
        const params = {};
        if (filter !== "all") {
          if (filter === "pending") {
            params.status_group = "pending";
          } else {
            params.status = filter;
          }
        }
        result = await quotesService.getQuotes(params);
      }

      if (result.success) {
        setQuotes(result.data);
      } else {
        setError(result.error || "Failed to load quotes");
      }
    } catch (err) {
      setError("An error occurred while loading quotes");
      console.error("Error loading quotes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmQuote = async (quoteId) => {
    if (!window.confirm("Are you sure you want to confirm this quote?")) {
      return;
    }

    const result = await quotesService.confirmQuote(quoteId);

    if (result.success) {
      // Reload quotes to show updated status
      loadQuotes();
    } else {
      alert(result.error || "Failed to confirm quote");
    }
  };

  const handleSubmitDraft = async (quoteId) => {
    if (
      !window.confirm(
        "Submit this draft quote now? You won't be able to make further changes."
      )
    ) {
      return;
    }

    const result = await quotesService.submitDraftQuote(quoteId);

    if (result.success) {
      loadQuotes();
    } else {
      alert(result.error || "Failed to submit draft quote");
    }
  };

  const handleRejectQuote = async (quoteId) => {
    const reason = window.prompt(
      "Please provide a reason for rejection (optional):"
    );

    if (reason !== null) {
      // User didn't cancel
      const result = await quotesService.rejectQuote(quoteId, reason);

      if (result.success) {
        loadQuotes();
      } else {
        alert(result.error || "Failed to reject quote");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      initialized: "bg-yellow-100 text-yellow-700",
      processed: "bg-blue-100 text-blue-700",
      awaiting_payment: "bg-indigo-100 text-indigo-700",
      paid: "bg-emerald-100 text-emerald-700",
      confirmed: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      expired: "bg-gray-100 text-gray-500",
      cancelled: "bg-gray-100 text-gray-500",
    };

    const statusLabels = {
      initialized: "Pending",
      processed: "In Progress",
      awaiting_payment: "Awaiting Payment",
      paid: "Paid",
      confirmed: "Confirmed",
      rejected: "Rejected",
      expired: "Expired",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusColors[status] || "bg-gray-100"
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="mb-4">You need to be logged in to view quotes.</p>
          <Button onClick={() => navigate("/auth/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {admin ? "All Quotes" : isCustomer() ? "My Quotes" : "All Quotes"}
          </h1>
          <Button onClick={() => navigate("/quotes/create")}>
            <Icon name="Plus" size={20} className="mr-2" />
            Request New Quote
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === "pending"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Pending
          </button>
          {isCustomer() && (
            <button
              onClick={() => setFilter("draft")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === "draft"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Draft
            </button>
          )}
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === "confirmed"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === "paid"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === "rejected"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Rejected
          </button>
          {!isCustomer() && (
            <button
              onClick={() => setFilter("processed")}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                filter === "processed"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Processed
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Quotes List */}
        {!loading && quotes.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Icon
              name="FileText"
              size={48}
              className="mx-auto mb-4 text-gray-400"
            />
            <p className="text-gray-600 mb-4">No quotes found</p>
            <Button onClick={() => navigate("/quotes/create")}>
              Create Your First Quote
            </Button>
          </div>
        )}

        {!loading && quotes.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote #
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  {isStaff() && (
                    <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Customer
                    </th>
                  )}
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Valid Until
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {quote.quote_number}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {quote.title}
                    </td>
                    {isStaff() && (
                      <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                        {quote.customer_name || "N/A"}
                      </td>
                    )}
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {formatCurrency(quote.total_amount || 0)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                      {formatDate(quote.created_at)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                      {quote.valid_until
                        ? formatDate(quote.valid_until)
                        : "N/A"}
                      {quote.is_expired && (
                        <span className="ml-1 text-red-600">(Expired)</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/quotes/${quote.id}`)}
                          className="p-2 rounded-full hover:bg-blue-50 text-blue-600 transition"
                          aria-label="View quote"
                          title="View quote"
                        >
                          <Icon name="Eye" size={18} />
                        </button>

                        {quote.status === "draft" && isCustomer() && (
                          <button
                            type="button"
                            onClick={() => handleSubmitDraft(quote.id)}
                            className="p-2 rounded-full hover:bg-green-50 text-green-600 transition"
                            aria-label="Submit quote"
                            title="Submit quote"
                          >
                            <Icon name="Send" size={18} />
                          </button>
                        )}

                        {quote.status === "awaiting_payment" &&
                          isCustomer() && (
                            <>
                              <button
                                onClick={() => handleConfirmQuote(quote.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleRejectQuote(quote.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}

                        {isStaff() && quote.status === "initialized" && (
                          <Link
                            to={`/quotes/${quote.id}/process`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Process
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Stats */}
        {!loading && quotes.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Quotes</p>
              <p className="text-2xl font-bold">{quotes.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">
                {
                  quotes.filter((q) =>
                    ["initialized", "processed", "awaiting_payment"].includes(
                      q.status
                    )
                  ).length
                }
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold">
                {quotes.filter((q) => q.status === "confirmed").length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  quotes.reduce(
                    (sum, q) => sum + parseFloat(q.total_amount || 0),
                    0
                  )
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotesList;
