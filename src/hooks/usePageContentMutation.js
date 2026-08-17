import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API, fetchJSON } from "../api/apiClient";
import { queryKeys } from "../api/queryKeys";

// Admin: direct PUT. Moderator: POST a change request instead — see
// routes/pageContentRequests.js on the backend.
export function usePageContentSaveMutation(page, canEditDirectly) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => {
      const url = canEditDirectly
        ? `${API}pageContent/${page}`
        : `${API}pageContentRequests/${page}`;
      return fetchJSON(url, { method: canEditDirectly ? "PUT" : "POST", body: formData });
    },
    onSuccess: (data) => {
      if (canEditDirectly) {
        queryClient.setQueryData(queryKeys.pageContent[page], data.pageContent);
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.pageContentRequests.all });
      }
    },
  });
}

// section: "all" or a specific section key (e.g. "hero", "cards")
export function usePageContentResetMutation(page) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (section) => {
      const url =
        section === "all" ? `${API}pageContent/${page}` : `${API}pageContent/${page}/${section}`;
      return fetchJSON(url, { method: "DELETE" });
    },
    onSuccess: (data, section) => {
      queryClient.setQueryData(
        queryKeys.pageContent[page],
        section === "all" ? {} : data.pageContent
      );
    },
  });
}

// Admin-only approve/decline of a moderator's page-content request.
export function usePageContentRequestReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }) =>
      fetchJSON(`${API}pageContentRequests/${id}/${action}`, { method: "PATCH" }),
    onSuccess: (data, { action }) => {
      if (action === "approve" && data.request?.page) {
        queryClient.invalidateQueries({ queryKey: queryKeys.pageContent[data.request.page] });
      }
    },
  });
}
