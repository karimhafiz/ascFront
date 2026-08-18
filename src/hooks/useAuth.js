import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { API } from "../api/apiClient";
import { setAuth, clearAuth, fetchOrThrow } from "../auth/auth";

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await fetchOrThrow(`${API}users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.message || "An error occurred. Please try again later.");
        err.authMethod = data.authMethod || null;
        throw err;
      }
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
      const role = data.user?.role;
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "moderator") {
        navigate("/profile");
      } else {
        navigate("/");
      }
    },
  });
}

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      const res = await fetchOrThrow(`${API}users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        const err = new Error(data.message || "An error occurred. Please try again later.");
        err.authMethod = data.authMethod || null;
        throw err;
      }
      return res.json().catch(() => ({}));
    },
    onSuccess: () => {
      navigate("/login");
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await fetch(`${API}users/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
      clearAuth();
    },
    onSuccess: () => {
      navigate("/");
    },
  });
}

export async function googleLogin(tokenId) {
  const res = await fetchOrThrow(`${API}users/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tokenId }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Google login failed: ${msg}`);
  }

  const data = await res.json();
  setAuth(data.accessToken, data.user);
  return { role: data.user?.role, user: data.user };
}
