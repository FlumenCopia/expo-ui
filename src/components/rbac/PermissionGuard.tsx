'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { user, hasPermission } = useAuthStore();

  if (!user) return <>{fallback}</>;

  const checkList = permission ? [permission, ...permissions] : permissions;

  if (checkList.length === 0) {
    return <>{children}</>;
  }

  const hasAccess = requireAll
    ? checkList.every((p) => hasPermission(p))
    : checkList.some((p) => hasPermission(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export const PageGuard: React.FC<{ requiredPermission: string; children: React.ReactNode }> = ({
  requiredPermission,
  children,
}) => {
  const { hasPermission } = useAuthStore();

  if (!hasPermission(requiredPermission)) {
    return (
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '60px 20px',
          maxWidth: '520px',
          margin: '40px auto',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
          Access Forbidden
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--txt3)', marginBottom: '24px' }}>
          Your current role does not have the required permission (<code className="mono">{requiredPermission}</code>) to view this page.
        </p>
        <Link href="/dashboard" className="btn btn-p">
          Return to Command Center
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};
