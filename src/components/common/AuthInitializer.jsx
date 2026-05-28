import { useEffect } from "react";
import { getAuthToken, refreshAccessToken } from "../../auth/auth";

export default function AuthInitializer({ children }) {
  useEffect(() => {
    if (!getAuthToken()) {
      refreshAccessToken();
    }
  }, []);

  return children;
}
