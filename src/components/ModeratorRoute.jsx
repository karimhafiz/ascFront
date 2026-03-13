import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../auth/auth";

export default function ModeratorRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (role !== "admin" && role !== "moderator") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
