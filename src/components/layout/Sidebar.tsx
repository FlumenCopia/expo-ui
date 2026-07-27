'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface MenuItem {
  title: string;
  route: string;
  icon?: string;
  section: string;
  requiredPermission?: string;
  badge?: string | number;
  badgeCls?: string;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  { title: 'Command Center', route: '/dashboard', icon: '☀️', section: 'CAMPAIGN', requiredPermission: 'page.dashboard.view' },
  { title: 'Task Board', route: '/tasks', icon: '📋', section: 'EXECUTION', requiredPermission: 'page.tasks.view' },
  { title: 'Timeline & Phases', route: '/timeline', icon: '⏱️', section: 'EXECUTION', requiredPermission: 'page.timeline.view' },
  { title: 'Contract Scope', route: '/deliverables', icon: '📦', section: 'EXECUTION', requiredPermission: 'page.deliverables.view' },
  { title: 'Approvals Queue', route: '/approvals', icon: '✅', section: 'EXECUTION', requiredPermission: 'page.approvals.view', badge: 1, badgeCls: 'a' },
  { title: 'Team Capacity', route: '/team', icon: '👥', section: 'MANAGEMENT', requiredPermission: 'page.team.view' },
  { title: 'KPI Tracker', route: '/kpi', icon: '🎯', section: 'MANAGEMENT', requiredPermission: 'page.kpi.view' },
  { title: 'Ad Spend & Budget', route: '/budget', icon: '💰', section: 'MANAGEMENT', requiredPermission: 'page.budget.view' },
  { title: 'Notifications', route: '/notifications', icon: '🔔', section: 'SYSTEM', requiredPermission: 'page.notifications.view' },
  { title: 'Settings & Access', route: '/settings', icon: '⚙️', section: 'SYSTEM', requiredPermission: 'page.settings.view' },
  { title: 'Page Management', route: '/admin/pages', icon: '📄', section: 'SYSTEM', requiredPermission: 'page.admin.view' },
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accounts, switchAccount, logoutAccount, logoutAll, hasPermission } = useAuthStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU_ITEMS);
  const [showAccountsMenu, setShowAccountsMenu] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((res) => res.data.data),
    refetchInterval: 10000,
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  useEffect(() => {
    // Fetch dynamic database-driven navigation items
    api.get('/menus')
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setMenuItems(res.data.data);
        } else {
          setMenuItems(DEFAULT_MENU_ITEMS);
        }
      })
      .catch(() => {
        setMenuItems(DEFAULT_MENU_ITEMS);
      });
  }, []);

  const authorizedItems = menuItems.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  const sections = Array.from(new Set(authorizedItems.map((m) => m.section || 'MAIN')));
  const currentUserId = user ? user.id || (user as any)._id : '';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">&#9728;</div>
        <div>
          <div className="sb-title">Masters Expo 2026</div>
          <div className="sb-sub">Command Center</div>
        </div>
      </div>

      <nav className="sb-nav">
        {sections.map((sect) => (
          <React.Fragment key={sect}>
            <div className="sb-sect">{sect}</div>
            {authorizedItems
              .filter((item) => (item.section || 'MAIN') === sect)
              .map((item) => {
                const isActive = pathname === item.route || (item.route === '/dashboard' && pathname === '/');
                const badgeVal = item.route === '/notifications' && unreadCount > 0 ? unreadCount : item.badge;
                const badgeClass = item.route === '/notifications' ? 'a' : item.badgeCls;

                return (
                  <Link
                    key={item.route}
                    href={item.route}
                    className={`sb-item ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="ic">{item.icon || '⚫'}</span>
                    <span>{item.title}</span>
                    {badgeVal !== undefined && (
                      <span className={`sb-badge ${badgeClass || ''}`}>{badgeVal}</span>
                    )}
                  </Link>
                );
              })}
          </React.Fragment>
        ))}
      </nav>

      {/* MULTI-ACCOUNT FOOTER SECTION */}
      <div className="sb-foot" style={{ position: 'relative' }}>
        <div className="role-lbl" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Active Session</span>
          <button
            type="button"
            style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 600 }}
            onClick={() => setShowAccountsMenu(!showAccountsMenu)}
          >
            {showAccountsMenu ? 'Close' : 'Switch / Add'}
          </button>
        </div>

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              background: 'var(--panel2)',
              borderRadius: 'var(--rs)',
              border: '1px solid var(--border2)',
              cursor: 'pointer',
            }}
            onClick={() => setShowAccountsMenu(!showAccountsMenu)}
          >
            <div className="tc-av" style={{ background: user.color || '#F5A623' }}>
              {user.short}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--txt3)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.role}
              </div>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--txt3)' }}>▼</span>
          </div>
        )}

        {/* SAVED ACCOUNTS POPOVER MENU */}
        {showAccountsMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '12px',
              right: '12px',
              marginBottom: '8px',
              background: 'var(--panel)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--r)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              padding: '10px',
              zIndex: 200,
            }}
          >
            <div style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--txt3)', marginBottom: '8px', fontWeight: 700 }}>
              Saved Accounts ({accounts.length})
            </div>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {accounts.map((acc) => {
                const accId = acc.user.id || (acc.user as any)._id;
                const isActive = accId === currentUserId;

                return (
                  <div
                    key={accId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      background: isActive ? 'rgba(245,166,35,0.12)' : 'var(--panel2)',
                      border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border2)'}`,
                      borderRadius: 'var(--rs)',
                      cursor: 'pointer',
                    }}
                    onClick={async () => {
                      if (!isActive) {
                        await switchAccount(accId);
                        router.push('/dashboard');
                      }
                      setShowAccountsMenu(false);
                    }}
                  >
                    <div className="tc-av" style={{ background: acc.user.color || '#3B82F6', width: '20px', height: '20px', fontSize: '9px' }}>
                      {acc.user.short}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: isActive ? 'var(--gold)' : 'var(--txt)' }}>
                        {acc.user.name}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--txt3)' }}>{acc.user.email}</div>
                    </div>
                    {!isActive && (
                      <button
                        type="button"
                        style={{ fontSize: '10px', color: 'var(--red)', padding: '2px 4px' }}
                        title="Remove Account"
                        onClick={(e) => {
                          e.stopPropagation();
                          logoutAccount(accId);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="divider" style={{ margin: '8px 0' }} />

            <button
              type="button"
              className="btn btn-s btn-sm"
              style={{ width: '100%', marginBottom: '4px', textAlign: 'center' }}
              onClick={() => {
                setShowAccountsMenu(false);
                router.push('/login?mode=add');
              }}
            >
              + Sign In to Another Account
            </button>

            <button
              type="button"
              className="btn btn-d btn-sm"
              style={{ width: '100%', textAlign: 'center' }}
              onClick={() => {
                setShowAccountsMenu(false);
                logoutAll();
                router.push('/login');
              }}
            >
              Log Out All Accounts
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
