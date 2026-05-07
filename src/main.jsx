import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from "@vercel/speed-insights/react";
import App from "./App";
import AuthInitializer from "./components/common/AuthInitializer";
import "./index.css";
import "./custom-styles.css";

const queryClient = new QueryClient({
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
    </QueryClientProvider>
  </React.StrictMode>
);
