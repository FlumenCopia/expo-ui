'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface RoleData {
  _id?: string;
  name: string;
  code: string;
  description: string;
  permissions: string[];
  isSystemRole?: boolean;
}

interface RoleFormModalProps {
  initialRole?: RoleData | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roleData: RoleData) => void;
  onDelete?: () => void;
}

const SYSTEM_PAGE_ROWS = [
  { title: 'Command Center', icon: '☀️', key: 'dashboard' },
  { title: 'Task Board', icon: '📋', key: 'tasks' },
  { title: 'Timeline & Phases', icon: '⏱️', key: 'timeline' },
  { title: 'Contract Scope', icon: '📦', key: 'deliverables' },
  { title: 'Approvals Queue', icon: '✅', key: 'approvals' },
  { title: 'Team Capacity', icon: '👥', key: 'team' },
  { title: 'KPI Tracker', icon: '🎯', key: 'kpi' },
  { title: 'Ad Spend & Budget', icon: '💰', key: 'budget' },
  { title: 'Notifications', icon: '🔔', key: 'notifications' },
  { title: 'Settings & Access', icon: '⚙️', key: 'settings' },
  { title: 'Page Management', icon: '📄', key: 'admin' },
];

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  initialRole,
  isOpen,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => api.get('/permissions').then((res) => res.data.data),
    enabled: isOpen,
  });

  useEffect(() => {
    if (initialRole) {
      setName(initialRole.name);
      setCode(initialRole.code);
      setDescription(initialRole.description || '');
      setSelectedPerms(initialRole.permissions || []);
    } else {
      setName('');
      setCode('');
      setDescription('');
      setSelectedPerms([
        'page.dashboard.view',
        'page.tasks.view',
        'page.timeline.view',
        'page.deliverables.view',
      ]);
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const isWildcard = selectedPerms.includes('*');

  const togglePermission = (permCode: string) => {
    if (isWildcard) return;
    if (selectedPerms.includes(permCode)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== permCode));
    } else {
      setSelectedPerms([...selectedPerms, permCode]);
    }
  };

  const handleToggleColumn = (action: 'view' | 'create' | 'edit' | 'delete') => {
    const colCodes = SYSTEM_PAGE_ROWS.map((p) => `page.${p.key}.${action}`);
    const allChecked = colCodes.every((c) => selectedPerms.includes(c));

    if (allChecked) {
      setSelectedPerms(selectedPerms.filter((c) => !colCodes.includes(c)));
    } else {
      const merged = Array.from(new Set([...selectedPerms, ...colCodes]));
      setSelectedPerms(merged);
    }
  };

  const handleToggleRow = (pageKey: string) => {
    const rowCodes = ['view', 'create', 'edit', 'delete'].map((act) => `page.${pageKey}.${act}`);
    const allChecked = rowCodes.every((c) => selectedPerms.includes(c));

    if (allChecked) {
      setSelectedPerms(selectedPerms.filter((c) => !rowCodes.includes(c)));
    } else {
      const merged = Array.from(new Set([...selectedPerms, ...rowCodes]));
      setSelectedPerms(merged);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Role name is required');
      return;
    }

    onSubmit({
      _id: initialRole?._id,
      name,
      code: code || name.toLowerCase().replace(/\s+/g, '_'),
      description,
      permissions: selectedPerms,
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
      <div className="modal wide" style={{ maxWidth: '840px' }}>
        <div className="m-h">
          <div className="m-t">
            {initialRole ? `Edit Role Permissions — ${initialRole.name}` : 'Create New Page-Wise Dynamic Role'}
          </div>
          <button className="m-x" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="m-b">
            <div className="frow">
              <div className="fg">
                <label className="fl">Role Name</label>
                <input
                  className="fi"
                  placeholder="e.g. Content Creator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={initialRole?.code === 'super_admin'}
                  required
                />
              </div>

              <div className="fg">
                <label className="fl">Role Code (Unique Identifier)</label>
                <input
                  className="fi"
                  placeholder="content_creator"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={!!initialRole}
                />
              </div>
            </div>

            <div className="fg">
              <label className="fl">Description</label>
              <input
                className="fi"
                placeholder="Responsibilities and access scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="divider" style={{ margin: '14px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div className="fl" style={{ margin: 0 }}>
                Granted Page Permissions Matrix ({isWildcard ? 'Full Wildcard *' : `${selectedPerms.length} selected`})
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-s btn-sm"
                  onClick={() =>
                    setSelectedPerms(
                      isWildcard
                        ? ['page.dashboard.view']
                        : ['*']
                    )
                  }
                >
                  {isWildcard ? 'Disable Wildcard (*)' : '★ Enable Super Admin Wildcard (*)'}
                </button>
              </div>
            </div>

            {isWildcard ? (
              <div className="alert ok" style={{ marginBottom: 0 }}>
                <span>★</span>
                <div>
                  <b>Super Admin Wildcard (*) Enabled.</b> This role bypasses all route and action checks and has complete unrestricted view/edit/delete access across all pages.
                </div>
              </div>
            ) : (
              /* PAGE / FEATURE PERMISSIONS MATRIX TABLE */
              <div className="tbl-wrap" style={{ border: '1px solid var(--border2)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
                <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: 'var(--panel2)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', minWidth: '220px' }}>
                        ➔ Page / Feature
                      </th>

                      <th style={{ padding: '10px' }}>
                        <div>View (Read)</div>
                        <button
                          type="button"
                          style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: 600, marginTop: '2px' }}
                          onClick={() => handleToggleColumn('view')}
                        >
                          Toggle All
                        </button>
                      </th>

                      <th style={{ padding: '10px' }}>
                        <div>Create</div>
                        <button
                          type="button"
                          style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: 600, marginTop: '2px' }}
                          onClick={() => handleToggleColumn('create')}
                        >
                          Toggle All
                        </button>
                      </th>

                      <th style={{ padding: '10px' }}>
                        <div>Edit (Update)</div>
                        <button
                          type="button"
                          style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: 600, marginTop: '2px' }}
                          onClick={() => handleToggleColumn('edit')}
                        >
                          Toggle All
                        </button>
                      </th>

                      <th style={{ padding: '10px' }}>
                        <div>Delete</div>
                        <button
                          type="button"
                          style={{ fontSize: '9px', color: 'var(--gold)', fontWeight: 600, marginTop: '2px' }}
                          onClick={() => handleToggleColumn('delete')}
                        >
                          Toggle All
                        </button>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {SYSTEM_PAGE_ROWS.map((page) => {
                      const actions: Array<'view' | 'create' | 'edit' | 'delete'> = ['view', 'create', 'edit', 'delete'];

                      return (
                        <tr key={page.key} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '16px' }}>{page.icon}</span>
                                <div>
                                  <div>{page.title}</div>
                                  <div className="mono" style={{ fontSize: '9.5px', color: 'var(--txt3)' }}>
                                    /{page.key === 'dashboard' ? 'dashboard' : page.key}
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                style={{ fontSize: '9px', color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                onClick={() => handleToggleRow(page.key)}
                              >
                                Row
                              </button>
                            </div>
                          </td>

                          {actions.map((act) => {
                            const code = `page.${page.key}.${act}`;
                            const isChecked = selectedPerms.includes(code);

                            return (
                              <td
                                key={act}
                                style={{ padding: '10px', cursor: 'pointer', userSelect: 'none' }}
                                onClick={() => togglePermission(code)}
                              >
                                <div
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    margin: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                    fontWeight: 800,
                                    background: isChecked ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.12)',
                                    color: isChecked ? 'var(--green)' : 'var(--red)',
                                    border: `1.5px solid ${isChecked ? 'var(--green)' : 'rgba(239, 68, 68, 0.3)'}`,
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  {isChecked ? '✓' : '✕'}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="m-f">
            {initialRole && !initialRole.isSystemRole && onDelete && (
              <button type="button" className="btn btn-d" onClick={onDelete}>
                Delete Role
              </button>
            )}
            <button type="button" className="btn btn-s" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-p">
              Save Role Permissions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
