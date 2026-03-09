import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ModeratorRoute() {
  const token = localStorage.getItem("token");
  const expiration = localStorage.getItem("expiration");

  console.log("token:", token);
  console.log("expiration:", expiration);
  console.log("expiration check:", new Date(expiration) <= new Date());

  if (!token || new Date(expiration) <= new Date()) {
    console.log("REDIRECT: no token or expired");
    return <Navigate to="/login" replace />;
  }

  let role = null;
  try {
    role = JSON.parse(atob(token.split(".")[1])).role;
    console.log("role:", role);
  } catch (e) {
    console.log("REDIRECT: token parse failed", e);
    return <Navigate to="/login" replace />;
  }

  if (role !== "admin" && role !== "moderator") {
    console.log("REDIRECT: wrong role");
    return <Navigate to="/" replace />;
  }

  console.log("PASS: rendering outlet");
  return <Outlet />;
}