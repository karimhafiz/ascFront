import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute({ isAuthenticated }) {
  const token = localStorage.getItem("token");
  const expiration = localStorage.getItem("expiration");

  // Check if the token is valid and not expired
  if (!token || new Date(expiration) <= new Date()) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render the protected content if authenticated
  return <Outlet />;
}
