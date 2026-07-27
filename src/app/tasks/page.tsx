'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { TaskItem } from '@/components/dashboard/CommandCenterDashboard';

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data.data),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/users').then((res) => res.data.data),
  });

  const { data: deliverables = [] } = useQuery({
    queryKey: ['deliverables'],
    queryFn: () => api.get('/deliverables').then((res) => res.data.data),
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData: Partial<TaskItem>) => api.post('/tasks', taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...taskData }: Partial<TaskItem> & { id: string }) =>
      api.put(`/tasks/${id}`, taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setSelectedTaskId(null);
    },
  });

  const activeTask = tasks.find((t: TaskItem) => t.id === selectedTaskId || (t as any)._id === selectedTaskId);

  return (
    <div>
      <KanbanBoard
        tasks={tasks}
        members={members}
        onTaskClick={(id) => setSelectedTaskId(id)}
        onMoveTask={(id, status) => moveTaskMutation.mutate({ id, status })}
      />

      {selectedTaskId && (
        <TaskDetailModal
          task={activeTask || null}
          members={members}
          deliverables={deliverables}
          onClose={() => setSelectedTaskId(null)}
          onStatusChange={(status) => {
            if (activeTask) {
              moveTaskMutation.mutate({ id: activeTask.id || (activeTask as any)._id, status });
            }
          }}
          onEdit={() => {
            setEditingTask(activeTask);
            setIsFormOpen(true);
            setSelectedTaskId(null);
          }}
          onDelete={() => {
            if (activeTask && confirm(`Delete ${activeTask.code}?`)) {
              deleteTaskMutation.mutate(activeTask.id || (activeTask as any)._id);
            }
          }}
        />
      )}

      {isFormOpen && (
        <TaskFormModal
          isOpen={isFormOpen}
          initialTask={editingTask}
          members={members}
          deliverables={deliverables}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
          onSubmit={(taskData) => {
            if (editingTask) {
              updateTaskMutation.mutate({ id: editingTask.id || (editingTask as any)._id, ...taskData });
            } else {
              createTaskMutation.mutate(taskData);
            }
          }}
        />
      )}
    </div>
  );
}
