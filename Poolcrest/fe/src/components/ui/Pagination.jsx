import React from "react";

const Pagination = ({ total = 0, page = 1, pageSize = 8, onPageChange }) => {
  if (!total || total <= pageSize) return null;
  const totalPages = Math.ceil(total / pageSize);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const go = (p) => {
    if (p < 1 || p > totalPages) return;
    onPageChange?.(p);
  };

  // Render compact pager with first, prev, current, next, last
  return (
    <div className="flex items-center justify-between py-3 px-2 text-sm">
      <div className="text-gray-600">
        Page {page} of {totalPages}
      </div>
      <div className="inline-flex items-center gap-1">
        <button
          className="px-2 py-1 rounded border text-gray-700 disabled:opacity-40"
          onClick={() => go(1)}
          disabled={!canPrev}
        >
          « First
        </button>
        <button
          className="px-2 py-1 rounded border text-gray-700 disabled:opacity-40"
          onClick={() => go(page - 1)}
          disabled={!canPrev}
        >
          ‹ Prev
        </button>
        <span className="px-2">{page}</span>
        <button
          className="px-2 py-1 rounded border text-gray-700 disabled:opacity-40"
          onClick={() => go(page + 1)}
          disabled={!canNext}
        >
          Next ›
        </button>
        <button
          className="px-2 py-1 rounded border text-gray-700 disabled:opacity-40"
          onClick={() => go(totalPages)}
          disabled={!canNext}
        >
          Last »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
