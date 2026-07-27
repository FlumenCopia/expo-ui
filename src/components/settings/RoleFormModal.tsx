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

interface PermissionItem {
  _id: string;
  name: string;
  code: string;
  module: string;
  description: string;
}

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
      setSelectedPerms(['view_all']);
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (permCode: string) => {
    if (selectedPerms.includes('*')) return;
    if (selectedPerms.includes(permCode)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== permCode));
    } else {
      setSelectedPerms([...selectedPerms, permCode]);
    }
  };

  const handleToggleModule = (modulePerms: PermissionItem[]) => {
    const codes = modulePerms.map((p) => p.code);
    const allSelected = codes.every((c) => selectedPerms.includes(c));

    if (allSelected) {
      setSelectedPerms(selectedPerms.filter((c) => !codes.includes(c)));
    } else {
      const merged = Array.from(new Set([...selectedPerms, ...codes]));
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

  // Group permissions by module
  const groupedPerms: Record<string, PermissionItem[]> = allPermissions.reduce(
    (acc: any, perm: PermissionItem) => {
      acc[perm.module] = acc[perm.module] || [];
      acc[perm.module].push(perm);
      return acc;
    },
    {}
  );

  const isWildcard = selectedPerms.includes('*');

  return (
    <div
      className="ovl show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal wide">
        <div className="m-h">
          <div className="m-t">
            {initialRole ? `Edit Role — ${initialRole.name}` : 'Create New Dynamic Role'}
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
                  placeholder="e.g. Lead Designer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={initialRole?.code === 'super_admin'}
                />
              </div>

              <div className="fg">
                <label className="fl">Role Code (Unique)</label>
                <input
                  className="fi"
                  placeholder="lead_designer"
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
                placeholder="What this role does..."
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
                Granted Permissions Matrix ({isWildcard ? 'Full Wildcard *' : `${selectedPerms.length} selected`})
              </div>
              {!isWildcard && (
                <button
                  type="button"
                  className="btn btn-s btn-sm"
                  onClick={() => setSelectedPerms(allPermissions.map((p: any) => p.code))}
                >
                  Select All System Permissions
                </button>
              )}
            </div>

            {isWildcard ? (
              <div className="alert ok">
                <span>★</span>
                <div>
                  <b>Super Admin Wildcard (*) Enabled.</b> This role bypasses permission checks and has full unrestricted access across all endpoints and UI actions.
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {Object.entries(groupedPerms).map(([modName, perms]) => {
                  const codes = perms.map((p) => p.code);
                  const allSelected = codes.every((c) => selectedPerms.includes(c));

                  return (
                    <div
                      key={modName}
                      style={{
                        background: 'var(--panel2)',
                        border: '1px solid var(--border2)',
                        borderRadius: 'var(--rs)',
                        padding: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                          paddingBottom: '6px',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <span className="chip c-it">{modName}</span>
                        <button
                          type="button"
                          style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: 600 }}
                          onClick={() => handleToggleModule(perms)}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {perms.map((p) => {
                          const isChecked = selectedPerms.includes(p.code);
                          return (
                            <label
                              key={p._id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                color: isChecked ? 'var(--txt)' : 'var(--txt3)',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(p.code)}
                              />
                              <div>
                                <span style={{ fontWeight: isChecked ? 600 : 400 }}>{p.name}</span>
                                <span className="mono" style={{ fontSize: '9px', marginLeft: '5px', color: 'var(--txt3)' }}>
                                  ({p.code})
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
