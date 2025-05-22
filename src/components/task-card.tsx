'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Task, TaskStatus } from '@/lib/types';
import { formatStatus, getStatusVariant } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isKanban?: boolean;
  isDraggable?: boolean;
}

export default function TaskCard({ task, onClick, isKanban = false, isDraggable = false }: TaskCardProps) {
  // Track mouse position for distinguishing clicks from drags
  const [mouseDownPos, setMouseDownPos] = React.useState<{ x: number, y: number } | null>(null);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggable) {
      setMouseDownPos({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggable && mouseDownPos) {
      // Only trigger click if mouse didn't move much (not a drag attempt)
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);
      
      if (dx < 5 && dy < 5) {
        onClick();
      }
      
      setMouseDownPos(null);
    } else {
      onClick();
    }  };

  // Get the latest history entry if available
  const latestHistory = task.statusHistory && task.statusHistory.length > 0
    ? task.statusHistory[0]
    : null;  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200
        ${isKanban 
          ? 'hover:shadow-md hover:-translate-y-1 h-auto shadow-sm'
          : 'hover:shadow-md hover:-translate-y-1 h-full'
        }
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={isDraggable ? undefined : onClick}
    ><CardHeader className={`${isKanban ? 'p-3 pb-1' : 'pb-2'}`}>
        <div className="flex justify-between items-start">
          <CardTitle className={`${isKanban ? 'text-base leading-tight' : 'text-xl'}`}>{task.title}</CardTitle>
          {!isKanban && (            <Badge variant={getStatusVariant(task.status) as "investigation" | "planning" | "in-progress" | "in-testing" | "in-review" | "done" | "default"}>
              {formatStatus(task.status)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className={isKanban ? 'p-3 pt-0' : ''}>
        <p className={`text-sm text-muted-foreground ${isKanban ? 'line-clamp-2 mb-2' : 'line-clamp-3 mb-4'}`}>
          {task.description}
        </p>
        {latestHistory && latestHistory.notes !== 'Task created' && isKanban && (
          <div className="bg-muted/50 p-2 rounded text-xs">
            <p className="line-clamp-1">{latestHistory.notes}</p>
          </div>
        )}
        {latestHistory && latestHistory.notes !== 'Task created' && !isKanban && (
          <div className="bg-muted/50 p-2 rounded text-xs">
            <p className="font-medium">Latest update:</p>
            <p className="line-clamp-2">{latestHistory.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className={`text-xs text-muted-foreground ${isKanban ? 'p-3 pt-0' : ''}`}>
        <div className="flex justify-between w-full">
          <span>{formatDistanceToNow(new Date(task.createdAt))} ago</span>
          <span>ID: {task.id.slice(0, 8)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
