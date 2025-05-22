'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { Task, TaskStatus, StatusHistory, PRChecklistItem } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useTaskUpdates } from '@/lib/useTaskUpdates';

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailsDialog({ 
  task, 
  open,   onOpenChange 
}: TaskDetailsDialogProps) {
  const router = useRouter();
  const { refreshData } = useTaskUpdates();
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
  };  // Get the next status in the sequence
  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    // Determine the next status in sequence
    const statusOrder = Object.values(TaskStatus);
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1];
    }
    
    return null; // No next status if it's already at the end
  };  // Handle status update
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
      }      // Reset form and refresh page
      setStatusNotes('');
      onOpenChange(false);
      router.refresh();
      refreshData(); // Call our custom refresh function
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
        throw new Error(error.error || 'Failed to update checklist item');      }
      
      // Refresh page
      router.refresh();
      refreshData(); // Call our custom refresh function
    } catch (error) {
      console.error('Error updating checklist item:', error);
    } finally {
      setIsUpdatingChecklist(false);
    }
  };

  // Get the badge color for timeline dots
  const getBadgeColor = (status: TaskStatus): string => {
    // Return tailwind class names for background color
    switch (status) {
      case TaskStatus.INVESTIGATION:
        return 'bg-status-investigation';
      case TaskStatus.PLANNING:
        return 'bg-status-planning';
      case TaskStatus.IN_PROGRESS:
        return 'bg-status-in-progress';
      case TaskStatus.IN_TESTING:
        return 'bg-status-in-testing';
      case TaskStatus.IN_REVIEW:
        return 'bg-status-in-review';
      case TaskStatus.DONE:
        return 'bg-status-done';
      default:
        return 'bg-primary';
    }
  };

  if (!task) return null;
  
  const nextStatus = getNextStatus(task.status);  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-0">
        {/* Dialog Header with Task Title and Status Badge */}
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-background z-10 border-b">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold leading-tight">
                {task.title}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={getStatusVariant(task.status)} 
                className="text-sm shrink-0"
              >
                {formatStatus(task.status)}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full ml-1 hover:bg-muted" 
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
          <div className="flex flex-col space-y-2">            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Created {formatDistanceToNow(new Date(task.createdAt))} ago</span>
              <span className="font-mono">ID: {task.id}</span>
            </div>
          </div>
        </DialogHeader>
        
        {/* Main Content Area */}
        <div className="px-6 py-4 space-y-8">
          {/* Task Description */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Description</h3>
            <div className="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap text-sm">
              {task.description}
            </div>
          </div>
          
          {/* PR Checklist (only for in-review status) */}
          {task.status === TaskStatus.IN_REVIEW && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">PR Checklist</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                {task.prChecklist.map((item: PRChecklistItem) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`checklist-${item.id}`}
                      checked={item.checked}
                      onChange={(e) => handleChecklistItemChange(item.id, e.target.checked)}
                      disabled={isUpdatingChecklist || task.status === TaskStatus.DONE}
                      className="mt-1"
                    />
                    <label 
                      htmlFor={`checklist-${item.id}`} 
                      className="text-sm break-words flex-1 cursor-pointer"
                    >
                      {item.text}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Status Update Form (if not done) */}
          {nextStatus && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Update Status</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium block">Current status:</span>
                    <Badge variant={getStatusVariant(task.status)}>
                      {formatStatus(task.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium block">Next status:</span>
                    <Badge variant={getStatusVariant(nextStatus)}>
                      {formatStatus(nextStatus)}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 pt-2">
                  <label htmlFor="status-notes" className="text-sm font-medium block">
                    Notes (required)
                  </label>
                  <Textarea
                    id="status-notes"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder={`What did you do during the ${formatStatus(task.status)} phase?`}
                    rows={3}
                    className="resize-none w-full"
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
          <div className="space-y-3">
            <h3 className="text-base font-semibold">History</h3>
            <div className="pl-4 space-y-0">
              {task.statusHistory.map((history: StatusHistory, index: number) => (
                <div 
                  key={history.id} 
                  className={`relative pl-6 pt-2 pb-6 border-l-2 ${
                    index === task.statusHistory.length - 1 
                      ? 'border-transparent' 
                      : 'border-muted-foreground/20'
                  }`}
                >                  {/* Timeline dot */}
                  <div 
                    className={`absolute w-4 h-4 rounded-full -left-[9px] top-3 border-2 border-background ${getBadgeColor(history.status)}`}
                  />
                  
                  {/* Status header with badge and date */}
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                    <Badge 
                      variant={getStatusVariant(history.status)} 
                      className="px-2.5 py-1"
                    >
                      {formatStatus(history.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(history.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  
                  {/* Status notes */}
                  <div className="mt-2 text-sm whitespace-pre-wrap break-words bg-muted/20 p-3 rounded-md">
                    {history.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
