'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthGuard } from '@/components/rbac/AuthGuard';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Validate session with backend profile API on startup
    checkAuth();
  }, [checkAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard>{children}</AuthGuard>
    </QueryClientProvider>
  );
}
