import { useMutation } from "@tanstack/react-query";
import { API, fetchJSON } from "../api/apiClient";

// Shared by SubscribedPanel.jsx (event page) and EventSubscriptionRow.jsx
// (profile page) — both act on the same subscription resource.

export function useEventSubscriptionCancelMutation(subscriptionId) {
  return useMutation({
    mutationFn: () =>
      fetchJSON(`${API}events/subscriptions/${subscriptionId}/cancel`, { method: "POST" }),
  });
}

export function useEventSubscriptionReactivateMutation(subscriptionId) {
  return useMutation({
    mutationFn: () =>
      fetchJSON(`${API}events/subscriptions/${subscriptionId}/reactivate`, { method: "POST" }),
  });
}
