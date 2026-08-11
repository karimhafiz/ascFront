import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../../auth/auth";
import ConfirmModal from "../common/ConfirmModal";
import { formatDate } from "./adminHelpers";
import { REQUEST_STATUS_STYLES } from "../../util/pageContentRequestStatus";
import { API } from "../../api/apiClient";
import { queryKeys } from "../../api/queryKeys";

const PAGE_LABELS = { home: "Home", about: "About" };

export default function RequestsTab() {
  const [reviewing, setReviewing] = useState(null);
  const [modal, setModal] = useState(null);
  const queryClient = useQueryClient();

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

  const setRequestStatus = (id, patch) => {
    queryClient.setQueryData(queryKeys.pageContentRequests.all, (prev) =>
      prev ? prev.map((r) => (r._id === id ? { ...r, ...patch } : r)) : prev
    );
  };

  const executeReview = async (id, action) => {
    setReviewing(id);
    try {
      const res = await fetchWithAuth(`${API}pageContentRequests/${id}/${action}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setRequestStatus(id, {
          status: data.request.status,
          reviewedBy: data.request.reviewedBy,
          reviewedAt: data.request.reviewedAt,
        });
      } else {
        alert(data.error || data.message);
      }
    } catch {
      alert(`Failed to ${action} request`);
    } finally {
      setReviewing(null);
    }
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
        executeReview(request._id, action);
      },
    });
  };

  if (loading) return <p className="text-center text-base-content/50 py-10">Loading requests…</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;

  const pending = (requests || []).filter((r) => r.status === "pending");
  const reviewed = (requests || []).filter((r) => r.status !== "pending");

  return (
    <div>
      <ConfirmModal
        isOpen={!!modal}
        title={modal?.title}
        message={modal?.message}
        confirmLabel={modal?.confirmLabel}
        onConfirm={modal?.onConfirm}
        onCancel={() => setModal(null)}
      />

      {(requests || []).length === 0 ? (
        <p className="text-center text-base-content/50 py-10">No change requests yet</p>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <RequestGroup
              title="Pending"
              requests={pending}
              reviewing={reviewing}
              onApprove={(r) => promptReview(r, "approve")}
              onDecline={(r) => promptReview(r, "decline")}
            />
          )}
          {reviewed.length > 0 && <RequestGroup title="Reviewed" requests={reviewed} />}
        </div>
      )}
    </div>
  );
}

function RequestGroup({ title, requests, reviewing, onApprove, onDecline }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-3">
        {requests.map((r) => (
          <div
            key={r._id}
            className="rounded-2xl border border-base-300 bg-white shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-base-content">
                  {PAGE_LABELS[r.page] ?? r.page}
                </span>
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
        ))}
      </div>
    </div>
  );
}
