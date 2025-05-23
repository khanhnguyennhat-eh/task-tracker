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
      
      // Call the API to update the status in the background
      // We use catch to handle any errors but we don't await the initial call
      // This prevents the UI from "waiting" for the server response
      fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-drag-operation': 'true'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Task moved to ${formatStatus(newStatus)} via drag and drop`,
        }),
      })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update task status');
        }
        
        // Show success toast only after the API confirms the change
        toast({
          title: "Task moved",
          description: `"${task.title}" moved to ${formatStatus(newStatus)}`,
          variant: "success",
        });
        
        return true;
      })
      .catch((error) => {
        console.error('Error updating task status:', error);
        
        // Show error toast
        toast({
          title: "Error moving task",
          description: error.message || "Failed to update task status",
          variant: "destructive",
        });
        
        // Revert optimistic update only if the API call fails
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? task : t)
        );
      });
      
      // Return true immediately for the UI update
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
