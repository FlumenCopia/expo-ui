'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { TaskItem, MemberItem } from '@/components/dashboard/CommandCenterDashboard';

const TASK_TYPES: Record<string, { name: string; cls: string }> = {
  design: { name: 'Design', cls: 'c-design' },
  video: { name: 'Video', cls: 'c-video' },
  ads: { name: 'Ads', cls: 'c-ads' },
  it: { name: 'IT / Web', cls: 'c-it' },
  content: { name: 'Content', cls: 'c-content' },
  ops: { name: 'Ops', cls: 'c-ops' },
  client: { name: 'Client', cls: 'c-client' },
};

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const { user, hasPermission } = useAuthStore();
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data.data),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/users').then((res) => res.data.data),
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const sortFn = (a: TaskItem, b: TaskItem) => {
    const da = new Date(a.due || '').getTime();
    const db = new Date(b.due || '').getTime();
    return sortOrder === 'asc' ? da - db : db - da;
  };

  const pendingTasks = tasks.filter((t: TaskItem) => t.status === 'review');
  const mine = pendingTasks.filter((t: TaskItem) => t.reviewer === user?.id).sort(sortFn);
  const others = pendingTasks.filter((t: TaskItem) => t.reviewer !== user?.id).sort(sortFn);

  const daysLeft = (dueStr: string) => {
    const due = new Date(dueStr);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / 86400000);
  };

  const renderSection = (list: TaskItem[], title: string, sub: string) => (
    <div className="card mb">
      <div className="card-h">
        <div>
          <div className="card-t">{title}</div>
          <div className="card-s">{sub}</div>
        </div>
        <span className="pill">{list.length} pending</span>
      </div>

      {list.length > 0 ? (
        list.map((t) => {
          const m = members.find((x: MemberItem) => x.id === t.assignee);
          const r = members.find((x: MemberItem) => x.id === t.reviewer);
          const tt = TASK_TYPES[t.type] || { name: t.type, cls: 'c-client' };
          const d = daysLeft(t.due);

          return (
            <div
              key={t.id || (t as any)._id}
              style={{
                background: 'var(--panel2)',
                border: '1px solid var(--border2)',
                borderRadius: '8px',
                padding: '13px',
                marginBottom: '9px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                <div
                  className="tc-av"
                  style={{
                    width: '32px',
                    height: '32px',
                    fontSize: '11px',
                    background: m ? m.color : '#555',
                  }}
                >
                  {m ? m.short : '?'}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span className={`chip ${tt.cls}`}>{tt.name}</span>
                    <span className="tc-code">{t.code}</span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        color: d < 0 ? 'var(--red)' : 'var(--txt3)',
                      }}
                    >
                      {d < 0 ? `${Math.abs(d)}d overdue` : `due ${t.due}`}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px' }}>
                    {t.title}
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--txt3)',
                      lineHeight: 1.5,
                    }}
                  >
                    {t.desc || ''}
                  </div>

                  <div
                    style={{ fontSize: '10.5px', color: 'var(--txt3)', marginTop: '6px' }}
                  >
                    Submitted by <b style={{ color: 'var(--txt2)' }}>{m ? m.name : '—'}</b> &middot; Reviewer: <b style={{ color: 'var(--txt2)' }}>{r ? r.name : '—'}</b>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {hasPermission('approve') ? (
                    <>
                      <button
                        className="btn btn-g btn-sm"
                        onClick={() =>
                          moveTaskMutation.mutate({
                            id: t.id || (t as any)._id,
                            status: 'approved',
                          })
                        }
                      >
                        ✓ Approve
                      </button>

                      <button
                        className="btn btn-d btn-sm"
                        onClick={() =>
                          moveTaskMutation.mutate({
                            id: t.id || (t as any)._id,
                            status: 'progress',
                          })
                        }
                      >
                        ← Revise
                      </button>
                    </>
                  ) : (
                    <span className="pill">No permission</span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty">
          <div className="empty-ic">✓</div>
          <div className="empty-t">Nothing pending</div>
          <div className="empty-m">All caught up here</div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="alert warn">
        <span>⏰</span>
        <div>
          <b>24-hour approval SLA.</b> Every hour a task sits here delays the publish schedule downstream. Approve, or send back with a clear revision note — but do not let it sit.
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt2)' }}>
          Sort Pending Approvals by Due Date:
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`fbtn ${sortOrder === 'asc' ? 'on' : ''}`}
            onClick={() => setSortOrder('asc')}
          >
            Due Date ↑ (Earliest First)
          </button>
          <button
            className={`fbtn ${sortOrder === 'desc' ? 'on' : ''}`}
            onClick={() => setSortOrder('desc')}
          >
            Due Date ↓ (Latest First)
          </button>
        </div>
      </div>

      {renderSection(mine, 'Awaiting Your Approval', 'Tasks where you are the assigned reviewer')}
      {renderSection(others, 'Other Pending Approvals', 'Assigned to other reviewers — visible for oversight')}
    </div>
  );
}
