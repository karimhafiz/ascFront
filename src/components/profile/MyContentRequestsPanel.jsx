import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "../../auth/auth";
import { API } from "../../api/apiClient";
import { queryKeys } from "../../api/queryKeys";
import { REQUEST_STATUS_STYLES } from "../../util/pageContentRequestStatus";

export default function MyContentRequestsPanel() {
  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.pageContentRequests.all,
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}pageContentRequests`);
      if (!res.ok) throw new Error("Failed to load your requests");
      return res.json();
    },
  });

  if (isLoading) {
    return <p className="text-center text-base-content/50 py-20">Loading your requests…</p>;
  }
  if (error) {
    return <p className="text-center text-red-500 py-20">{error.message}</p>;
  }
  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-base-content/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-base-content/50">No change requests submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div
          key={r._id}
          className="bg-white rounded-2xl border border-base-300 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-base-content capitalize">{r.page} page</span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${
                  REQUEST_STATUS_STYLES[r.status] ?? REQUEST_STATUS_STYLES.pending
                }`}
              >
                {r.status}
              </span>
            </div>
            <p className="text-xs text-base-content/50 mt-1">
              Submitted{" "}
              {new Date(r.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            {r.status === "declined" && r.declineReason && (
              <p className="text-xs text-red-500 mt-1">Reason: {r.declineReason}</p>
            )}
          </div>
          <Link
            to={`/requests/${r._id}/preview`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors bg-base-100 text-base-content/70 border-base-300 hover:bg-base-200 shrink-0"
          >
            Preview
          </Link>
        </div>
      ))}
    </div>
  );
}
