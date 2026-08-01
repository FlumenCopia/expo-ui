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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default'>('asc');
  const now = new Date();

  const getMemberId = (m: MemberItem) => m.id || (m as any)._id;

  const togglePhase = (id: string) => {
    setOpenPhases((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isFilterActive =
    searchQuery !== '' ||
    selectedDept !== 'all' ||
    selectedAssignee !== 'all' ||
    selectedPriority !== 'all' ||
    selectedStatus !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedAssignee('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
  };

  const filteredTasks = tasks.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const matchCode = (t.code || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCode) return false;
    }
    if (selectedDept !== 'all' && t.type !== selectedDept) return false;
    if (selectedAssignee !== 'all') {
      const targetMember = members.find(
        (m) => getMemberId(m) === selectedAssignee || m.short === selectedAssignee || (m as any).email === selectedAssignee
      );
      if (targetMember) {
        const mId = getMemberId(targetMember);
        const taskAssignee = typeof t.assignee === 'object' ? (t.assignee as any)?._id || (t.assignee as any)?.id : t.assignee;
        const taskAssigneeShort = typeof t.assignee === 'object' ? (t.assignee as any)?.short : t.assignee;
        const isMatch =
          taskAssignee === mId ||
          taskAssigneeShort === targetMember.short ||
          t.assignee === targetMember.short ||
          t.assignee === targetMember.email ||
          t.assignee === targetMember.name;
        if (!isMatch) return false;
      } else if (t.assignee !== selectedAssignee) {
        return false;
      }
    }
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div>
      <div className="alert info">
        <span>ℹ️</span>
        <div>
          Each phase has a single primary objective. Buffer is built into every phase for revision cycles and client approval lag — the schedule assumes approvals take up to 48 hours, not instantly.
        </div>
      </div>

      {/* FILTER & SORT BAR */}
      <div className="card mb" style={{ padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--txt3)', marginBottom: '10px' }}>
          Filter Timeline Tasks:
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <input
            className="srch"
            style={{ width: '180px' }}
            placeholder="Search code or title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Department Select */}
          <select
            className="srch"
            style={{ width: 'auto', minWidth: '150px' }}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="design">🎨 Design</option>
            <option value="video">🎬 Video</option>
            <option value="ads">📢 Ads / Performance</option>
            <option value="it">💻 IT / Web</option>
            <option value="content">📝 Content</option>
            <option value="ops">⚙️ Ops</option>
            <option value="client">👥 Client</option>
          </select>

          {/* Assignee Select */}
          <select
            className="srch"
            style={{ width: 'auto', minWidth: '160px' }}
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
          >
            <option value="all">All Assignees</option>
            {members.map((m) => {
              const mId = getMemberId(m);
              const desc = m.fn || m.team || m.role;
              return (
                <option key={mId} value={mId}>
                  {m.name} {desc ? `— ${desc}` : ''}
                </option>
              );
            })}
          </select>

          {/* Priority Select */}
          <select
            className="srch"
            style={{ width: 'auto', minWidth: '130px' }}
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="p0">🔴 P0 Critical</option>
            <option value="p1">🟡 P1 High</option>
            <option value="p2">🔵 P2 Normal</option>
          </select>

          {/* Status Select */}
          <select
            className="srch"
            style={{ width: 'auto', minWidth: '130px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="progress">⚡ In Progress</option>
            <option value="review">👀 In Review</option>
            <option value="approved">✅ Approved</option>
            <option value="published">🚀 Published</option>
            <option value="assigned">📌 Assigned</option>
            <option value="backlog">📥 Backlog</option>
          </select>

          {/* Clear Filters */}
          {isFilterActive && (
            <button
              className="btn btn-s btn-sm"
              onClick={clearFilters}
              style={{ borderRadius: 'var(--rs)', padding: '7px 12px' }}
            >
              🧹 Clear Filters
            </button>
          )}
        </div>

        {/* SORT BY DATE CONTROL */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border2)', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt2)' }}>
            Sort Tasks by Date:
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className={`fbtn ${sortOrder === 'asc' ? 'on' : ''}`}
              onClick={() => setSortOrder('asc')}
            >
              Date ↑ (Earliest First)
            </button>
            <button
              className={`fbtn ${sortOrder === 'desc' ? 'on' : ''}`}
              onClick={() => setSortOrder('desc')}
            >
              Date ↓ (Latest First)
            </button>
            <button
              className={`fbtn ${sortOrder === 'default' ? 'on' : ''}`}
              onClick={() => setSortOrder('default')}
            >
              Default Order
            </button>
          </div>
        </div>
      </div>

      {PHASES.map((p) => {
        let phaseTasks = filteredTasks.filter((t) => t.phase === p.id);
        const totalPhaseTasks = tasks.filter((t) => t.phase === p.id);
        if (sortOrder === 'asc') {
          phaseTasks = [...phaseTasks].sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());
        } else if (sortOrder === 'desc') {
          phaseTasks = [...phaseTasks].sort((a, b) => new Date(b.due).getTime() - new Date(a.due).getTime());
        }
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
