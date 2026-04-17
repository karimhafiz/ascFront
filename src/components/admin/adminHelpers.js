import { useState, useEffect } from "react";

export const PAGE_SIZE = 15;

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const ENROLLMENT_STATUS = {
  pending: { label: "Pending", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  paid: { label: "Paid", classes: "bg-green-50 text-green-700 border-green-200" },
  free: { label: "Free", classes: "bg-blue-50 text-blue-600 border-blue-200" },
  active: { label: "Active", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", classes: "bg-red-50 text-red-600 border-red-200" },
  past_due: { label: "Past Due", classes: "bg-orange-50 text-orange-600 border-orange-200" },
};

export const roleBadgeClass = {
  admin: "bg-yellow-100 text-yellow-800 border-yellow-300",
  moderator: "bg-blue-100 text-blue-700 border-blue-200",
  user: "bg-base-200 text-base-content/70 border-base-300",
};

export function usePagination(items, deps) {
  const [page, setPage] = useState(1);

  // Reset to page 1 when dependencies (search/sort/filter) change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  return { page: safePage, totalPages, setPage, paged, total: items.length };
}
