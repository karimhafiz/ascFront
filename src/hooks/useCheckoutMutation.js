import { useMutation } from "@tanstack/react-query";
import { API, fetchJSON, fetchPublicJSON } from "../api/apiClient";

// loggedIn determines the endpoint: guest checkout has no token to attach,
// so it deliberately can't go through fetchJSON/fetchWithAuth.
export function useCheckoutMutation(loggedIn) {
  return useMutation({
    mutationFn: (payload) => {
      if (loggedIn) {
        return fetchJSON(`${API}payments/create-checkout-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      return fetchPublicJSON(`${API}payments/guest-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
  });
}
