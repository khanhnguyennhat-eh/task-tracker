'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/lib/types';
import TaskCard from '@/components/task-card';
import CreateTaskDialog from '@/components/create-task-dialog';
import TaskDetailsDialog from '@/components/task-details-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/use-toast';
import { useTaskFilterParams } from '@/lib/use-task-filter-params';
import { formatStatus, getStatusColor } from '@/lib/utils';

interface KanbanBoardProps {
  initialTasks: Task[];
}

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { updateUrlParams, getFiltersFromUrl } = useTaskFilterParams();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Initialize from URL parameters or defaults
  const { query: initialQuery, status: initialStatus } = getFiltersFromUrl();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>(initialStatus);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Group tasks by status
  const tasksByStatus = Object.values(TaskStatus).reduce((acc, status) => {
    acc[status] = filteredTasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);
  
  // Update tasks when initialTasks change (from server) or apply initial filters from URL parameters
  useEffect(() => {
    setTasks(initialTasks);
    // Apply any active filters (from URL or state)
    applyFilters(searchQuery, statusFilter, initialTasks);
  }, [initialTasks]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [router]);

  // Handle search and filtering
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchQuery, statusFilter);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value as TaskStatus | 'ALL';
    setStatusFilter(newFilter);
    applyFilters(searchQuery, newFilter);
  };

  // Apply filters and update URL parameters
  const applyFilters = (query: string, status: TaskStatus | 'ALL', taskList = tasks) => {
    let filtered = taskList;

    // Apply status filter
    if (status !== 'ALL') {
      filtered = filtered.filter(task => task.status === status);
    }

    // Apply search query
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        task.description.toLowerCase().includes(searchLower) ||
        task.statusHistory.some(history => 
          history.notes.toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredTasks(filtered);
    
    // Update URL parameters
    updateUrlParams(query, status);
  };

  // Handle task selection for viewing details
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setFilteredTasks(tasks);
    updateUrlParams('', 'ALL');
  };

  // Handle drag and drop between columns
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    
    // Return if dropped outside of a droppable area
    if (!destination) return;
    
    // Return if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Find the task that was moved
    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;
    
    // Check if task status needs updating (dropped in a different column)
    if (destination.droppableId !== source.droppableId) {
      const newStatus = destination.droppableId as TaskStatus;
      
      // Don't update if the statuses are the same
      if (task.status === newStatus) return;
      
      try {
        // Optimistically update UI
        const updatedTasks = tasks.map(t => 
          t.id === task.id 
            ? {...t, status: newStatus} 
            : t
        );
        setTasks(updatedTasks);
          // Update the task status on the server
        const response = await fetch(`/api/tasks/${task.id}/status`, {
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
          throw new Error('Failed to update task status');
        }
        
        // Show success toast
        toast({
          title: "Task moved",
          description: `"${task.title}" moved to ${formatStatus(newStatus)}`,
          variant: "success",
        });
        
        // Refresh data from server
        router.refresh();
      } catch (error) {
        console.error('Error updating task status:', error);
        
        // Revert optimistic update
        setFilteredTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id 
              ? {...t, status: task.status} 
              : t
          )
        );
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id 
              ? {...t, status: task.status} 
              : t
          )
        );
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground mt-2">
            Organize and track tasks through your development workflow.
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid gap-4 md:grid-cols-8">
        <form 
          onSubmit={handleSearch}
          className="relative md:col-span-5"
        >
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <div className="md:col-span-2">
          <select 
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="ALL">All Statuses</option>
            {Object.values(TaskStatus).map(status => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </div>
        
        <Button 
          variant="outline" 
          onClick={resetFilters}
          className="md:col-span-1"
        >
          Reset
        </Button>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 pb-8 overflow-x-auto snap-x">
          {Object.values(TaskStatus).map(status => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col h-full w-[280px] min-w-[280px] border rounded-lg overflow-hidden shadow-sm ${getStatusColor(status)}`}
                >
                  <div className="p-3 border-b bg-card">
                    <h3 className="font-semibold text-center">{formatStatus(status)}</h3>
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      {tasksByStatus[status].length} tasks
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[200px]">
                    {tasksByStatus[status].map((task, index) => (
                      <Draggable 
                        key={task.id} 
                        draggableId={task.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <TaskCard 
                              task={task} 
                              onClick={() => handleTaskClick(task)}
                              isKanban={true}
                              isDraggable={true}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {tasksByStatus[status].length === 0 && (
                      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                        No tasks in this status
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Empty State */}
      {filteredTasks.length === 0 && statusFilter === 'ALL' && searchQuery === '' && (
        <div className="flex flex-col items-center justify-center bg-muted/40 rounded-lg p-12 text-center">
          <div className="rounded-full bg-background p-3 mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No tasks yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Get started by creating your first task
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create your first task
          </Button>
        </div>
      )}
      
      {/* Task Creation Dialog */}
      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      {/* Task Details Dialog */}
      <TaskDetailsDialog
        task={selectedTask}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </div>
  );
}
