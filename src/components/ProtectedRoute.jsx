import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ isAuthenticated }) {
  const token = localStorage.getItem("token");
  const expiration = localStorage.getItem("expiration");

  // Check if the token is valid and not expired
  if (!token || new Date(expiration) <= new Date()) {
    return <Navigate to="/login" replace />;
  }

  // also verify the role from token payload
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") {
      // non-admins should not access admin routes
      return <Navigate to="/" replace />;
    }
  } catch {}

  // Render the protected content if authenticated and authorized
  return <Outlet />;
}
