'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MemberFormModal } from '@/components/team/MemberFormModal';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Change Password Modal State
  const [pwdModalUser, setPwdModalUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/users').then((res) => res.data.data),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles').then((res) => res.data.data),
  });

  const rolesMap: Record<string, string> = useMemo(() => {
    return roles.reduce((acc: any, r: any) => {
      acc[r.code] = r.name;
      return acc;
    }, {});
  }, [roles]);

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => api.post('/users', userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsFormOpen(false);
      alert('User created successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to create user');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...userData }: any) => api.put(`/users/${id}`, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setIsFormOpen(false);
      setEditingUser(null);
      alert('User updated successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update user');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      api.put(`/users/${id}/password`, { password }),
    onSuccess: () => {
      setPwdModalUser(null);
      setNewPassword('');
      alert('Password updated successfully!');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update password');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      alert('User deleted successfully');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete user');
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        const matchFn = (u.fn || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchFn) return false;
      }
      if (selectedRoleFilter !== 'all' && u.role !== selectedRoleFilter) {
        return false;
      }
      return true;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  return (
    <div>
      {/* HEADER BAR */}
      <div className="card-h mb" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>User Accounts & Access</div>
          <div className="card-s">Manage user profiles, assign system roles, and update credentials</div>
        </div>
        <button
          className="btn btn-p"
          onClick={() => {
            setEditingUser(null);
            setIsFormOpen(true);
          }}
        >
          + Add User Account
        </button>
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="filters">
        <input
          className="srch"
          placeholder="Search by name, email, or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="srch"
          style={{ width: 'auto', minWidth: '150px' }}
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
        >
          <option value="all">All System Roles</option>
          {roles.map((r: any) => (
            <option key={r._id} value={r.code}>
              {r.name} ({r.code})
            </option>
          ))}
        </select>
      </div>

      {/* USER ACCOUNTS TABLE */}
      <div className="card">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Member</th>
                <th>Work Email</th>
                <th>Designation</th>
                <th>Assigned Role</th>
                <th>Team Unit</th>
                <th>Capacity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u: any) => {
                const uId = u._id || u.id;
                return (
                  <tr key={uId}>
                    <td className="strong">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div
                          className="tc-av"
                          style={{
                            background: u.color || '#3B82F6',
                            width: '28px',
                            height: '28px',
                            fontSize: '11px',
                          }}
                        >
                          {u.short}
                        </div>
                        <div>
                          <div>{u.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: '12px' }}>
                      {u.email}
                    </td>
                    <td>{u.fn || 'Team Member'}</td>
                    <td>
                      <span
                        className="chip"
                        style={{
                          background: 'rgba(245,166,35,0.12)',
                          color: 'var(--gold)',
                          fontWeight: 700,
                        }}
                      >
                        {rolesMap[u.role] || u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className="chip"
                        style={{
                          background: 'rgba(148,163,184,0.14)',
                          color: 'var(--txt2)',
                        }}
                      >
                        {(u.team || 'core').toUpperCase()}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: '12px' }}>
                      {u.cap || 20}h/wk
                    </td>
                    <td>
                      <span
                        className="chip"
                        style={{
                          background: u.isActive !== false ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)',
                          color: u.isActive !== false ? 'var(--green)' : 'var(--red)',
                        }}
                      >
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-s btn-sm"
                          onClick={() => {
                            setEditingUser(u);
                            setIsFormOpen(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-s btn-sm"
                          style={{ color: 'var(--gold)' }}
                          onClick={() => setPwdModalUser(u)}
                        >
                          Password
                        </button>
                        <button
                          className="btn btn-d btn-sm"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                              deleteUserMutation.mutate(uId);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--txt3)' }}>
                    No user accounts found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MEMBER FORM MODAL */}
      {isFormOpen && (
        <MemberFormModal
          isOpen={isFormOpen}
          initialMember={editingUser}
          onClose={() => {
            setIsFormOpen(false);
            setEditingUser(null);
          }}
          onSubmit={(data) => {
            if (editingUser) {
              updateUserMutation.mutate({ id: editingUser._id || editingUser.id, ...data });
            } else {
              createUserMutation.mutate(data);
            }
          }}
          onRemove={() => {
            if (editingUser && confirm(`Delete ${editingUser.name}?`)) {
              deleteUserMutation.mutate(editingUser._id || editingUser.id);
              setIsFormOpen(false);
              setEditingUser(null);
            }
          }}
        />
      )}

      {/* CHANGE PASSWORD MODAL */}
      {pwdModalUser && (
        <div
          className="ovl show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPwdModalUser(null);
          }}
        >
          <div className="modal" style={{ maxWidth: '420px' }}>
            <div className="m-h">
              <div className="m-t">Change Password: {pwdModalUser.name}</div>
              <button className="m-x" onClick={() => setPwdModalUser(null)}>
                &times;
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newPassword || newPassword.length < 6) {
                  alert('Password must be at least 6 characters');
                  return;
                }
                changePasswordMutation.mutate({
                  id: pwdModalUser._id || pwdModalUser.id,
                  password: newPassword,
                });
              }}
            >
              <div className="m-b">
                <div className="fg">
                  <label className="fl">New Password</label>
                  <input
                    className="fi"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="m-f">
                <button type="button" className="btn btn-s" onClick={() => setPwdModalUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-p">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
