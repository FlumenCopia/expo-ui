'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { TimelineView } from '@/components/timeline/TimelineView';

export default function TimelinePage() {
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res) => res.data.data),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get('/users').then((res) => res.data.data),
  });

  const moveTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/tasks/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleToggle = (taskId: string, currentStatus: string) => {
    const isDone = ['published', 'approved'].includes(currentStatus);
    const newStatus = isDone ? 'progress' : 'published';
    moveTaskMutation.mutate({ id: taskId, status: newStatus });
  };

  return (
    <TimelineView
      tasks={tasks}
      members={members}
      onTaskToggle={handleToggle}
    />
  );
}
