import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllIfNeeded } from "../../../store/managementSlice";
import Icon from "../../../components/AppIcon";
import Pagination from "../../../components/ui/Pagination";
import useWebSocket from "../../../utils/useWebSocket";
import { api } from "../../../utils/api";

const AdminPromotions = () => {
  const dispatch = useDispatch();
  const { promotions: promosDomain } = useSelector((s) => s.management);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    dispatch(fetchAllIfNeeded(["promotions"]));
  }, [dispatch]);

  useEffect(() => {
    if (promosDomain.status === "succeeded" || promosDomain.items?.length) {
      setPromos(promosDomain.items);
      setLoading(false);
      setError(null);
      setPage(1);
    } else if (promosDomain.status === "error") {
      setLoading(false);
      setError(promosDomain.error || "Failed to load promotions");
    } else if (promosDomain.status === "loading") {
      setLoading(true);
    }
  }, [promosDomain]);

  const start = (page - 1) * pageSize;
  const paged = promos.slice(start, start + pageSize);

  // Live updates via WebSocket
  useWebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${
      location.host
    }/ws/promotions/`,
    {
      onMessage: (msg) => {
        if (!msg?.type) return;
        if (
          [
            "promotion.updated",
            "promotion.created",
            "promotion.deleted",
          ].includes(msg.type)
        ) {
          // Refetch minimal list quickly
          api
            .get("/promotions/", { params: { ordering: "-created_at" } })
            .then((res) => {
              const data = res.data;
              const items = Array.isArray(data) ? data : data?.results || [];
              setPromos(items);
            })
            .catch(() => {});
        }
      },
    }
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">Promotions</h2>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
          disabled
        >
          + New Promotion (coming soon)
        </button>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Value</th>
                <th className="p-3">Active</th>
                <th className="p-3 w-32">Tools</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3">{p.code}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.discount_type}</td>
                  <td className="p-3">{p.discount_value}</td>
                  <td className="p-3">{p.is_active ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <button
                        title="View"
                        className="hover:text-blue-600"
                        onClick={() => alert(`View promo #${p.id}`)}
                      >
                        <Icon name="Eye" size={18} />
                      </button>
                      <button
                        title="Edit"
                        className="hover:text-amber-600"
                        onClick={() => alert(`Edit promo #${p.id}`)}
                      >
                        <Icon name="Pencil" size={18} />
                      </button>
                      <button
                        title="Delete"
                        className="hover:text-red-600"
                        onClick={() => alert(`Delete promo #${p.id}`)}
                      >
                        <Icon name="Trash2" size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-gray-500 text-center">
                    No promotions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            total={promos.length}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
