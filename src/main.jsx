import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryCache, MutationCache, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import AuthInitializer from "./components/common/AuthInitializer";
import BackendStatusOverlay from "./components/common/BackendStatusOverlay";
import { ApiError, setBackendDown, setDatabaseDown } from "./util/errorUtil";
import "./index.css";
import "./custom-styles.css";

function handleCacheError(error) {
  if (!(error instanceof ApiError)) return;
  if (error.status === 503) {
    setDatabaseDown(true);
  } else if (error.status === 502) {
    // Stripe-down is shown inline at the call site, never as a global block.
  } else {
    setBackendDown(true);
  }
}

function handleCacheSuccess() {
  setBackendDown(false);
  setDatabaseDown(false);
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleCacheError, onSuccess: handleCacheSuccess }),
  mutationCache: new MutationCache({ onError: handleCacheError, onSuccess: handleCacheSuccess }),
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <App />
        <SpeedInsights />
      </AuthInitializer>
      <BackendStatusOverlay />
    </QueryClientProvider>
  </React.StrictMode>
);
