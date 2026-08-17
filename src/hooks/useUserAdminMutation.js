import { useMutation } from "@tanstack/react-query";
import { API, fetchJSON } from "../api/apiClient";

export function useUserRoleMutation() {
  return useMutation({
    mutationFn: ({ userId, newRole }) =>
      fetchJSON(`${API}admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      }),
  });
}

export function useUserBanMutation() {
  return useMutation({
    mutationFn: ({ userId }) => fetchJSON(`${API}admin/users/${userId}/ban`, { method: "PATCH" }),
  });
}
