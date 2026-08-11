import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth, isAdmin } from "../../auth/auth";
import { API } from "../../api/apiClient";
import { queryKeys } from "../../api/queryKeys";
import { REQUEST_STATUS_STYLES } from "../../util/pageContentRequestStatus";
import Home from "../content/Home";
import About from "../content/About";

const PAGE_COMPONENTS = { home: Home, about: About };
const PAGE_LABELS = { home: "Home", about: "About" };

export default function RequestPreview() {
  const { id } = useParams();
  const backTo = isAdmin() ? "/admin?tab=Requests" : "/profile";

  const {
    data: requests,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.pageContentRequests.all,
    queryFn: async () => {
      const res = await fetchWithAuth(`${API}pageContentRequests`);
      if (!res.ok) throw new Error("Failed to load requests");
      return res.json();
    },
  });

  if (isLoading) {
    return <p className="text-center text-base-content/50 py-20">Loading preview…</p>;
  }
  if (error) {
    return <p className="text-center text-red-500 py-20">{error.message}</p>;
  }

  const request = requests?.find((r) => r._id === id);
  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-base-content/50 mb-4">Request not found.</p>
        <Link to={backTo} className="text-primary font-medium hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const PageComponent = PAGE_COMPONENTS[request.page];

  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-base-300 bg-white/95 backdrop-blur-xl px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-base-content">
              Previewing pending request — {PAGE_LABELS[request.page] ?? request.page} page
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${
                REQUEST_STATUS_STYLES[request.status] ?? REQUEST_STATUS_STYLES.pending
              }`}
            >
              {request.status}
            </span>
            <span className="text-xs text-base-content/50">
              Submitted by {request.requestedBy?.name || request.requestedBy?.email || "Unknown"}
            </span>
          </div>
          <Link to={backTo} className="text-sm font-medium text-primary hover:underline shrink-0">
            Back to dashboard
          </Link>
        </div>
      </div>

      {PageComponent ? (
        <PageComponent previewContent={request.proposedContent} />
      ) : (
        <p className="text-center text-red-500 py-20">Unknown page type: {request.page}</p>
      )}
    </div>
  );
}
