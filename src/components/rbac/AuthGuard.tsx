'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = pathname === '/login';

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    } else if (isAuthenticated && (pathname === '/' || pathname === '/login')) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Allow login page to render unconditionally
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show brief loader only while initial check is in-flight
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--txt)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="rt" style={{ width: '12px', height: '12px', marginBottom: '10px' }} />
          <div style={{ fontSize: '14px', fontWeight: 600 }}>Authenticating Session...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, render nothing while router redirects to /login
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
