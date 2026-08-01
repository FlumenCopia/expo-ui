'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { MemberFormModal } from '@/components/team/MemberFormModal';
import { PasswordFormModal } from '@/components/team/PasswordFormModal';
import { RoleFormModal, RoleData } from '@/components/settings/RoleFormModal';
import { MemberItem } from '@/components/dashboard/CommandCenterDashboard';

const NOTIF_RULES = [
  { trigger: 'Task submitted for review', notifies: 'Assigned reviewer + Ops Head', priority: 'P0 Immediate', chipCls: 'p-p0' },
  { trigger: 'Task overdue', notifies: 'Assignee + Team Lead + Ops Head', priority: 'P0 Immediate', chipCls: 'p-p0' },
  { trigger: 'Task approved / published', notifies: 'Assignee + Super Admin', priority: 'Digest', chipCls: 'p-p2' },
  { trigger: 'New assignment created', notifies: 'Assignee', priority: 'P1 Immediate', chipCls: 'p-p1' },
  { trigger: 'Ad spend pace deviation > 20%', notifies: 'Super Admin + Ops Head', priority: 'P1 Daily', chipCls: 'p-p1' },
  { trigger: 'Member load exceeds 90% capacity', notifies: 'Ops Head + Team Lead', priority: 'P1 Daily', chipCls: 'p-p1' },
  { trigger: 'Deliverable milestone reached', notifies: 'Super Admin', priority: 'Digest', chipCls: 'p-p2' },
  { trigger: 'Client blocker flagged', notifies: 'Ops Head (PCP) + Super Admin', priority: 'P0 Immediate', chipCls: 'p-p0' },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuthStore();
  
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberItem | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<MemberItem | null>(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);

  // Queries
  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/users').then((res) => res.data.data),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles').then((res) => res.data.data),
  });

  // Mutations
  const createMemberMutation = useMutation({
    mutationFn: (data: any) => api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsMemberModalOpen(false);
      setEditingMember(null);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      api.put(`/users/${id}/password`, { newPassword }),
    onSuccess: () => {
      alert('Password updated successfully');
      setIsPasswordModalOpen(false);
      setPasswordTargetUser(null);
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: RoleData) => api.post('/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsRoleModalOpen(false);
      setEditingRole(null);
    },
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ members, roles }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `masters_expo_snapshot_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div>
      <div className="grid g2 mb">
        {/* ROLES & PERMISSIONS TABLE */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">Dynamic Roles &amp; Permissions Matrix</div>
              <div className="card-s">Edit permissions granted to each role</div>
            </div>
            {hasPermission('manage_team') && (
              <button
                className="btn btn-p btn-sm"
                onClick={() => {
                  setEditingRole(null);
                  setIsRoleModalOpen(true);
                }}
              >
                + Add Role
              </button>
            )}
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Assigned Members</th>
                  <th>Permissions</th>
                  <th style={{ width: '60px' }} />
                </tr>
              </thead>
              <tbody>
                {roles.map((r: RoleData & { _id: string }) => {
                  const who = members.filter((m: MemberItem) => m.role === r.code);
                  const isSuper = r.code === 'super_admin' || r.permissions.includes('*');

                  return (
                    <tr key={r._id}>
                      <td className="strong">
                        {r.name}
                        <div style={{ fontSize: '9.5px', color: 'var(--txt3)', marginTop: '2px' }} className="mono">
                          {r.code}
                        </div>
                      </td>
                      <td>
                        {who.length > 0 ? (
                          who.map((m: MemberItem) => (
                            <span
                              key={m.id}
                              className="chip"
                              style={{ background: `${m.color}22`, color: m.color, marginRight: '4px', marginBottom: '2px' }}
                            >
                              {m.name}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--txt3)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '11px' }}>
                        {isSuper ? (
                          <b style={{ color: 'var(--gold)' }}>★ Full access (* wildcards)</b>
                        ) : (
                          <span className="mono" style={{ color: 'var(--txt2)' }}>
                            {r.permissions.length} permissions granted
                          </span>
                        )}
                      </td>
                      <td>
                        {hasPermission('manage_team') && (
                          <button
                            className="btn btn-s btn-sm"
                            onClick={() => {
                              setEditingRole(r);
                              setIsRoleModalOpen(true);
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* TEAM MANAGEMENT TABLE */}
        <div className="card">
          <div className="card-h">
            <div>
              <div className="card-t">User Accounts &amp; Access</div>
              <div className="card-s">Manage user roles &amp; passwords</div>
            </div>
            {hasPermission('manage_team') && (
              <button
                className="btn btn-p btn-sm"
                onClick={() => {
                  setEditingMember(null);
                  setIsMemberModalOpen(true);
                }}
              >
                + Add User
              </button>
            )}
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th style={{ width: '60px' }}>Cap</th>
                  <th style={{ width: '110px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m: MemberItem) => {
                  const rDoc = roles.find((r: RoleData) => r.code === m.role);
                  return (
                    <tr key={m.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="tc-av" style={{ background: m.color }}>
                            {m.short}
                          </div>
                          <div>
                            <div className="strong" style={{ color: 'var(--txt)' }}>
                              {m.name}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--txt3)' }}>
                              {(m as any).email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="chip c-it">
                          {rDoc ? rDoc.name : m.role}
                        </span>
                      </td>
                      <td className="mono">{m.cap}h</td>
                      <td>
                        {hasPermission('manage_team') && (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              className="btn btn-s btn-sm"
                              onClick={() => {
                                setEditingMember(m);
                                setIsMemberModalOpen(true);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-s btn-sm"
                              title="Change Password"
                              onClick={() => {
                                setPasswordTargetUser(m);
                                setIsPasswordModalOpen(true);
                              }}
                            >
                              🔑
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BACKEND CONNECTION CARD */}
      <div className="card mb">
        <div className="card-h">
          <div>
            <div className="card-t">Backend System Status &amp; Data Backup</div>
            <div className="card-s">Connected to Node.js + Express + MongoDB Server</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '9px', flexWrap: 'wrap' }}>
          <button className="btn btn-s btn-sm" onClick={handleExportJSON}>
            ⇲ Export JSON Snapshot
          </button>
          <span className="pill">
            Mode: <b className="mono" style={{ color: 'var(--gold)' }}>MongoDB Live REST</b>
          </span>
          <span className="pill">Collections: 11</span>
        </div>
      </div>

      {/* NOTIFICATION RULES TABLE */}
      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">Notification Rules</div>
            <div className="card-s">What triggers an alert, and who receives it</div>
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Trigger</th>
                <th>Notifies</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {NOTIF_RULES.map((rule, idx) => (
                <tr key={idx}>
                  <td className="strong">{rule.trigger}</td>
                  <td>{rule.notifies}</td>
                  <td>
                    <span className={`chip ${rule.chipCls}`}>{rule.priority}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MEMBER MODAL */}
      {isMemberModalOpen && (
        <MemberFormModal
          isOpen={isMemberModalOpen}
          initialMember={editingMember}
          onClose={() => {
            setIsMemberModalOpen(false);
            setEditingMember(null);
          }}
          onSubmit={(data) => {
            if (editingMember) {
              updateMemberMutation.mutate({ id: editingMember.id || (editingMember as any)._id, ...data });
            } else {
              createMemberMutation.mutate(data);
            }
          }}
          onRemove={() => {
            if (editingMember && confirm(`Remove ${editingMember.name}?`)) {
              deleteMemberMutation.mutate(editingMember.id || (editingMember as any)._id);
            }
          }}
        />
      )}

      {/* PASSWORD MODAL */}
      {isPasswordModalOpen && passwordTargetUser && (
        <PasswordFormModal
          userName={passwordTargetUser.name}
          isOpen={isPasswordModalOpen}
          onClose={() => {
            setIsPasswordModalOpen(false);
            setPasswordTargetUser(null);
          }}
          onSubmit={(newPassword) => {
            changePasswordMutation.mutate({
              id: passwordTargetUser.id || (passwordTargetUser as any)._id,
              newPassword,
            });
          }}
        />
      )}

      {/* ROLE MODAL */}
      {isRoleModalOpen && (
        <RoleFormModal
          isOpen={isRoleModalOpen}
          initialRole={editingRole}
          onClose={() => {
            setIsRoleModalOpen(false);
            setEditingRole(null);
          }}
          onSubmit={(roleData) => {
            if (editingRole?._id) {
              updateRoleMutation.mutate({ id: editingRole._id, ...roleData });
            } else {
              createRoleMutation.mutate(roleData);
            }
          }}
          onDelete={() => {
            if (editingRole?._id && confirm(`Delete role ${editingRole.name}?`)) {
              deleteRoleMutation.mutate(editingRole._id);
            }
          }}
        />
      )}
    </div>
  );
}
