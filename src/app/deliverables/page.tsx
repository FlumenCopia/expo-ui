'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatCard } from '@/components/common/StatCard';
import { TaskItem, DeliverableItem } from '@/components/dashboard/CommandCenterDashboard';

const TASK_TYPES: Record<string, { name: string; cls: string }> = {
  design: { name: 'Design', cls: 'c-design' },
  video: { name: 'Video', cls: 'c-video' },
  ads: { name: 'Ads', cls: 'c-ads' },
  it: { name: 'IT / Web', cls: 'c-it' },
  content: { name: 'Content', cls: 'c-content' },
  ops: { name: 'Ops', cls: 'c-ops' },
  client: { name: 'Client', cls: 'c-client' },
};

import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function DeliverablesPage() {
  const { data: deliverables = [], isLoading: deliverablesLoading } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => api.get('/deliverables').then((res) => res.data.data),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data.data),
  });

  const totC = deliverables.reduce((a: number, d: DeliverableItem) => a + d.contracted, 0);
  const totD = deliverables.reduce((a: number, d: DeliverableItem) => {
    const dId = d.deliverableId || (d as any).id;
    const c = tasks.filter(
      (t: TaskItem) => t.deliverable === dId && ['published', 'approved'].includes(t.status)
    ).length;
    return a + Math.min(c, d.contracted);
  }, 0);

  const inProductionCount = tasks.filter(
    (t: TaskItem) => t.deliverable && ['progress', 'review'].includes(t.status)
  ).length;

  if (deliverablesLoading || tasksLoading) {
    return <LoadingSpinner message="Loading Contracted Scope & Deliverables..." minHeight="450px" />;
  }

  return (
    <div>
      <div className="alert ok">
        <span>📋</span>
        <div>
          <b>Contracted scope — Package B (Rs. 4,50,000).</b> These are the exact deliverables agreed with Masters. Nothing below this line is optional; anything above it is goodwill and should be tracked separately so it never becomes an unpaid expectation.
        </div>
      </div>

      <div className="grid g4 mb">
        <StatCard
          label="Total Contracted Units"
          value={totC}
          note={`across ${deliverables.length} deliverable types`}
        />
        <StatCard
          label="Delivered"
          value={totD}
          colorClass="g"
          progressFillClass="g"
          progressPct={totC ? (totD / totC) * 100 : 0}
          note={`${Math.round(totC ? (totD / totC) * 100 : 0)}% of contract`}
        />
        <StatCard
          label="In Production"
          value={inProductionCount}
          colorClass="a"
          note="tasks actively producing"
        />
        <StatCard
          label="Remaining"
          value={totC - totD}
          colorClass="c"
          note="units still to deliver"
        />
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Deliverable Tracker</div>
            <div className="card-s">Live count against contracted scope</div>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Deliverable</th>
              <th style={{ width: '80px' }}>Type</th>
              <th style={{ width: '110px' }}>Contracted</th>
              <th style={{ width: '100px' }}>Delivered</th>
              <th style={{ width: '180px' }}>Progress</th>
              <th style={{ width: '90px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {deliverables.map((d: DeliverableItem) => {
              const dId = d.deliverableId || (d as any).id;
              const rel = tasks.filter((t: TaskItem) => t.deliverable === dId);
              const c = rel.filter((t: TaskItem) => ['published', 'approved'].includes(t.status)).length;
              const inp = rel.filter((t: TaskItem) => ['progress', 'review'].includes(t.status)).length;
              const p = Math.min(100, (c / d.contracted) * 100);
              const tt = TASK_TYPES[d.type] || { name: d.type, cls: 'c-client' };

              return (
                <tr key={dId}>
                  <td className="strong">
                    {d.name}
                    <div
                      style={{
                        fontSize: '10.5px',
                        color: 'var(--txt3)',
                        marginTop: '2px',
                        fontWeight: 400,
                      }}
                    >
                      {(d as any).note || ''}
                    </div>
                  </td>
                  <td>
                    <span className={`chip ${tt.cls}`}>{tt.name}</span>
                  </td>
                  <td className="mono">
                    {d.contracted} {d.unit}
                  </td>
                  <td
                    className="mono strong"
                    style={{ color: p >= 100 ? 'var(--green)' : 'var(--txt)' }}
                  >
                    {Math.min(c, d.contracted)}
                  </td>
                  <td>
                    <div className="pbar">
                      <div
                        className={`pfill ${p >= 100 ? 'g' : ''}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'var(--txt3)',
                        marginTop: '3px',
                      }}
                    >
                      {Math.round(p)}%{inp ? ` &middot; ${inp} in production` : ''}
                    </div>
                  </td>
                  <td>
                    {p >= 100 ? (
                      <span
                        className="chip"
                        style={{
                          background: 'rgba(16,185,129,.15)',
                          color: 'var(--green)',
                        }}
                      >
                        Complete
                      </span>
                    ) : inp > 0 ? (
                      <span
                        className="chip"
                        style={{
                          background: 'rgba(245,158,11,.15)',
                          color: 'var(--amber)',
                        }}
                      >
                        In Progress
                      </span>
                    ) : (
                      <span
                        className="chip"
                        style={{
                          background: 'rgba(148,163,184,.13)',
                          color: 'var(--txt3)',
                        }}
                      >
                        Pending
                      </span>
                    )}
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
