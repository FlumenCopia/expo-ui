'use client';

import React, { useMemo } from 'react';
import { StatCard } from '../common/StatCard';
import { ChartWidget } from '../common/ChartWidget';
import Link from 'next/link';

export interface TaskItem {
  id: string;
  code: string;
  title: string;
  desc?: string;
  type: string;
  phase: string;
  assignee: string;
  reviewer: string;
  due: string;
  hours: number;
  deliverable?: string | null;
  status: 'backlog' | 'assigned' | 'progress' | 'review' | 'approved' | 'published';
  priority: 'p0' | 'p1' | 'p2';
}

export interface MemberItem {
  id: string;
  name: string;
  short: string;
  role: string;
  fn: string;
  color: string;
  cap: number;
  email?: string;
  team?: string;
}

export interface DeliverableItem {
  deliverableId: string;
  name: string;
  contracted: number;
  unit: string;
  type: string;
}

export interface KPIItem {
  kpiId: string;
  name: string;
  agreedMin: number;
  agreedMax: number;
  dreamMin: number;
  dreamMax: number;
  current: number;
}

export interface BudgetItem {
  budgetId: string;
  platform: string;
  total: number;
  spent: number;
}

interface DashboardProps {
  tasks: TaskItem[];
  members: MemberItem[];
  deliverables: DeliverableItem[];
  kpis: KPIItem[];
  budget: BudgetItem[];
  onTaskClick?: (taskId: string) => void;
}

const PHASES = [
  { id: 'ph1', name: 'IGNITE', start: '2026-07-18', end: '2026-08-03' },
  { id: 'ph2', name: 'AMPLIFY', start: '2026-08-04', end: '2026-08-31' },
  { id: 'ph3', name: 'CONVERT', start: '2026-09-01', end: '2026-09-20' },
  { id: 'ph4', name: 'LAST MILE', start: '2026-09-21', end: '2026-09-24' },
  { id: 'ph5', name: 'LIVE + POST', start: '2026-09-25', end: '2026-09-29' },
];

const STATUSES = [
  { id: 'backlog', name: 'Backlog', color: '#64748B' },
  { id: 'assigned', name: 'Assigned', color: '#3B82F6' },
  { id: 'progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'review', name: 'In Review', color: '#A78BFA' },
  { id: 'approved', name: 'Approved', color: '#22D3EE' },
  { id: 'published', name: 'Published', color: '#10B981' },
];

const TASK_TYPES: Record<string, { name: string; cls: string }> = {
  design: { name: 'Design', cls: 'c-design' },
  video: { name: 'Video', cls: 'c-video' },
  ads: { name: 'Ads', cls: 'c-ads' },
  it: { name: 'IT / Web', cls: 'c-it' },
  content: { name: 'Content', cls: 'c-content' },
  ops: { name: 'Ops', cls: 'c-ops' },
  client: { name: 'Client', cls: 'c-client' },
};

export const CommandCenterDashboard: React.FC<DashboardProps> = ({
  tasks,
  members,
  deliverables,
  kpis,
  budget,
  onTaskClick,
}) => {
  const expoStart = new Date('2026-07-18T00:00:00+05:30');
  const expoEnd = new Date('2026-09-29T23:59:00+05:30');
  const now = new Date();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => ['published', 'approved'].includes(t.status)).length;
  const progTasks = tasks.filter((t) => t.status === 'progress').length;
  const revTasks = tasks.filter((t) => t.status === 'review').length;

  const daysLeft = (dueStr: string) => {
    const due = new Date(dueStr);
    return Math.ceil((due.getTime() - now.getTime()) / 86400000);
  };

  const lateTasks = tasks.filter(
    (t) => daysLeft(t.due) < 0 && !['published', 'approved'].includes(t.status)
  );
  const soonTasks = tasks.filter((t) => {
    const d = daysLeft(t.due);
    return d >= 0 && d <= 3 && !['published', 'approved'].includes(t.status);
  });

  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const elapsed = Math.max(0, Math.ceil((now.getTime() - expoStart.getTime()) / 86400000));
  const totalDays = Math.ceil((expoEnd.getTime() - expoStart.getTime()) / 86400000);

  const curPhase =
    PHASES.find(
      (p) => now >= new Date(p.start) && now <= new Date(p.end + 'T23:59:59')
    ) || PHASES[0];

  const budTot = budget.reduce((a, b) => a + b.total, 0);
  const budSpent = budget.reduce((a, b) => a + b.spent, 0);

  const delTot = deliverables.reduce((a, d) => a + d.contracted, 0);
  const delDone = deliverables.reduce((a, d) => {
    const c = tasks.filter(
      (t) => t.deliverable === (d.deliverableId || (d as any).id) && ['published', 'approved'].includes(t.status)
    ).length;
    return a + Math.min(c, d.contracted);
  }, 0);

  // Status Chart Data
  const chartData = useMemo(() => {
    return {
      labels: STATUSES.map((s) => s.name),
      datasets: [
        {
          data: STATUSES.map((s) => tasks.filter((t) => t.status === s.id).length),
          backgroundColor: STATUSES.map((s) => s.color + 'CC'),
          borderRadius: 5,
        },
      ],
    };
  }, [tasks]);

  const memberLoad = (memberId: string) => {
    return tasks
      .filter((t) => t.assignee === memberId && !['published', 'approved'].includes(t.status))
      .reduce((a, b) => a + (b.hours || 4), 0);
  };

  const next7Days = tasks
    .filter((t) => {
      const d = daysLeft(t.due);
      return d >= -3 && d <= 7 && !['published'].includes(t.status);
    })
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
    .slice(0, 9);

  return (
    <div>
      {/* ALERTS */}
      {lateTasks.length > 0 && (
        <div className="alert err">
          <span>&#9888;</span>
          <div>
            <b>{lateTasks.length} task{lateTasks.length > 1 ? 's' : ''} overdue.</b>{' '}
            {lateTasks.slice(0, 3).map((t) => t.code).join(', ')}
            {lateTasks.length > 3 ? ` +${lateTasks.length - 3} more` : ''} — reassign or extend before this cascades into the next phase.
          </div>
        </div>
      )}

      {revTasks > 0 && (
        <div className="alert warn">
          <span>&#9873;</span>
          <div>
            <b>{revTasks} task{revTasks > 1 ? 's' : ''} waiting for approval.</b> Approval delays are the single biggest cause of publishing slippage. Target: 24-hour turnaround.
          </div>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid g5 mb">
        <StatCard
          label="Campaign Progress"
          value={`${pct}%`}
          progressPct={pct}
          note={`${doneTasks} of ${totalTasks} tasks complete`}
        />
        <StatCard
          label="Day"
          value={
            <>
              {elapsed}
              <span style={{ fontSize: '15px', color: 'var(--txt3)' }}>/{totalDays}</span>
            </>
          }
          colorClass="c"
          progressFillClass="c"
          progressPct={(elapsed / totalDays) * 100}
          note={
            <>
              Phase: <b style={{ color: 'var(--gold)' }}>{curPhase.name}</b>
            </>
          }
        />
        <StatCard
          label="In Progress"
          value={progTasks}
          colorClass="a"
          note={`${revTasks} in review · ${soonTasks.length} due ≤3 days`}
        />
        <StatCard
          label="Overdue"
          value={lateTasks.length}
          colorClass={lateTasks.length ? 'r' : 'g'}
          note={lateTasks.length ? 'Needs action today' : 'All on schedule'}
        />
        <StatCard
          label="Ad Spend"
          value={`${Math.round(budSpent / 1000)}K`}
          colorClass="p"
          progressPct={budTot ? (budSpent / budTot) * 100 : 0}
          note={`of ₹${(budTot / 100000).toFixed(2)}L allocated`}
        />
      </div>

      {/* GRID 2-1 */}
      <div className="grid g-2-1 mb">
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Task Flow by Status</div>
              <div className="card-s">Where work is sitting right now</div>
            </div>
          </div>
          <ChartWidget data={chartData} height={120} />
        </div>

        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Deliverables</div>
              <div className="card-s">Contracted scope</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px 0 14px' }}>
            <div style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px' }}>
              {delDone}
              <span style={{ fontSize: '18px', color: 'var(--txt3)' }}>/{delTot}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--txt3)', marginTop: '4px' }}>
              units delivered
            </div>
          </div>
          <div className="pbar" style={{ height: '7px' }}>
            <div
              className="pfill g"
              style={{ width: `${delTot ? (delDone / delTot) * 100 : 0}%` }}
            />
          </div>
          <div style={{ marginTop: '14px' }}>
            {deliverables.slice(0, 5).map((d) => {
              const dId = d.deliverableId || (d as any).id;
              const c = tasks.filter(
                (t) => t.deliverable === dId && ['published', 'approved'].includes(t.status)
              ).length;
              const p = Math.min(100, (c / d.contracted) * 100);
              return (
                <div key={dId} style={{ marginBottom: '9px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      marginBottom: '3px',
                    }}
                  >
                    <span style={{ color: 'var(--txt2)' }}>
                      {d.name.length > 28 ? d.name.slice(0, 28) + '…' : d.name}
                    </span>
                    <span
                      className="mono"
                      style={{ color: p >= 100 ? 'var(--green)' : 'var(--txt3)' }}
                    >
                      {Math.min(c, d.contracted)}/{d.contracted}
                    </span>
                  </div>
                  <div className="pbar" style={{ height: '3px' }}>
                    <div
                      className={`pfill ${p >= 100 ? 'g' : ''}`}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRID 1-2 */}
      <div className="grid g-1-2 mb">
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Team Load</div>
              <div className="card-s">Open hours vs weekly capacity</div>
            </div>
          </div>
          {members
            .filter((m) => m.role !== 'accounts')
            .map((m) => {
              const load = memberLoad(m.id);
              const p = Math.min(100, (load / m.cap) * 100);
              const cls = p > 95 ? 'r' : p > 75 ? 'a' : 'g';
              return (
                <div key={m.id} style={{ marginBottom: '11px' }}>
                  <div className="tm-cap">
                    <span style={{ color: 'var(--txt2)', fontWeight: 600 }}>{m.name}</span>
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
                </div>
              );
            })}
        </div>

        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Next 7 Days</div>
              <div className="card-s">Everything due this week</div>
            </div>
            <Link href="/tasks" className="btn btn-s btn-sm">
              Open Board
            </Link>
          </div>
          {next7Days.length > 0 ? (
            <table className="tbl">
              <tbody>
                {next7Days.map((t) => {
                  const m = members.find((x) => x.id === t.assignee);
                  const d = daysLeft(t.due);
                  const tt = TASK_TYPES[t.type] || { name: t.type, cls: 'c-client' };
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onTaskClick?.(t.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ width: '26px' }}>
                        <div
                          className="tc-av"
                          style={{ background: m ? m.color : '#555' }}
                        >
                          {m ? m.short : '?'}
                        </div>
                      </td>
                      <td className="strong">
                        {t.title}
                        <div
                          style={{ fontSize: '10px', color: 'var(--txt3)', marginTop: '2px' }}
                          className="mono"
                        >
                          {t.code}
                        </div>
                      </td>
                      <td style={{ width: '78px' }}>
                        <span className={`chip ${tt.cls}`}>{tt.name}</span>
                      </td>
                      <td style={{ width: '88px', textAlign: 'right' }}>
                        <span
                          style={{
                            color:
                              d < 0
                                ? 'var(--red)'
                                : d <= 2
                                ? 'var(--amber)'
                                : 'var(--txt3)',
                            fontWeight: 600,
                            fontSize: '11px',
                          }}
                        >
                          {d < 0
                            ? Math.abs(d) + 'd late'
                            : d === 0
                            ? 'Today'
                            : d + 'd left'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty">
              <div className="empty-ic">&#9749;</div>
              <div className="empty-t">Nothing due this week</div>
            </div>
          )}
        </div>
      </div>

      {/* GRID 2: KPI Snapshot & Recent Activity */}
      <div className="grid g2">
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">KPI Snapshot</div>
              <div className="card-s">Agreed floor vs stretch target</div>
            </div>
            <Link href="/kpi" className="btn btn-s btn-sm">
              Full Tracker
            </Link>
          </div>
          {kpis.slice(0, 4).map((k) => {
            const p = Math.min(100, (k.current / k.dreamMax) * 100);
            const ap = (k.agreedMin / k.dreamMax) * 100;
            return (
              <div key={k.kpiId || (k as any).id} style={{ marginBottom: '13px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    marginBottom: '5px',
                  }}
                >
                  <span style={{ color: 'var(--txt2)', fontWeight: 600 }}>{k.name}</span>
                  <span className="mono" style={{ color: 'var(--txt)' }}>
                    {k.current.toLocaleString('en-IN')}{' '}
                    <span style={{ color: 'var(--txt3)' }}>
                      / {k.agreedMin.toLocaleString('en-IN')}
                    </span>
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div className="pbar" style={{ height: '5px' }}>
                    <div className="pfill c" style={{ width: `${p}%` }} />
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      left: `${ap}%`,
                      width: '2px',
                      height: '9px',
                      background: 'var(--green)',
                    }}
                  />
                </div>
              </div>
            );
          })}
          <div className="kpi-legend">
            <div className="kl">
              <div className="kl-d" style={{ background: 'var(--cyan)' }} /> Current
            </div>
            <div className="kl">
              <div className="kl-d" style={{ background: 'var(--green)' }} /> Agreed floor
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Recent Activity</div>
              <div className="card-s">Latest across the project</div>
            </div>
          </div>
          <div className="nf unread" style={{ marginBottom: '7px' }}>
            <div
              className="nf-ic"
              style={{ background: 'rgba(245,166,35,.15)' }}
            >
              💰
            </div>
            <div style={{ flex: 1 }}>
              <div className="nf-t">Ad spend updated</div>
              <div className="nf-m">Meta Ads spend updated to ₹20,000</div>
              <div className="nf-time">Just now</div>
            </div>
          </div>
          <div className="nf" style={{ marginBottom: '7px' }}>
            <div
              className="nf-ic"
              style={{ background: 'rgba(16,185,129,.15)' }}
            >
              ✓
            </div>
            <div style={{ flex: 1 }}>
              <div className="nf-t">Task approved</div>
              <div className="nf-m">EXP-003 Meta Business Suite setup approved</div>
              <div className="nf-time">2 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
