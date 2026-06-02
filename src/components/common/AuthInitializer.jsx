import { useEffect, useState } from "react";
import { getAuthToken, refreshAccessToken } from "../../auth/auth";

export default function AuthInitializer({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getAuthToken()) {
      setReady(true);
    } else {
      refreshAccessToken().finally(() => setReady(true));
    }
  }, []);

  if (!ready) return null;

  return children;
}
