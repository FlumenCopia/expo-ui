'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PermissionGuard } from '../rbac/PermissionGuard';
import { useAuthStore } from '../../store/useAuthStore';
import { useGlobalModalStore } from '../../store/useGlobalModalStore';
import { exportToPDF, exportToExcelCSV } from '../../lib/exportUtils';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { openTaskModal } = useGlobalModalStore();
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  useEffect(() => {
    const expoEvent = new Date('2026-09-25T09:00:00+05:30');
    const now = new Date();
    const diff = Math.ceil((expoEvent.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getPageDetails = () => {
    switch (pathname) {
      case '/tasks':
        return { title: 'Task Board', crumb: 'Kanban & Workflows' };
      case '/timeline':
        return { title: 'Timeline & Phases', crumb: 'Phase Milestones & Deliverables' };
      case '/deliverables':
        return { title: 'Contract Scope', crumb: 'Package B Ceiling & Tracking' };
      case '/approvals':
        return { title: 'Approvals Queue', crumb: '24-Hour Review Turnaround' };
      case '/team':
        return { title: 'Team Capacity', crumb: 'Member Workload & Skills' };
      case '/kpi':
        return { title: 'KPI Tracker', crumb: 'Agreed Floor vs Stretch Target' };
      case '/budget':
        return { title: 'Ad Spend & Budget', crumb: 'Meta + Google Spend Pacing' };
      case '/notifications':
        return { title: 'Notifications', crumb: 'Activity Alerts & Log' };
      case '/settings':
        return { title: 'Settings & Access', crumb: 'RBAC, Users & Roles' };
      case '/admin/pages':
        return { title: 'Page Management', crumb: 'Dynamic Route Sync' };
      default:
        return { title: 'Command Center', crumb: 'Masters Kerala RE Expo 2026 · Jul 18 – Sep 29' };
    }
  };

  const { title, crumb } = getPageDetails();

  return (
    <div className="topbar">
      <div className="tb-left">
        <button className="hamb" onClick={onToggleSidebar}>
          &#9776;
        </button>
        <div>
          <div className="tb-title">{title}</div>
          <div className="tb-crumb">{crumb}</div>
        </div>
      </div>

      <div className="tb-right">
        <div className="countdown">
          <div>
            <span className="cd-num">{daysLeft > 0 ? daysLeft : '--'}</span>{' '}
            <span className="cd-lbl">days to expo</span>
          </div>
        </div>

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px',
              background: 'var(--panel2)',
              borderRadius: 'var(--rs)',
              border: '1px solid var(--border2)',
            }}
          >
            <div className="tc-av" style={{ background: user.color || '#F5A623' }}>
              {user.short}
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--txt)' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '9.5px', color: 'var(--gold)' }}>
                {user.role}
              </div>
            </div>
          </div>
        )}

        {/* EXPORT DROPDOWN MENU */}
        <div style={{ position: 'relative' }}>
          <button
            className="tb-btn"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            &#8681; Export ▼
          </button>

          {showExportMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: 'var(--panel)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--r)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                padding: '6px',
                zIndex: 200,
                minWidth: '160px',
              }}
            >
              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: 'var(--rs)',
                  color: 'var(--txt)',
                  textAlign: 'left',
                }}
                className="sb-item"
                onClick={() => {
                  setShowExportMenu(false);
                  exportToPDF();
                }}
              >
                📄 Export to PDF
              </button>

              <button
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: 'var(--rs)',
                  color: 'var(--txt)',
                  textAlign: 'left',
                }}
                className="sb-item"
                onClick={() => {
                  setShowExportMenu(false);
                  exportToExcelCSV();
                }}
              >
                📊 Export to Excel (CSV)
              </button>
            </div>
          )}
        </div>

        <button
          className="tb-btn"
          onClick={handleLogout}
          style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,.3)' }}
        >
          🚪 Logout
        </button>

        <PermissionGuard permission="create_task">
          <button className="tb-btn primary" onClick={openTaskModal}>
            + New Task
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
};
