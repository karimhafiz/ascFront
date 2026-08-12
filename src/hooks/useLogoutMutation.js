import { useMutation } from "@tanstack/react-query";
import { API } from "../api/apiClient";

// Deliberately a plain fetch, not fetchJSON/fetchWithAuth — logout must
// still work with an expired/absent access token, and fetchWithAuth throws
// in that case.
export function useLogoutMutation() {
  return useMutation({
    mutationFn: async () => {
      try {
        await fetch(`${API}users/logout`, { method: "POST", credentials: "include" });
      } catch {
        // Clear local auth state even if the network request fails.
      }
    },
  });
}
