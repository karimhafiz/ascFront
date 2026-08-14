import { useMutation } from "@tanstack/react-query";
import { API, fetchJSON } from "../api/apiClient";
import { fetchOrThrow } from "../util/errorUtil";

// loggedIn determines the endpoint: guest checkout has no token to attach,
// so it deliberately can't go through fetchJSON/fetchWithAuth.
export function useCheckoutMutation(loggedIn) {
  return useMutation({
    mutationFn: async (payload) => {
      if (loggedIn) {
        return fetchJSON(`${API}payments/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const response = await fetchOrThrow(`${API}payments/guest-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create checkout session");
      return data;
    },
  });
}
