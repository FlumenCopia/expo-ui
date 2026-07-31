'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TaskItem, MemberItem } from '../dashboard/CommandCenterDashboard';

interface KanbanBoardProps {
  tasks: TaskItem[];
  members: MemberItem[];
  onTaskClick: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskItem['status']) => void;
}

const STATUSES: Array<{ id: TaskItem['status']; name: string; color: string }> = [
  { id: 'backlog', name: 'Backlog', color: '#64748B' },
  { id: 'assigned', name: 'Assigned', color: '#3B82F6' },
  { id: 'progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'review', name: 'In Review', color: '#A78BFA' },
  { id: 'approved', name: 'Approved', color: '#22D3EE' },
  { id: 'published', name: 'Published', color: '#10B981' },
];

const TASK_TYPES: Array<{ id: string; name: string; cls: string }> = [
  { id: 'design', name: 'Design', cls: 'c-design' },
  { id: 'video', name: 'Video', cls: 'c-video' },
  { id: 'ads', name: 'Ads', cls: 'c-ads' },
  { id: 'it', name: 'IT / Web', cls: 'c-it' },
  { id: 'content', name: 'Content', cls: 'c-content' },
  { id: 'ops', name: 'Ops', cls: 'c-ops' },
  { id: 'client', name: 'Client', cls: 'c-client' },
];

const PRIORITIES: Array<{ id: string; name: string; cls: string }> = [
  { id: 'p0', name: 'P0 Critical', cls: 'p-p0' },
  { id: 'p1', name: 'P1 High', cls: 'p-p1' },
  { id: 'p2', name: 'P2 Normal', cls: 'p-p2' },
];

const PHASES = [
  { id: 'ph1', name: 'IGNITE' },
  { id: 'ph2', name: 'AMPLIFY' },
  { id: 'ph3', name: 'CONVERT' },
  { id: 'ph4', name: 'LAST MILE' },
  { id: 'ph5', name: 'LIVE + POST' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  members,
  onTaskClick,
  onMoveTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [quickMoveTaskId, setQuickMoveTaskId] = useState<string | null>(null);

  // Close Quick Move menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.qm-wrap')) {
        setQuickMoveTaskId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Touch drag state for mobile
  const touchState = useRef<{ taskId: string | null; element: HTMLElement | null }>({
    taskId: null,
    element: null,
  });

  const getTaskId = (t: any) => t.id || t._id;
  const getMemberId = (m: MemberItem) => m.id || (m as any)._id;

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (t.title || '').toLowerCase().includes(q);
        const matchCode = (t.code || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCode) return false;
      }
      if (selectedPhase !== 'all' && t.phase !== selectedPhase) return false;
      if (selectedType !== 'all' && t.type !== selectedType) return false;
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
      return true;
    });
  }, [tasks, members, searchQuery, selectedPhase, selectedType, selectedAssignee]);

  const daysLeft = (dueStr: string) => {
    if (!dueStr) return 0;
    const due = new Date(dueStr);
    const now = new Date();
    return Math.ceil((due.getTime() - now.getTime()) / 86400000);
  };

  const getDueCls = (dueStr: string, status: string) => {
    if (['published', 'approved'].includes(status)) return '';
    const d = daysLeft(dueStr);
    if (d < 0) return 'late';
    if (d <= 2) return 'soon';
    return '';
  };

  // --- HTML5 Desktop Drag Events ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskItem['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (id) {
      onMoveTask(id, targetStatus);
    }
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  // --- Mobile Touch Drag Events ---
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    const target = e.currentTarget as HTMLElement;
    touchState.current = { taskId: id, element: target };
    setDraggedTaskId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchState.current.taskId) return;
    const touch = e.touches[0];
    const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const colEl = targetEl?.closest('.kb-col');
    if (colEl) {
      const colStatus = colEl.getAttribute('data-col-id');
      if (colStatus && colStatus !== dragOverCol) {
        setDragOverCol(colStatus);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchState.current.taskId && dragOverCol) {
      onMoveTask(touchState.current.taskId, dragOverCol as TaskItem['status']);
    }
    touchState.current = { taskId: null, element: null };
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* FILTERS BAR */}
      <div className="filters">
        <input
          className="srch"
          placeholder="Search tasks…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          <button
            className={`fbtn ${selectedPhase === 'all' ? 'on' : ''}`}
            onClick={() => setSelectedPhase('all')}
          >
            All Phases
          </button>
          {PHASES.map((p) => (
            <button
              key={p.id}
              className={`fbtn ${selectedPhase === p.id ? 'on' : ''}`}
              onClick={() => setSelectedPhase(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          <button
            className={`fbtn ${selectedType === 'all' ? 'on' : ''}`}
            onClick={() => setSelectedType('all')}
          >
            All Types
          </button>
          {TASK_TYPES.map((t) => (
            <button
              key={t.id}
              className={`fbtn ${selectedType === t.id ? 'on' : ''}`}
              onClick={() => setSelectedType(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>

        <select
          className="srch"
          style={{ width: 'auto', minWidth: '180px' }}
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
        >
          <option value="all">All Members</option>
          {members.map((m) => {
            const mId = getMemberId(m);
            const teamDesc = m.fn || m.team || m.role;
            const label = teamDesc ? `${m.name} — ${teamDesc}` : m.name;
            return (
              <option key={mId} value={mId}>
                {label}
              </option>
            );
          })}
        </select>
      </div>

      {/* KANBAN BOARD WRAPPER */}
      <div className="kb-wrap">
        <div className="kb">
        {STATUSES.map((s) => {
          const colTasks = filteredTasks.filter((t) => t.status === s.id);
          const isOver = dragOverCol === s.id;

          return (
            <div
              key={s.id}
              data-col-id={s.id}
              className={`kb-col ${isOver ? 'drag-over' : ''}`}
              style={{
                border: isOver ? '2px dashed var(--gold)' : undefined,
                background: isOver ? 'rgba(245,166,35,0.05)' : undefined,
              }}
              onDragOver={(e) => handleDragOver(e, s.id)}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => handleDrop(e, s.id)}
            >
              <div className="kb-head">
                <div className="kb-name">
                  <span className="kb-dot" style={{ background: s.color }} />
                  {s.name}
                </div>
                <span className="kb-count">{colTasks.length}</span>
              </div>

              <div className="kb-body">
                {colTasks.length > 0 ? (
                  colTasks.map((t) => {
                    const taskId = getTaskId(t);
                    const isDragging = draggedTaskId === taskId;
                    const isQuickMoveActive = quickMoveTaskId === taskId;
                    const m = members.find(
                      (x) =>
                        getMemberId(x) === t.assignee ||
                        x.short === t.assignee ||
                        (x as any).email === t.assignee
                    );
                    const tt = TASK_TYPES.find((x) => x.id === t.type) || {
                      name: t.type,
                      cls: 'c-client',
                    };
                    const pr = PRIORITIES.find((x) => x.id === t.priority);
                    const d = daysLeft(t.due);
                    const dc = getDueCls(t.due, t.status);

                    return (
                      <div
                        key={taskId}
                        className={`tcard ${isDragging ? 'drag' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, taskId)}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDragOverCol(null);
                        }}
                        onTouchStart={(e) => handleTouchStart(e, taskId)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('.qm-wrap')) return;
                          onTaskClick(taskId);
                        }}
                        style={{
                          position: 'relative',
                          zIndex: isQuickMoveActive ? 999 : 1,
                        }}
                      >
                        <div className="tc-top">
                          <span className={`chip ${tt.cls}`}>{tt.name}</span>
                          {pr && (
                            <span className={`chip ${pr.cls}`}>
                              {(t.priority || '').toUpperCase()}
                            </span>
                          )}

                          {/* QUICK MOVE / STATUS CHANGE DROPDOWN */}
                          <div className="qm-wrap" style={{ marginLeft: 'auto', position: 'relative' }}>
                            <button
                              type="button"
                              title="Move Task Status"
                              style={{
                                fontSize: '10px',
                                color: 'var(--txt3)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: 'var(--panel3)',
                                border: '1px solid var(--border2)',
                                fontWeight: 600,
                              }}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setQuickMoveTaskId(isQuickMoveActive ? null : taskId);
                              }}
                            >
                              ⇄ {t.code}
                            </button>

                            {isQuickMoveActive && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  marginTop: '4px',
                                  background: 'var(--panel)',
                                  border: '1px solid var(--border2)',
                                  borderRadius: 'var(--rs)',
                                  boxShadow: '0 12px 35px rgba(0,0,0,0.85)',
                                  zIndex: 1000,
                                  minWidth: '150px',
                                  padding: '6px',
                                }}
                              >
                                <div style={{ fontSize: '9px', color: 'var(--txt3)', padding: '2px 6px 6px', fontWeight: 700, letterSpacing: '0.5px' }}>
                                  MOVE TO STATUS:
                                </div>
                                {STATUSES.map((st) => (
                                  <button
                                    key={st.id}
                                    type="button"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      width: '100%',
                                      padding: '6px 8px',
                                      fontSize: '11.5px',
                                      borderRadius: '4px',
                                      color: st.id === t.status ? 'var(--gold)' : 'var(--txt)',
                                      background: st.id === t.status ? 'var(--panel2)' : 'transparent',
                                      textAlign: 'left',
                                      fontWeight: st.id === t.status ? 700 : 500,
                                    }}
                                    onClick={(ev) => {
                                      ev.stopPropagation();
                                      onMoveTask(taskId, st.id);
                                      setQuickMoveTaskId(null);
                                    }}
                                  >
                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                                    {st.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="tc-title">{t.title}</div>
                        <div className="tc-meta">
                          <div
                            className="tc-av"
                            style={{ background: m ? m.color : '#555' }}
                            title={m ? m.name : 'Unassigned'}
                          >
                            {m ? m.short : '?'}
                          </div>
                          <div className={`tc-due ${dc}`}>
                            {dc === 'late' ? '⚠️ ' : ''}
                            {t.due}
                            {dc === 'late' ? ` (${Math.abs(d)}d)` : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '22px 8px',
                      color: 'var(--txt3)',
                      fontSize: '11px',
                    }}
                  >
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
