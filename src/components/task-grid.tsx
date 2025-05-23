"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TaskCard from "@/components/task-card";
import CreateTaskDialog from "@/components/create-task-dialog";
import TaskDetailsDialog from "@/components/task-details-dialog";
import { Task, TaskStatus } from "@/lib/types";
import { Plus, Search, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTaskFilterParams } from "@/lib/use-task-filter-params";
import { formatStatus, getStatusVariant } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TaskGridProps {
  initialTasks: Task[];
}

export default function TaskGrid({ initialTasks }: TaskGridProps) {
  const router = useRouter();
  const { updateUrlParams, getFiltersFromUrl } = useTaskFilterParams();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortBy, setSortBy] = useState<"updated" | "created">("updated");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Initialize from URL parameters or defaults
  const { query: initialQuery, status: initialStatus } = getFiltersFromUrl();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">(
    initialStatus
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Task counts by status
  const statusCounts = tasks.reduce((counts, task) => {
    counts[task.status] = (counts[task.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Apply any active filters (from URL or state) when component loads
  useEffect(() => {
    setTasks(initialTasks);
    // Apply any active filters (from URL or state)
    applyFilters(searchQuery, statusFilter, initialTasks);
  }, [initialTasks]);

  // Reapply filters when sort options change
  useEffect(() => {
    applyFilters(searchQuery, statusFilter);
  }, [sortBy, sortDirection]);

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
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newFilter = e.target.value as TaskStatus | "ALL";
    setStatusFilter(newFilter);
    applyFilters(searchQuery, newFilter);
  };

  const applyFilters = (
    query: string,
    status: TaskStatus | "ALL",
    taskList = tasks
  ) => {
    let filtered = taskList;

    // Apply status filter
    if (status !== "ALL") {
      filtered = filtered.filter((task) => task.status === status);
    }

    // Apply search query
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.statusHistory.some((history) =>
            history.notes.toLowerCase().includes(searchLower)
          )
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(sortBy === "created" ? a.createdAt : a.updatedAt);
      const dateB = new Date(sortBy === "created" ? b.createdAt : b.updatedAt);

      return sortDirection === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

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
    setSearchQuery("");
    setStatusFilter("ALL");
    setFilteredTasks(tasks);
    updateUrlParams("", "ALL");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tasks and track their progress through the development
            workflow.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>{" "}
      {/* Search and Filters */}
      <div className="border rounded-lg p-4 bg-card shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search input */}
          <div className="relative flex-grow">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks by title, description or notes..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="ml-2">
                Search
              </Button>
            </form>
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            <Button
              variant={statusFilter === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter("ALL");
                applyFilters(searchQuery, "ALL");
              }}
              className="whitespace-nowrap"
            >
              All ({tasks.length})
            </Button>

            {Object.values(TaskStatus).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(status);
                  applyFilters(searchQuery, status);
                }}
                className={`whitespace-nowrap ${
                  getStatusVariant(status) === "in-review"
                    ? "border-amber-200"
                    : getStatusVariant(status) === "done"
                    ? "border-green-200"
                    : ""
                }`}
              >
                {formatStatus(status)} ({statusCounts[status] || 0})
              </Button>
            ))}

            {(statusFilter !== "ALL" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-2"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>{" "}
      {/* Tasks Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {statusFilter === "ALL"
            ? `Showing ${filteredTasks.length} of ${tasks.length} tasks`
            : `Showing ${filteredTasks.length} tasks in ${formatStatus(
                statusFilter
              )} status`}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <div className="flex items-center">
            <button
              className={`flex items-center font-medium ${
                sortBy === "updated"
                  ? "text-primary underline"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                const newDirection =
                  sortBy === "updated" && sortDirection === "desc"
                    ? "asc"
                    : "desc";
                setSortBy("updated");
                setSortDirection(newDirection);
                applyFilters(searchQuery, statusFilter);
              }}
            >
              Updated
              {sortBy === "updated" &&
                (sortDirection === "desc" ? (
                  <ArrowDown className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowUp className="ml-1 h-3 w-3" />
                ))}
            </button>
          </div>
          <div className="flex items-center">
            <button
              className={`flex items-center font-medium ${
                sortBy === "created"
                  ? "text-primary underline"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                const newDirection =
                  sortBy === "created" && sortDirection === "desc"
                    ? "asc"
                    : "desc";
                setSortBy("created");
                setSortDirection(newDirection);
                applyFilters(searchQuery, statusFilter);
              }}
            >
              Created
              {sortBy === "created" &&
                (sortDirection === "desc" ? (
                  <ArrowDown className="ml-1 h-3 w-3" />
                ) : (
                  <ArrowUp className="ml-1 h-3 w-3" />
                ))}
            </button>
          </div>
        </div>
      </div>
      {/* Tasks List View */}
      {filteredTasks.length > 0 ? (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          {/* Column Headers */}
          <div className="hidden sm:grid grid-cols-12 bg-muted/50 px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <div className="col-span-5 xl:col-span-6">Task</div>
            <div className="col-span-2 xl:col-span-1 text-center">Status</div>
            <div className="col-span-3 text-center">
              <span className="hidden md:inline">Last Update</span>
              <span className="md:hidden">Updated</span>
            </div>
            <div className="col-span-2 text-right pr-2">Created</div>
          </div>

          {/* Task Rows */}
          <div className="divide-y">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="grid sm:grid-cols-12 gap-2 p-4 sm:py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => handleTaskClick(task)}
              >
                {/* Task Info - Mobile Layout (Stack everything) */}
                <div className="sm:hidden space-y-2 mb-2">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <Badge variant={getStatusVariant(task.status) as any}>
                      {formatStatus(task.status)}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span>
                        Updated {formatDistanceToNow(new Date(task.updatedAt))}{" "}
                        ago
                      </span>
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span className="font-mono bg-muted/60 rounded-full px-2 py-0.5">
                        #{task.id.slice(0, 6)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Desktop Layout (Grid) */}
                <div className="hidden sm:block col-span-5 xl:col-span-6">
                  <div className="font-medium line-clamp-1 mb-1">
                    {task.title}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {task.description}
                  </div>
                </div>
                <div className="hidden sm:flex col-span-2 xl:col-span-1 justify-center items-center">
                  <Badge
                    variant={getStatusVariant(task.status) as any}
                    className="text-xs whitespace-nowrap"
                  >
                    {formatStatus(task.status)}
                  </Badge>
                </div>
                <div className="hidden sm:flex col-span-3 text-xs text-center items-center justify-center text-muted-foreground">
                  {formatDistanceToNow(new Date(task.updatedAt))} ago
                </div>
                <div className="hidden sm:flex col-span-2 text-xs text-right items-center justify-end text-muted-foreground">
                  {formatDistanceToNow(new Date(task.createdAt))} ago
                </div>
              </div>
            ))}
          </div>
        </div>
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
