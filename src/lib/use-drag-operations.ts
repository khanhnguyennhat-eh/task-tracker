// File: src/lib/use-drag-operations.ts
import { useEffect, useState } from 'react';
import { Task, TaskStatus } from './types';
import { useToast } from './use-toast';
import { formatStatus } from './utils';

export function useDragOperations(initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const { toast } = useToast();
  
  // Update tasks when initialTasks change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);
    // Handle task movement between columns
  const moveTask = async (taskId: string, newStatus: TaskStatus): Promise<boolean> => {
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    // Don't update if already at target status
    if (task.status === newStatus) return false;
    
    try {
      // Optimistically update the task
      const updatedTask = { ...task, status: newStatus };
      
      // Update tasks state first for immediate UI update
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? updatedTask : t)
      );
      
      // Call the API to update the status
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-drag-operation': 'true'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Task moved to ${formatStatus(newStatus)} via drag and drop`,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update task status');
      }
      
      // Get updated task from the server
      const updatedData = await response.json();
      
      // Update with the server data without visual disruption
      // We don't revert the UI since we've already shown the update
      
      // Show success toast
      toast({
        title: "Task moved",
        description: `"${task.title}" moved to ${formatStatus(newStatus)}`,
        variant: "success",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating task status:', error);
      
      // Show error toast
      toast({
        title: "Error moving task",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      });
      
      // Revert optimistic update
      setTasks(prevTasks => 
        prevTasks.map(t => t.id === taskId ? task : t)
      );
      
      return false;
    }
  };
  
  return { tasks, setTasks, moveTask };
}
