'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MemberItem } from '@/components/dashboard/CommandCenterDashboard';

interface MemberFormModalProps {
  initialMember?: (MemberItem & { skills?: string[]; email?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: any) => void;
  onRemove?: () => void;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  initialMember,
  isOpen,
  onClose,
  onSubmit,
  onRemove,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [short, setShort] = useState('');
  const [fn, setFn] = useState('');
  const [role, setRole] = useState('member');
  const [team, setTeam] = useState('core');
  const [cap, setCap] = useState(20);
  const [skills, setSkills] = useState('');

  // Fetch dynamic roles from API
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles').then((res) => res.data.data),
    enabled: isOpen,
  });

  useEffect(() => {
    if (initialMember) {
      setName(initialMember.name || '');
      setEmail((initialMember as any).email || '');
      setPassword('');
      setShort(initialMember.short || '');
      setFn(initialMember.fn || '');
      setRole(initialMember.role || 'member');
      setTeam((initialMember as any).team || 'core');
      setCap(initialMember.cap || 20);
      setSkills((initialMember.skills || []).join(', '));
    } else {
      setName('');
      setEmail('');
      setPassword('User@123456');
      setShort('');
      setFn('');
      setRole(roles[0]?.code || 'member');
      setTeam('core');
      setCap(20);
      setSkills('');
    }
  }, [initialMember, isOpen, roles]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Full Name is required');
      return;
    }

    onSubmit({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@flumenx.com`,
      password,
      short: short || name.slice(0, 2).toUpperCase(),
      fn: fn || 'Team Member',
      role,
      team,
      cap: Number(cap),
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
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
          <div className="m-t">{initialMember ? `Edit ${initialMember.name}` : 'Add New Team User'}</div>
          <button className="m-x" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="m-b">
            <div className="frow">
              <div className="fg">
                <label className="fl">Full Name</label>
                <input
                  className="fi"
                  placeholder="e.g. Rahul K"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="fg">
                <label className="fl">Initials / Short Badge</label>
                <input
                  className="fi"
                  placeholder="RK"
                  maxLength={3}
                  value={short}
                  onChange={(e) => setShort(e.target.value)}
                />
              </div>
            </div>

            <div className="frow">
              <div className="fg">
                <label className="fl">Work Email Address</label>
                <input
                  className="fi"
                  type="email"
                  placeholder="rahul@flumenx.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!initialMember}
                />
              </div>
              {!initialMember && (
                <div className="fg">
                  <label className="fl">Initial Password</label>
                  <input
                    className="fi"
                    type="password"
                    placeholder="User@123456"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <div className="frow">
              <div className="fg">
                <label className="fl">Function / Designation</label>
                <input
                  className="fi"
                  placeholder="e.g. Lead Graphic Designer"
                  value={fn}
                  onChange={(e) => setFn(e.target.value)}
                />
              </div>
              <div className="fg">
                <label className="fl">Assigned Team / Unit</label>
                <select className="fs" value={team} onChange={(e) => setTeam(e.target.value)}>
                  <option value="core">Core Operations</option>
                  <option value="alpha">Team Alpha (Ads)</option>
                  <option value="beta">Team Beta (Marketing)</option>
                  <option value="design">Design Studio</option>
                  <option value="video">Video &amp; Motion</option>
                  <option value="it">IT &amp; Systems</option>
                </select>
              </div>
            </div>

            <div className="frow">
              <div className="fg">
                <label className="fl">Assigned Role (Dynamic)</label>
                <select className="fs" value={role} onChange={(e) => setRole(e.target.value)}>
                  {roles.map((r: any) => (
                    <option key={r._id || r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="fg">
                <label className="fl">Weekly Capacity (hours)</label>
                <input
                  className="fi"
                  type="number"
                  value={cap}
                  onChange={(e) => setCap(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="fg">
              <label className="fl">Skills &amp; Specialties (comma separated)</label>
              <input
                className="fi"
                placeholder="design, photoshop, branding"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
          </div>

          <div className="m-f">
            {initialMember && onRemove && (
              <button type="button" className="btn btn-d" onClick={onRemove}>
                Delete User Account
              </button>
            )}
            <button type="button" className="btn btn-s" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-p">
              {initialMember ? 'Save Account Changes' : 'Create User Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
