'use client';

import React from 'react';
import { TaskItem, MemberItem, DeliverableItem } from '../dashboard/CommandCenterDashboard';

interface TaskDetailModalProps {
  task: TaskItem | null;
  members: MemberItem[];
  deliverables: DeliverableItem[];
  onClose: () => void;
  onStatusChange: (status: TaskItem['status']) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUSES: Array<{ id: TaskItem['status']; name: string; color: string }> = [
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

const PHASES: Record<string, string> = {
  ph1: 'IGNITE',
  ph2: 'AMPLIFY',
  ph3: 'CONVERT',
  ph4: 'LAST MILE',
  ph5: 'LIVE + POST',
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  members,
  deliverables,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  if (!task) return null;

  const m = members.find((x) => x.id === task.assignee);
  const r = members.find((x) => x.id === task.reviewer);
  const tt = TASK_TYPES[task.type] || { name: task.type, cls: 'c-client' };
  const del = deliverables.find(
    (d) => (d.deliverableId || (d as any).id) === task.deliverable
  );

  const due = new Date(task.due);
  const now = new Date();
  const dLeft = Math.ceil((due.getTime() - now.getTime()) / 86400000);
  const statusInfo = STATUSES.find((s) => s.id === task.status) || STATUSES[0];

  return (
    <div
      className="ovl show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal wide">
        <div className="m-h">
          <div>
            <div className="m-t">{task.title}</div>
            <div
              style={{ fontSize: '11px', color: 'var(--txt3)', marginTop: '3px' }}
              className="mono"
            >
              {task.code} &middot; {PHASES[task.phase] || ''}
            </div>
          </div>
          <button className="m-x" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="m-b">
          <div style={{ display: 'flex', gap: '7px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className={`chip ${tt.cls}`}>{tt.name}</span>
            <span className="chip p-p1">{task.priority.toUpperCase()}</span>
            <span
              className="chip"
              style={{
                background: statusInfo.color + '22',
                color: statusInfo.color,
              }}
            >
              {statusInfo.name}
            </span>
            {dLeft < 0 && !['published', 'approved'].includes(task.status) && (
              <span className="chip p-p0">⚠️ {Math.abs(dLeft)}d overdue</span>
            )}
          </div>

          {task.desc && (
            <div
              style={{
                background: 'var(--panel2)',
                borderRadius: '8px',
                padding: '13px',
                fontSize: '12.5px',
                color: 'var(--txt2)',
                lineHeight: 1.6,
                marginBottom: '16px',
              }}
            >
              {task.desc}
            </div>
          )}

          <div className="grid g2">
            <div>
              <div className="dl">
                <span className="dl-k">Assigned to</span>
                <span className="dl-v">{m ? m.name : '—'}</span>
              </div>
              <div className="dl">
                <span className="dl-k">Reviewer</span>
                <span className="dl-v">{r ? r.name : '—'}</span>
              </div>
              <div className="dl">
                <span className="dl-k">Due date</span>
                <span className="dl-v">{task.due}</span>
              </div>
            </div>
            <div>
              <div className="dl">
                <span className="dl-k">Estimated hours</span>
                <span className="dl-v">{task.hours}h</span>
              </div>
              <div className="dl">
                <span className="dl-k">Phase</span>
                <span className="dl-v">{PHASES[task.phase] || '—'}</span>
              </div>
              <div className="dl">
                <span className="dl-k">Counts toward</span>
                <span className="dl-v">{del ? del.name : '—'}</span>
              </div>
            </div>
          </div>

          <div className="divider" />
          <label className="fl">Move to status</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STATUSES.map((s) => (
              <button
                key={s.id}
                className={`fbtn ${task.status === s.id ? 'on' : ''}`}
                onClick={() => onStatusChange(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="m-f">
          <button className="btn btn-d" onClick={onDelete}>
            Delete
          </button>
          <button className="btn btn-s" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-p" onClick={onEdit}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};
