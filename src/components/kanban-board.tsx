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

interface KanbanBoardProps {
  initialTasks: Task[];
}

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Group tasks by status
  const tasksByStatus = Object.values(TaskStatus).reduce((acc, status) => {
    acc[status] = filteredTasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  // Update tasks when initialTasks change (from server)
  useEffect(() => {
    setTasks(initialTasks);
    // Re-apply any active filters
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
  };  // Handle drag end event
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // If dropped outside a droppable area
    if (!destination) return;

    // If dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the task being dragged
    const taskId = draggableId;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Get the new status from destination droppable ID
    const newStatus = destination.droppableId as TaskStatus;

    // If status is changing, update the task status directly
    if (newStatus !== task.status) {
      // Update the displayed tasks optimistically
      setFilteredTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id 
            ? {...t, status: newStatus} 
            : t
        )
      );
      
      // Update tasks state
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === task.id 
            ? {...t, status: newStatus} 
            : t
        )
      );
      
      // Call API to update the task status
      try {
        const response = await fetch(`/api/tasks/${task.id}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-drag-operation': 'true',
          },
          body: JSON.stringify({
            status: newStatus,
            notes: `Task moved to ${formatStatus(newStatus)} via drag and drop`,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update task status');
        }
        
        // Refresh data from server
        router.refresh();
      } catch (error) {
        console.error('Error updating task status:', error);
        // Revert optimistic update if there was an error
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

  // Format status for display
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

  // Get status column color
  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case TaskStatus.INVESTIGATION:
        return 'border-status-investigation/30 bg-status-investigation/10';
      case TaskStatus.PLANNING:
        return 'border-status-planning/30 bg-status-planning/10';
      case TaskStatus.IN_PROGRESS:
        return 'border-status-in-progress/30 bg-status-in-progress/10';
      case TaskStatus.IN_TESTING:
        return 'border-status-in-testing/30 bg-status-in-testing/10';
      case TaskStatus.IN_REVIEW:
        return 'border-status-in-review/30 bg-status-in-review/10';
      case TaskStatus.DONE:
        return 'border-status-done/30 bg-status-done/10';
      default:
        return 'border-muted bg-background';
    }
  };

  return (
    <div className="space-y-8">      {/* Header */}
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
      </div>      {/* Kanban Board */}
      {filteredTasks.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>          <div className="flex gap-4 overflow-x-auto pb-6 px-1 snap-x h-[calc(100vh-280px)] max-h-[750px]">
            {Object.values(TaskStatus).map((status) => (
              <div 
                key={status} 
                className={`flex flex-col h-full w-[280px] min-w-[280px] border rounded-lg overflow-hidden shadow-sm ${getStatusColor(status)}`}
              ><div className="p-3 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
                  <h3 className="font-semibold text-center">{formatStatus(status)}</h3>
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    {tasksByStatus[status]?.length || 0} {tasksByStatus[status]?.length === 1 ? "Task" : "Tasks"}
                  </div>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided) => (                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 p-3 space-y-4 overflow-y-auto"
                    >
                      {tasksByStatus[status]?.map((task, index) => (
                        <Draggable 
                          key={task.id} 
                          draggableId={task.id} 
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                            >                              <TaskCard
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
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="flex flex-col items-center justify-center bg-muted/40 rounded-lg p-12 text-center">
          <div className="rounded-full bg-background p-3 mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            {tasks.length === 0
              ? "You haven't created any tasks yet."
              : "No tasks match your current filters."}
          </p>
          {tasks.length === 0 ? (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create your first task
            </Button>
          ) : (
            <Button variant="outline" onClick={resetFilters}>
              Reset filters
            </Button>
          )}
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
