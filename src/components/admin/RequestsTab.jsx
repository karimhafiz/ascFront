import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../../auth/auth";
import ConfirmModal from "../common/ConfirmModal";
import { formatDate } from "./adminHelpers";
import { REQUEST_STATUS_STYLES } from "../../util/pageContentRequestStatus";
import { usePageContentRequestReviewMutation } from "../../hooks/usePageContentMutation";
import { API } from "../../api/apiClient";
import { queryKeys } from "../../api/queryKeys";

const PAGE_LABELS = { home: "Home", about: "About" };

export default function RequestsTab() {
  const [modal, setModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const queryClient = useQueryClient();
  const reviewMutation = usePageContentRequestReviewMutation();

  const {
    data: requests,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.pageContentRequests.all,
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}pageContentRequests`);
      if (!res.ok) throw new Error("Failed to load requests");
      return res.json();
    },
  });

  const error = queryError?.message;
  const reviewingId = reviewMutation.isPending ? reviewMutation.variables?.id : null;

  const setRequestStatus = (id, patch) => {
    queryClient.setQueryData(queryKeys.pageContentRequests.all, (prev) =>
      prev ? prev.map((r) => (r._id === id ? { ...r, ...patch } : r)) : prev
    );
  };

  const promptReview = (request, action) => {
    const isApprove = action === "approve";
    setModal({
      title: isApprove ? "Approve request?" : "Decline request?",
      message: isApprove
        ? `Apply this change to the live ${PAGE_LABELS[request.page]} page?`
        : `Decline this change request for the ${PAGE_LABELS[request.page]} page?`,
      confirmLabel: isApprove ? "Approve" : "Decline",
      onConfirm: () => {
        setModal(null);
        reviewMutation.mutate(
          { id: request._id, action },
          {
            onSuccess: (data) => {
              setRequestStatus(request._id, {
                status: data.request.status,
                reviewedBy: data.request.reviewedBy,
                reviewedAt: data.request.reviewedAt,
              });
            },
            onError: (err) => alert(err.message || `Failed to ${action} request`),
          }
        );
      },
    });
  };

  if (loading) return <p className="text-center text-base-content/50 py-10">Loading requests…</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  const all = requests || [];
  const pending = all.filter((r) => r.status === "pending");
  const reviewed = all.filter((r) => r.status !== "pending");
  const activeList = statusFilter === "pending" ? pending : reviewed;

  const searched = activeList.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (PAGE_LABELS[r.page] ?? r.page).toLowerCase().includes(q) ||
      r.requestedBy?.name?.toLowerCase().includes(q) ||
      r.requestedBy?.email?.toLowerCase().includes(q)
    );
  });

  const sorted = [...searched].sort((a, b) => {
    if (!sort.key) return 0;
    if (sort.key === "page") {
      const va = (PAGE_LABELS[a.page] ?? a.page).toLowerCase();
      const vb = (PAGE_LABELS[b.page] ?? b.page).toLowerCase();
      return sort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    const va = new Date(a.createdAt);
    const vb = new Date(b.createdAt);
    return sort.dir === "asc" ? va - vb : vb - va;
  });

  return (
    <div>
      <ConfirmModal
        isOpen={modal}
        title={modal?.title}
        message={modal?.message}
        confirmLabel={modal?.confirmLabel}
        onConfirm={modal?.onConfirm}
        onCancel={() => setModal(null)}
      />

      {all.length === 0 ? (
        <p className="text-center text-base-content/50 py-10">No change requests yet</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <StatusToggle
              label={`Pending (${pending.length})`}
              active={statusFilter === "pending"}
              onClick={() => setStatusFilter("pending")}
            />
            <StatusToggle
              label={`Reviewed (${reviewed.length})`}
              active={statusFilter === "reviewed"}
              onClick={() => setStatusFilter("reviewed")}
            />
          </div>

          <input
            type="text"
            placeholder="Search by page or requester…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input mb-3"
          />

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs text-base-content/50">Sort:</span>
            <SortChip label="Page" sortKey="page" sort={sort} onSort={setSort} />
            <SortChip label="Submitted" sortKey="submitted" sort={sort} onSort={setSort} />
          </div>

          <div className="max-h-96 overflow-y-auto pr-1 space-y-3">
            {sorted.length === 0 ? (
              <p className="text-center text-base-content/50 py-10">No matching requests</p>
            ) : (
              sorted.map((r) => (
                <RequestCard
                  key={r._id}
                  request={r}
                  reviewing={reviewingId}
                  onApprove={r.status === "pending" ? (req) => promptReview(req, "approve") : null}
                  onDecline={r.status === "pending" ? (req) => promptReview(req, "decline") : null}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatusToggle({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
        active
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-base-100 text-base-content/70 border-base-300 hover:bg-base-200"
      }`}
    >
      {label}
    </button>
  );
}

function SortChip({ label, sortKey, sort, onSort }) {
  const isActive = sort.key === sortKey;

  const handleClick = () => {
    if (!isActive) onSort({ key: sortKey, dir: "asc" });
    else if (sort.dir === "asc") onSort({ key: sortKey, dir: "desc" });
    else onSort({ key: null, dir: "asc" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer bg-base-100 text-base-content/70 border-base-300 hover:bg-base-200"
    >
      {label}
      {isActive && (
        <svg
          className={`w-3 h-3 transition-transform ${sort.dir === "desc" ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      )}
    </button>
  );
}

function RequestCard({ request: r, reviewing, onApprove, onDecline }) {
  return (
    <div className="rounded-2xl border border-base-300 bg-white shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-base-content">{PAGE_LABELS[r.page] ?? r.page}</span>
          <span
            className={
              "text-xs font-medium px-2 py-0.5 rounded-full border capitalize " +
              (REQUEST_STATUS_STYLES[r.status] ?? REQUEST_STATUS_STYLES.pending)
            }
          >
            {r.status}
          </span>
          {r.stale && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full border bg-orange-50 text-orange-600 border-orange-200"
              title="The live page has changed since this request was submitted"
            >
              Stale
            </span>
          )}
        </div>
        <p className="text-xs text-base-content/50 mt-1">
          {r.requestedBy?.name || r.requestedBy?.email || "Unknown"} · Submitted{" "}
          {formatDate(r.createdAt)}
        </p>
        {r.status === "declined" && r.declineReason && (
          <p className="text-xs text-red-500 mt-1">Reason: {r.declineReason}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to={`/requests/${r._id}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors bg-base-100 text-base-content/70 border-base-300 hover:bg-base-200"
        >
          Preview
        </Link>
        {onApprove && onDecline && (
          <>
            <button
              onClick={() => onDecline(r)}
              disabled={reviewing === r._id}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            >
              Decline
            </button>
            <button
              onClick={() => onApprove(r)}
              disabled={reviewing === r._id}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
            >
              Approve
            </button>
          </>
        )}
      </div>
    </div>
  );
}
