'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TaskItem, MemberItem } from '@/components/dashboard/CommandCenterDashboard';

const TASK_TYPES = [
  { id: 'design', name: 'Design' },
  { id: 'video', name: 'Video' },
  { id: 'ads', name: 'Ads' },
  { id: 'it', name: 'IT / Web' },
  { id: 'content', name: 'Content' },
  { id: 'ops', name: 'Ops' },
  { id: 'client', name: 'Client' },
];

export default function TeamPage() {
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/users').then((res) => res.data.data),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles').then((res) => res.data.data),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data.data),
  });

  // Dynamic roles map
  const rolesMap: Record<string, string> = roles.reduce((acc: any, r: any) => {
    acc[r.code] = r.name;
    return acc;
  }, {});

  const memberLoad = (memberId: string) => {
    return tasks
      .filter((t: TaskItem) => t.assignee === memberId && !['published', 'approved'].includes(t.status))
      .reduce((a: number, b: TaskItem) => a + (b.hours || 4), 0);
  };

  const daysLeft = (dueStr: string) => {
    const due = new Date(dueStr);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / 86400000);
  };

  return (
    <div>
      <div className="alert info">
        <span>⚖️</span>
        <div>
          <b>Capacity shown is expo-only.</b> These hours sit on top of existing client retainer work. Anything above 75% here means that person has no slack for revisions or urgent client requests — rebalance before it becomes a missed deadline.
        </div>
      </div>

      <div className="grid g4 mb">
        {members.map((m: MemberItem & { skills?: string[] }) => {
          const mId = m.id || (m as any)._id;
          const own = tasks.filter((t: TaskItem) => t.assignee === mId || t.assignee === m.short || t.assignee === m.name);
          const done = own.filter((t: TaskItem) => ['published', 'approved'].includes(t.status)).length;
          const act = own.filter((t: TaskItem) => ['progress', 'review', 'assigned'].includes(t.status)).length;
          const late = own.filter((t: TaskItem) => daysLeft(t.due) < 0 && !['published', 'approved'].includes(t.status)).length;
          const load = memberLoad(mId);
          const p = Math.min(100, (load / m.cap) * 100);
          const cls = p > 95 ? 'r' : p > 75 ? 'a' : 'g';

          return (
            <div key={mId} className="tm">
              <div className="tm-top">
                <div className="tm-av" style={{ background: m.color || '#3B82F6' }}>
                  {m.short}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="tm-n">{m.name}</div>
                  <div className="tm-r">{m.fn}</div>
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span
                  className="chip"
                  style={{
                    background: 'rgba(148,163,184,.13)',
                    color: 'var(--txt2)',
                  }}
                >
                  {rolesMap[m.role] || m.role}
                </span>
              </div>

              <div className="tm-stats">
                <div className="tm-s">
                  <div className="tm-sv">{own.length}</div>
                  <div className="tm-sl">Total</div>
                </div>
                <div className="tm-s">
                  <div className="tm-sv" style={{ color: 'var(--green)' }}>
                    {done}
                  </div>
                  <div className="tm-sl">Done</div>
                </div>
                <div className="tm-s">
                  <div
                    className="tm-sv"
                    style={{ color: late ? 'var(--red)' : 'var(--amber)' }}
                  >
                    {late || act}
                  </div>
                  <div className="tm-sl">{late ? 'Late' : 'Active'}</div>
                </div>
              </div>

              <div className="tm-cap">
                <span>Expo load</span>
                <span
                  className="mono"
                  style={{
                    color:
                      p > 95
                        ? 'var(--red)'
                        : p > 75
                        ? 'var(--amber)'
                        : 'var(--txt3)',
                  }}
                >
                  {load}h / {m.cap}h
                </span>
              </div>

              <div className="pbar">
                <div className={`pfill ${cls}`} style={{ width: `${p}%` }} />
              </div>

              {p > 90 ? (
                <div style={{ fontSize: '10px', color: 'var(--red)', marginTop: '6px' }}>
                  ⚠️ At capacity — do not assign more
                </div>
              ) : p > 75 ? (
                <div style={{ fontSize: '10px', color: 'var(--amber)', marginTop: '6px' }}>
                  Near capacity — assign with care
                </div>
              ) : null}

              <div style={{ marginTop: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {(m.skills || []).map((s: string) => (
                  <span
                    key={s}
                    className="chip"
                    style={{ background: 'var(--panel3)', color: 'var(--txt3)' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Assignment Matrix</div>
            <div className="card-s">Task distribution by member and type</div>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th>
              {TASK_TYPES.map((t) => (
                <th key={t.id} style={{ textAlign: 'center', width: '62px' }}>
                  {t.name}
                </th>
              ))}
              <th style={{ textAlign: 'center', width: '60px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: MemberItem) => {
              const mId = m.id || (m as any)._id;
              const own = tasks.filter((t: TaskItem) => t.assignee === mId || t.assignee === m.short || t.assignee === m.name);
              if (!own.length) return null;
              return (
                <tr key={mId}>
                  <td className="strong">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="tc-av" style={{ background: m.color || '#3B82F6' }}>
                        {m.short}
                      </div>
                      {m.name}
                    </div>
                  </td>
                  {TASK_TYPES.map((tt) => {
                    const c = own.filter((t: TaskItem) => t.type === tt.id).length;
                    return (
                      <td
                        key={tt.id}
                        style={{
                          textAlign: 'center',
                          color: c ? 'var(--txt)' : 'var(--txt3)',
                          fontWeight: c ? 600 : 400,
                        }}
                      >
                        {c || '·'}
                      </td>
                    );
                  })}
                  <td style={{ textAlign: 'center' }} className="strong mono">
                    {own.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
