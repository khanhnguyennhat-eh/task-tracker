'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '@/lib/types';
import TaskCard from '@/components/task-card';
import CreateTaskDialog from '@/components/create-task-dialog';
import TaskDetailsDialog from '@/components/task-details-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, X, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/use-toast';
import { useTaskFilterParams } from '@/lib/use-task-filter-params';
import { formatStatus, getStatusColor } from '@/lib/utils';
import { useDragOperations } from '@/lib/use-drag-operations';

interface KanbanBoardProps {
  initialTasks: Task[];
}

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { updateUrlParams, getFiltersFromUrl } = useTaskFilterParams();
  const { tasks, setTasks, moveTask } = useDragOperations(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Initialize from URL parameters or defaults
  const { query: initialQuery, status: initialStatus } = getFiltersFromUrl();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>(initialStatus);
  const [showFilters, setShowFilters] = useState(false);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  // Group tasks by status - but only display the main workflow statuses
  const displayStatuses = [
    TaskStatus.IN_PROGRESS, 
    TaskStatus.IN_TESTING,
    TaskStatus.IN_REVIEW, 
    TaskStatus.DONE
  ];
  
  const tasksByStatus = displayStatuses.reduce((acc, status) => {
    acc[status] = filteredTasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);
  
  // Put planning and investigation tasks into the "In Progress" column
  tasksByStatus[TaskStatus.IN_PROGRESS] = [
    ...tasksByStatus[TaskStatus.IN_PROGRESS],
    ...filteredTasks.filter(t => t.status === TaskStatus.PLANNING || t.status === TaskStatus.INVESTIGATION)
  ];
    // Update filteredTasks when tasks change (from server) or apply initial filters from URL parameters
  useEffect(() => {
    // Apply any active filters (from URL or state)
    applyFilters(searchQuery, statusFilter, tasks);
  }, [tasks]);
  // Refresh data periodically but not immediately after drag operations
  useEffect(() => {
    let refreshPaused = false;
    let refreshTimeout: NodeJS.Timeout | null = null;

    const scheduleRefresh = () => {
      if (!refreshPaused) {
        refreshTimeout = setTimeout(() => {
          router.refresh();
          scheduleRefresh();
        }, 30000); // Refresh every 30 seconds instead of 5 seconds
      }
    };

    // Start the refresh cycle
    scheduleRefresh();

    // Pause refreshes when dragging starts
    const handleDragStart = () => {
      refreshPaused = true;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };

    // Resume refreshes 10 seconds after a drag operation completes
    const handleDragComplete = () => {
      setTimeout(() => {
        refreshPaused = false;
        scheduleRefresh();
      }, 10000);
    };

    // Add event listeners for drag operations
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragComplete);

    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragComplete);
    };
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
  };  // Handle drag and drop between columns
  const handleDragEnd = async (result: any) => {
    // Dispatch custom event to resume auto-refresh (with delay)
    document.dispatchEvent(new Event('dragend'));
    
    const { destination, source, draggableId } = result;
    
    // Return if dropped outside of a droppable area
    if (!destination) return;
    
    // Return if dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;
    
    // Check if task status needs updating (dropped in a different column)
    if (destination.droppableId !== source.droppableId) {
      const newStatus = destination.droppableId as TaskStatus;
      
      // Use our custom hook to handle the move operation
      const success = await moveTask(draggableId, newStatus);
      
      // If the move was successful, apply the change to filteredTasks as well
      if (success) {
        // Update the filtered tasks to match
        setFilteredTasks(prevTasks => {
          const updatedTask = tasks.find(t => t.id === draggableId);
          if (!updatedTask) return prevTasks;
          
          return prevTasks.map(t => 
            t.id === draggableId ? updatedTask : t
          );
        });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form 
          onSubmit={handleSearch}
          className="relative max-w-[320px] w-full"
        >
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 pr-10 h-10 bg-background/70 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={() => {
                setSearchQuery('');
                applyFilters('', statusFilter);
              }}
              className="absolute right-3 top-2.5"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </form>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {statusFilter !== 'ALL' && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                1
              </span>
            )}
          </Button>

          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            className="h-10 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>
      
      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-background border rounded-lg p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Status
              </label>
              <select 
                className="rounded-md border border-input bg-background px-3 py-2 h-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-w-[180px]"
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
          </div>
          
          <Button
            variant="outline"
            onClick={resetFilters}
            size="sm"
            className="h-9"
          >
            Reset Filters
          </Button>
        </div>
      )}      {/* Kanban Board */}
      <DragDropContext 
        onDragEnd={handleDragEnd}
        onDragStart={() => {
          // Dispatch custom event to pause auto-refresh
          document.dispatchEvent(new Event('dragstart'));
        }}
      >
        <div className="flex gap-6 pb-8 overflow-x-auto">
          {displayStatuses.map(status => (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col h-full min-w-[320px] w-[320px] border rounded-xl ${
                    snapshot.isDraggingOver 
                      ? 'ring-2 ring-primary ring-opacity-50 shadow-lg transition-all duration-200' 
                      : ''
                  } ${getStatusColor(status)}`}
                >
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">{formatStatus(status)}</h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      {tasksByStatus[status].length} task{tasksByStatus[status].length !== 1 && 's'}
                      
                      {status === TaskStatus.DONE && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (requires completed checklist)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[60vh]">
                    {tasksByStatus[status].map((task, index) => (
                      <Draggable 
                        key={task.id} 
                        draggableId={task.id} 
                        index={index}
                      >
                        {(provided, snapshot) => (                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              transition: 'opacity 0.2s, transform 0.2s',
                              transform: snapshot.isDragging 
                                ? `${provided.draggableProps.style?.transform} scale(1.02)` 
                                : provided.draggableProps.style?.transform,
                            }}
                            className="transition-all duration-200"
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
                        No tasks
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
