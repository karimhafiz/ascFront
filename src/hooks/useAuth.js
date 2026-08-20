import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { API } from "../api/apiClient";
import { setAuth, clearAuth, fetchOrThrow } from "../auth/auth";

async function loginRequest({ email, password }) {
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
}

function handleAuthSuccess(navigate, data) {
  setAuth(data.accessToken, data.user);
  const role = data.user?.role;
  if (role === "admin") {
    navigate("/admin");
  } else if (role === "moderator") {
    navigate("/profile");
  } else {
    navigate("/");
  }
}

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => handleAuthSuccess(navigate, data),
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
      await res.json().catch(() => ({}));
      // Log straight in with the same credentials rather than making the
      // user retype them on the login page.
      return loginRequest({ email, password });
    },
    onSuccess: (data) => handleAuthSuccess(navigate, data),
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
