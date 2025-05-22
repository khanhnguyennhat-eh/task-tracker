'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskCard from '@/components/task-card';
import CreateTaskDialog from '@/components/create-task-dialog';
import TaskDetailsDialog from '@/components/task-details-dialog';
import { Task, TaskStatus } from '@/lib/types';
import { Plus, Search } from 'lucide-react';

interface TaskGridProps {
  initialTasks: Task[];
}

export default function TaskGrid({ initialTasks }: TaskGridProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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

  const applyFilters = (query: string, status: TaskStatus | 'ALL') => {
    let filtered = tasks;

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tasks and track their progress through the development workflow.
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

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center bg-muted/40 rounded-lg p-12 text-center">
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
      </div>

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
