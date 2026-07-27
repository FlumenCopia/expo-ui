'use client';

import React, { useState, useEffect } from 'react';
import { TaskItem, MemberItem, DeliverableItem } from '../dashboard/CommandCenterDashboard';

interface TaskFormModalProps {
  initialTask?: TaskItem | null;
  members: MemberItem[];
  deliverables: DeliverableItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<TaskItem>) => void;
}

const TASK_TYPES = [
  { id: 'design', name: 'Design' },
  { id: 'video', name: 'Video' },
  { id: 'ads', name: 'Ads' },
  { id: 'it', name: 'IT / Web' },
  { id: 'content', name: 'Content' },
  { id: 'ops', name: 'Ops' },
  { id: 'client', name: 'Client' },
];

const PRIORITIES = [
  { id: 'p0', name: 'P0 Critical' },
  { id: 'p1', name: 'P1 High' },
  { id: 'p2', name: 'P2 Normal' },
];

const PHASES = [
  { id: 'ph1', name: 'IGNITE' },
  { id: 'ph2', name: 'AMPLIFY' },
  { id: 'ph3', name: 'CONVERT' },
  { id: 'ph4', name: 'LAST MILE' },
  { id: 'ph5', name: 'LIVE + POST' },
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  initialTask,
  members,
  deliverables,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const getMemberId = (m: MemberItem) => m.id || (m as any)._id;

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('design');
  const [priority, setPriority] = useState('p2');
  const [phase, setPhase] = useState('ph1');
  const [assignee, setAssignee] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [due, setDue] = useState(new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10));
  const [hours, setHours] = useState(4);
  const [deliverable, setDeliverable] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDesc(initialTask.desc || '');
      setType(initialTask.type);
      setPriority(initialTask.priority);
      setPhase(initialTask.phase);
      setAssignee(initialTask.assignee);
      setReviewer(initialTask.reviewer);
      setDue(initialTask.due);
      setHours(initialTask.hours);
      setDeliverable(initialTask.deliverable || '');
    } else {
      setTitle('');
      setDesc('');
      setType('design');
      setPriority('p2');
      setPhase('ph1');
      if (members.length > 0) {
        setAssignee(getMemberId(members[0]));
        setReviewer(getMemberId(members[0]));
      }
    }
  }, [initialTask, members, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Task title is required');
      return;
    }

    onSubmit({
      title,
      desc,
      type,
      priority: priority as any,
      phase,
      assignee: assignee || (members[0] ? getMemberId(members[0]) : ''),
      reviewer: reviewer || (members[0] ? getMemberId(members[0]) : ''),
      due,
      hours: Number(hours),
      deliverable: deliverable || null,
      status: initialTask ? initialTask.status : 'assigned',
    });

    onClose();
  };

  return (
    <div
      className="ovl show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="m-h">
          <div className="m-t">{initialTask ? `Edit ${initialTask.code}` : 'New Task'}</div>
          <button className="m-x" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="m-b">
            <div className="fg">
              <label className="fl">Task Title</label>
              <input
                className="fi"
                placeholder="e.g. Countdown creative series (12 posters)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="fg">
              <label className="fl">Description / Brief</label>
              <textarea
                className="ft"
                placeholder="What exactly needs to be produced, and any constraints"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div className="frow3">
              <div className="fg">
                <label className="fl">Type</label>
                <select className="fs" value={type} onChange={(e) => setType(e.target.value)}>
                  {TASK_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fg">
                <label className="fl">Priority</label>
                <select className="fs" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  {PRIORITIES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fg">
                <label className="fl">Phase</label>
                <select className="fs" value={phase} onChange={(e) => setPhase(e.target.value)}>
                  {PHASES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="frow">
              <div className="fg">
                <label className="fl">Assign To</label>
                <select className="fs" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                  {members.map((m) => {
                    const mId = getMemberId(m);
                    return (
                      <option key={mId} value={mId}>
                        {m.name} — {m.fn}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="fg">
                <label className="fl">Reviewer</label>
                <select className="fs" value={reviewer} onChange={(e) => setReviewer(e.target.value)}>
                  {members.map((m) => {
                    const mId = getMemberId(m);
                    return (
                      <option key={mId} value={mId}>
                        {m.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="frow3">
              <div className="fg">
                <label className="fl">Due Date</label>
                <input
                  className="fi"
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>

              <div className="fg">
                <label className="fl">Est. Hours</label>
                <input
                  className="fi"
                  type="number"
                  min="1"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                />
              </div>

              <div className="fg">
                <label className="fl">Counts Toward</label>
                <select
                  className="fs"
                  value={deliverable}
                  onChange={(e) => setDeliverable(e.target.value)}
                >
                  <option value="">— none —</option>
                  {deliverables.map((d) => (
                    <option key={d.deliverableId || (d as any).id} value={d.deliverableId || (d as any).id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="m-f">
            <button type="button" className="btn btn-s" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-p">
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
