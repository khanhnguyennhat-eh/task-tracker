'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { Task, TaskStatus, StatusHistory, PRChecklistItem } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailsDialog({ 
  task, 
  open, 
  onOpenChange 
}: TaskDetailsDialogProps) {
  const router = useRouter();
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingChecklist, setIsUpdatingChecklist] = useState(false);

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

  // Get the next status in the sequence
  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    const statusOrder = Object.values(TaskStatus);
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1];
    }
    
    return null; // No next status if it's already at the end
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!task) return;
    
    const nextStatus = getNextStatus(task.status);
    if (!nextStatus) return;
    
    if (!statusNotes) {
      alert('Please provide notes for this status update.');
      return;
    }
    
    setIsUpdatingStatus(true);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: nextStatus,
          notes: statusNotes,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }
      
      // Reset form and refresh page
      setStatusNotes('');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. ' + error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle checklist item update
  const handleChecklistItemChange = async (itemId: string, checked: boolean) => {
    if (!task) return;
    
    setIsUpdatingChecklist(true);
    
    try {
      const response = await fetch(`/api/tasks/${task.id}/checklist/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checked }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update checklist item');
      }
      
      // Refresh page
      router.refresh();
    } catch (error) {
      console.error('Error updating checklist item:', error);
    } finally {
      setIsUpdatingChecklist(false);
    }
  };

  if (!task) return null;
  
  const nextStatus = getNextStatus(task.status);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start gap-4">
            <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            <Badge variant={getStatusVariant(task.status)} className="text-sm">
              {formatStatus(task.status)}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 my-4">
          {/* Task Description */}
          <div>
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <div className="bg-muted/40 rounded-md p-4 whitespace-pre-wrap text-sm">
              {task.description}
            </div>
          </div>
          
          {/* PR Checklist (only for in-review status) */}
          {task.status === TaskStatus.IN_REVIEW && (
            <div>
              <h3 className="text-lg font-medium mb-2">PR Checklist</h3>
              <div className="bg-muted/40 rounded-md p-4 space-y-2">
                {task.prChecklist.map((item: PRChecklistItem) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id={`checklist-${item.id}`}
                      checked={item.checked}
                      onChange={(e) => handleChecklistItemChange(item.id, e.target.checked)}
                      disabled={isUpdatingChecklist || task.status === TaskStatus.DONE}
                      className="mt-1"
                    />
                    <label htmlFor={`checklist-${item.id}`} className="text-sm">
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Status Update Form (if not done) */}
          {nextStatus && (
            <div>
              <h3 className="text-lg font-medium mb-2">Update Status</h3>
              <div className="bg-muted/40 rounded-md p-4 space-y-3">
                <div className="flex gap-2 items-center">
                  <span className="text-sm">Current status:</span>
                  <Badge variant={getStatusVariant(task.status)}>
                    {formatStatus(task.status)}
                  </Badge>
                </div>
                
                <div className="flex gap-2 items-center">
                  <span className="text-sm">Next status:</span>
                  <Badge variant={getStatusVariant(nextStatus)}>
                    {formatStatus(nextStatus)}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="status-notes" className="text-sm font-medium">
                    Notes (required)
                  </label>
                  <Textarea
                    id="status-notes"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder={`What did you do during the ${formatStatus(task.status)} phase?`}
                    rows={4}
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleStatusUpdate}
                  disabled={!statusNotes || isUpdatingStatus}
                >
                  {isUpdatingStatus
                    ? 'Updating...'
                    : `Update to ${formatStatus(nextStatus)}`}
                </Button>
              </div>
            </div>
          )}
          
          {/* Status History Timeline */}
          <div>
            <h3 className="text-lg font-medium mb-2">History</h3>
            <div className="space-y-3">
              {task.statusHistory.map((history: StatusHistory) => (
                <div 
                  key={history.id} 
                  className="relative pl-5 pb-3 border-l-2 border-muted last:border-transparent"
                >
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px]" />
                  <div className="flex justify-between items-start">
                    <Badge variant={getStatusVariant(history.status)}>
                      {formatStatus(history.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(history.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{history.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
            <span>Created {formatDistanceToNow(new Date(task.createdAt))} ago</span>
            <span>ID: {task.id}</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
