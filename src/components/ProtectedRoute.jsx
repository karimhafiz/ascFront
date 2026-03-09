import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const expiration = localStorage.getItem("expiration");

  if (!token || new Date(expiration) <= new Date()) {
    return <Navigate to="/login" replace />;
  }

  let role = null;
  try {
    role = JSON.parse(atob(token.split(".")[1])).role;
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin") return <Navigate to="/" replace />;
  

  return <Outlet />;
}