'use client';

import React, { useState } from 'react';
import { TaskItem, MemberItem } from '../dashboard/CommandCenterDashboard';

interface TimelineViewProps {
  tasks: TaskItem[];
  members: MemberItem[];
  onTaskToggle: (taskId: string, currentStatus: string) => void;
}

const PHASES = [
  { id: 'ph1', name: 'IGNITE', start: '2026-07-18', end: '2026-08-03', cls: '', goal: 'Foundation, brand setup, vendor + sponsor outreach launch' },
  { id: 'ph2', name: 'AMPLIFY', start: '2026-08-04', end: '2026-08-31', cls: 'p2', goal: 'Vendor push, consumer awareness scale, pre-registration live' },
  { id: 'ph3', name: 'CONVERT', start: '2026-09-01', end: '2026-09-20', cls: 'p3', goal: 'Peak ad spend, FOMO activation, registration drive' },
  { id: 'ph4', name: 'LAST MILE', start: '2026-09-21', end: '2026-09-24', cls: 'p4', goal: 'Final 4-day sprint, maximum public reach' },
  { id: 'ph5', name: 'LIVE + POST', start: '2026-09-25', end: '2026-09-29', cls: 'p5', goal: 'Event coverage, then success assets for Year 5' },
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

export const TimelineView: React.FC<TimelineViewProps> = ({
  tasks,
  members,
  onTaskToggle,
}) => {
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({
    ph1: true,
    ph2: true,
    ph3: true,
    ph4: true,
    ph5: true,
  });
  const now = new Date();

  const getMemberId = (m: MemberItem) => m.id || (m as any)._id;

  const togglePhase = (id: string) => {
    setOpenPhases((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <div className="alert info">
        <span>ℹ️</span>
        <div>
          Each phase has a single primary objective. Buffer is built into every phase for revision cycles and client approval lag — the schedule assumes approvals take up to 48 hours, not instantly.
        </div>
      </div>

      {PHASES.map((p) => {
        const phaseTasks = tasks.filter((t) => t.phase === p.id);
        const done = phaseTasks.filter((t) => ['published', 'approved'].includes(t.status)).length;
        const pct = phaseTasks.length ? Math.round((done / phaseTasks.length) * 100) : 0;

        const s = new Date(p.start);
        const e = new Date(p.end + 'T23:59:59');
        const active = now >= s && now <= e;
        const past = now > e;
        const days = Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1;
        const isOpen = !!openPhases[p.id];

        return (
          <div key={p.id} className={`tl-phase ${p.cls} ${isOpen ? 'open' : ''}`}>
            <div className="tl-ph-h" onClick={() => togglePhase(p.id)}>
              <div className="tl-ph-l">
                <div>
                  <div className="tl-ph-n">
                    {p.name}{' '}
                    {active ? (
                      <>
                        <span className="rt" />
                        <span style={{ fontSize: '10px', color: 'var(--green)' }}>ACTIVE</span>
                      </>
                    ) : past ? (
                      <span style={{ fontSize: '10px', color: 'var(--txt3)' }}>COMPLETE</span>
                    ) : null}
                  </div>
                  <div className="tl-ph-d">
                    {p.start} &ndash; {p.end} &middot; {days} days &middot; {p.goal}
                  </div>
                </div>
              </div>
              <div className="tl-ph-r">
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{pct}%</div>
                  <div style={{ fontSize: '10px', color: 'var(--txt3)' }}>
                    {done}/{phaseTasks.length} done
                  </div>
                </div>
                <div style={{ width: '80px' }}>
                  <div className="pbar">
                    <div
                      className={`pfill ${pct === 100 ? 'g' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isOpen && (
              <div className="tl-ph-body" style={{ display: 'block' }}>
                {phaseTasks.length > 0 ? (
                  phaseTasks.map((t) => {
                    const taskId = t.id || (t as any)._id;
                    const m = members.find(
                      (x) =>
                        getMemberId(x) === t.assignee ||
                        x.short === t.assignee ||
                        (x as any).email === t.assignee
                    );
                    const tt = TASK_TYPES[t.type] || { name: t.type, cls: 'c-client' };
                    const dn = ['published', 'approved'].includes(t.status);

                    return (
                      <div key={taskId} className="tl-task">
                        <div
                          className={`tl-chk ${dn ? 'done' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskToggle(taskId, t.status);
                          }}
                        >
                          {dn ? '✓' : ''}
                        </div>
                        <span className={`chip ${tt.cls}`}>{tt.name}</span>
                        <span
                          style={{
                            flex: 1,
                            textDecoration: dn ? 'line-through' : 'none',
                            color: dn ? 'var(--txt3)' : 'var(--txt)',
                          }}
                        >
                          {t.title}
                        </span>
                        <span className="tc-code">{t.code}</span>
                        <div
                          className="tc-av"
                          style={{ background: m ? m.color : '#555' }}
                          title={m ? m.name : 'Unassigned'}
                        >
                          {m ? m.short : '?'}
                        </div>
                          <span
                            style={{
                              fontSize: '10.5px',
                              color: 'var(--txt3)',
                              minWidth: '70px',
                              textAlign: 'right',
                            }}
                          >
                          {t.due}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '14px', color: 'var(--txt3)', fontSize: '12px' }}>
                    No tasks in this phase
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
