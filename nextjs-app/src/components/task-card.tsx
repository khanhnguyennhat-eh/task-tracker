'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Task, TaskStatus } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  // Format the status for display
  const formatStatus = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.INVESTIGATION:
        return 'Investigation';
      case TaskStatus.PLANNING:
        return 'Planning';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.IN_TESTING:
        return 'In Testing';
      case TaskStatus.IN_REVIEW:
        return 'In Review';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return status;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.INVESTIGATION:
        return 'investigation';
      case TaskStatus.PLANNING:
        return 'planning';
      case TaskStatus.IN_PROGRESS:
        return 'in-progress';
      case TaskStatus.IN_TESTING:
        return 'in-testing';
      case TaskStatus.IN_REVIEW:
        return 'in-review';
      case TaskStatus.DONE:
        return 'done';
      default:
        return 'default';
    }
  };

  // Get the latest history entry if available
  const latestHistory = task.statusHistory && task.statusHistory.length > 0
    ? task.statusHistory[0]
    : null;

  return (
    <Card 
      className="h-full cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{task.title}</CardTitle>
          <Badge variant={getStatusVariant(task.status)}>
            {formatStatus(task.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {task.description}
        </p>
        {latestHistory && latestHistory.notes !== 'Task created' && (
          <div className="bg-muted/50 p-2 rounded text-xs">
            <p className="font-medium">Latest update:</p>
            <p className="line-clamp-2">{latestHistory.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <span>Created {formatDistanceToNow(new Date(task.createdAt))} ago</span>
          <span>ID: {task.id.slice(0, 8)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
