'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface PageItem {
  _id: string;
  title: string;
  route: string;
  module: string;
  icon?: string;
  displayOrder: number;
  isHidden: boolean;
  isPublic: boolean;
}

export default function PageManagementPage() {
  const queryClient = useQueryClient();

  const { data: pages = [] } = useQuery({
    queryKey: ['pages'],
    queryFn: () => api.get('/pages').then((res) => res.data.data),
  });

  const syncRoutesMutation = useMutation({
    mutationFn: () => api.post('/pages/sync-routes', {}),
    onSuccess: (res) => {
      alert(res.data.message || 'Routes synchronized successfully');
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });

  const deletePageMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/pages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });

  return (
    <div>
      <div className="alert info">
        <span>📄</span>
        <div>
          <b>Dynamic Page &amp; Route Management.</b> Super Admin can configure dynamic pages, assign layout templates, group modules, and set permissions. Click <b>"Sync Website Routes"</b> to automatically scan newly declared Next.js pages into MongoDB.
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <div>
            <div className="card-t">System Pages &amp; Frontend Routes</div>
            <div className="card-s">Everything registered in MongoDB RBAC Matrix</div>
          </div>
          <button
            className="btn btn-p btn-sm"
            onClick={() => syncRoutesMutation.mutate()}
          >
            ↻ Sync Website Routes
          </button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Icon</th>
                <th>Page Title</th>
                <th>Route Path</th>
                <th>Module</th>
                <th style={{ width: '60px' }}>Order</th>
                <th style={{ width: '90px' }}>Visibility</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p: PageItem) => (
                <tr key={p._id}>
                  <td style={{ fontSize: '16px' }}>{p.icon || '📄'}</td>
                  <td className="strong">{p.title}</td>
                  <td className="mono">{p.route}</td>
                  <td>
                    <span className="chip c-it">{p.module}</span>
                  </td>
                  <td className="mono">{p.displayOrder}</td>
                  <td>
                    {p.isHidden ? (
                      <span className="chip p-p0">Hidden</span>
                    ) : p.isPublic ? (
                      <span className="chip c-design">Public</span>
                    ) : (
                      <span className="chip c-it">Active</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-d btn-sm"
                      onClick={() => {
                        if (confirm(`Delete page ${p.title}?`)) {
                          deletePageMutation.mutate(p._id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
