import { useMutation } from "@tanstack/react-query";
import { API, fetchPublicJSON } from "../api/apiClient";

export function useRequestEmailVerificationMutation() {
  return useMutation({
    mutationFn: (email) =>
      fetchPublicJSON(`${API}users/verify-email/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
  });
}

export function useConfirmEmailVerificationMutation() {
  return useMutation({
    mutationFn: (token) =>
      fetchPublicJSON(`${API}users/verify-email/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }),
  });
}
