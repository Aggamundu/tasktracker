"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

export function MuiAppRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", enableCssLayer: true }}>
      {children}
    </AppRouterCacheProvider>
  );
}
