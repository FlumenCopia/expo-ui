'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useGlobalModalStore } from '../../store/useGlobalModalStore';
import { TaskFormModal } from '../tasks/TaskFormModal';
import { api } from '../../lib/api';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isTaskModalOpen, closeTaskModal } = useGlobalModalStore();

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/users').then((res) => res.data.data),
    enabled: isTaskModalOpen,
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => api.get('/deliverables').then((res) => res.data.data),
    enabled: isTaskModalOpen,
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => api.post('/tasks', taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      alert('Task created successfully!');
    },
  });

  // If on Login page, render clean container without App Sidebar & Topbar
  if (pathname === '/login') {
    return <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>{children}</main>;
  }

  return (
    <div className="app">
      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          className="sb-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="content">{children}</div>
      </div>

      {/* GLOBAL + NEW TASK MODAL */}
      {isTaskModalOpen && (
        <TaskFormModal
          isOpen={isTaskModalOpen}
          members={members}
          deliverables={deliverables}
          onClose={closeTaskModal}
          onSubmit={(taskData) => {
            createTaskMutation.mutate(taskData);
          }}
        />
      )}
    </div>
  );
};
