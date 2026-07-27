'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface NotificationItem {
  id: string;
  _id?: string;
  type: 'approval' | 'done' | 'blocked' | 'assign' | 'budget';
  title: string;
  msg: string;
  read: boolean;
  ts: string | Date;
}

export default function NotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then((res) => res.data.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotifMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    const socket = getSocket();
    socket.on('notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      socket.off('notification');
    };
  }, [queryClient]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n: NotificationItem) => {
      if (filterType === 'unread') return !n.read;
      if (filterType !== 'all') return n.type === filterType;
      return true;
    });
  }, [notifications, filterType]);

  const unreadCount = notifications.filter((n: NotificationItem) => !n.read).length;

  const getIconDetails = (t: string) => {
    switch (t) {
      case 'approval':
        return { icon: '🚩', bg: 'rgba(167,139,250,.18)', color: '#A78BFA', label: 'Approval Required' };
      case 'done':
        return { icon: '✓', bg: 'rgba(16,185,129,.18)', color: '#10B981', label: 'Task Completed' };
      case 'blocked':
        return { icon: '⚠️', bg: 'rgba(239,68,68,.18)', color: '#EF4444', label: 'Action Blocked' };
      case 'assign':
        return { icon: '👤', bg: 'rgba(59,130,246,.18)', color: '#3B82F6', label: 'Task Assigned' };
      case 'budget':
        return { icon: '💰', bg: 'rgba(245,166,35,.18)', color: '#F5A623', label: 'Ad Budget Alert' };
      default:
        return { icon: '🔔', bg: 'rgba(148,163,184,.18)', color: '#94A3B8', label: 'System Alert' };
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    const nId = n.id || (n._id as string);
    if (!n.read) {
      markReadMutation.mutate(nId);
    }
    // Route based on notification type
    if (n.type === 'approval') {
      router.push('/approvals');
    } else if (n.type === 'budget') {
      router.push('/budget');
    } else {
      router.push('/tasks');
    }
  };

  const formatTime = (ts: string | Date) => {
    if (!ts) return 'Just now';
    const date = new Date(ts);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* HEADER & TOP CONTROLS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            className="pill"
            style={{
              background: unreadCount > 0 ? 'rgba(245,166,35,0.15)' : 'var(--panel2)',
              color: unreadCount > 0 ? 'var(--gold)' : 'var(--txt2)',
              borderColor: unreadCount > 0 ? 'var(--gold)' : 'var(--border2)',
              fontWeight: 700,
            }}
          >
            ● {unreadCount} Unread Notifications
          </span>
        </div>

        {unreadCount > 0 && (
          <button
            className="btn btn-s btn-sm"
            onClick={() => markAllReadMutation.mutate()}
          >
            ✓ Mark All as Read
          </button>
        )}
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="filters" style={{ marginBottom: '16px' }}>
        <button
          className={`fbtn ${filterType === 'all' ? 'on' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`fbtn ${filterType === 'unread' ? 'on' : ''}`}
          onClick={() => setFilterType('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`fbtn ${filterType === 'approval' ? 'on' : ''}`}
          onClick={() => setFilterType('approval')}
        >
          🚩 Approvals
        </button>
        <button
          className={`fbtn ${filterType === 'done' ? 'on' : ''}`}
          onClick={() => setFilterType('done')}
        >
          ✓ Completed
        </button>
        <button
          className={`fbtn ${filterType === 'budget' ? 'on' : ''}`}
          onClick={() => setFilterType('budget')}
        >
          💰 Budget Alerts
        </button>
        <button
          className={`fbtn ${filterType === 'blocked' ? 'on' : ''}`}
          onClick={() => setFilterType('blocked')}
        >
          ⚠️ Blockers
        </button>
      </div>

      {/* NOTIFICATIONS CARD LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n: NotificationItem) => {
            const nId = n.id || (n._id as string);
            const { icon, bg, color, label } = getIconDetails(n.type);

            return (
              <div
                key={nId}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px 16px',
                  background: n.read ? 'var(--panel)' : 'var(--panel2)',
                  border: `1px solid ${n.read ? 'var(--border)' : 'var(--border2)'}`,
                  borderLeft: `4px solid ${n.read ? 'transparent' : 'var(--gold)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleNotificationClick(n)}
              >
                {/* ICON BADGE */}
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: bg,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                {/* CONTENT */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: n.read ? 600 : 700, color: 'var(--txt)' }}>
                      {n.title}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--txt3)', whiteSpace: 'nowrap' }}>
                      {formatTime(n.ts)}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--txt2)', lineHeight: '1.4', marginBottom: '6px' }}>
                    {n.msg}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: color,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {label}
                    </span>

                    {!n.read && (
                      <span
                        style={{
                          fontSize: '8.5px',
                          fontWeight: 700,
                          background: 'rgba(245,166,35,0.2)',
                          color: 'var(--gold)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        UNREAD
                      </span>
                    )}
                  </div>
                </div>

                {/* DELETE ACTION */}
                <button
                  type="button"
                  style={{
                    color: 'var(--txt3)',
                    fontSize: '14px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    alignSelf: 'center',
                  }}
                  title="Remove Notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotifMutation.mutate(nId);
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px', opacity: 0.4 }}>🔔</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--txt2)' }}>
              No Notifications Found
            </div>
            <div style={{ fontSize: '12px', color: 'var(--txt3)', marginTop: '4px' }}>
              You are all caught up! Activity alerts will appear here in real time.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
