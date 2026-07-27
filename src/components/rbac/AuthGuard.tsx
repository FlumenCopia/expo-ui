'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/': 'page.dashboard.view',
  '/dashboard': 'page.dashboard.view',
  '/tasks': 'page.tasks.view',
  '/timeline': 'page.timeline.view',
  '/deliverables': 'page.deliverables.view',
  '/approvals': 'page.approvals.view',
  '/team': 'page.team.view',
  '/kpi': 'page.kpi.view',
  '/budget': 'page.budget.view',
  '/notifications': 'page.notifications.view',
  '/settings': 'page.settings.view',
  '/admin/pages': 'page.admin.view',
};

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, hasPermission } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = pathname === '/login';

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    } else if (isAuthenticated && (pathname === '/' || pathname === '/login')) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Allow login page unconditionally
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Initial authentication loader
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

  // Unauthenticated user
  if (!isAuthenticated) {
    return null;
  }

  // Check Page Route Permission
  const requiredPerm = ROUTE_PERMISSION_MAP[pathname];
  const isAuthorized = !requiredPerm || hasPermission(requiredPerm) || hasPermission('view_all');

  if (!isAuthorized) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '480px', margin: 'auto' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--red)', marginBottom: '8px' }}>
          403 — Route Access Restricted
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--txt2)', marginBottom: '20px', lineHeight: 1.6 }}>
          Your role does not have the required page permission (<span className="mono" style={{ color: 'var(--gold)' }}>{requiredPerm}</span>) to view this route.
        </p>
        <button className="btn btn-p" onClick={() => router.push('/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
