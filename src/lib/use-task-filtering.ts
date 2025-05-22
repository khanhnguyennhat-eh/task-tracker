'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus } from './types';
import { useTaskFilterParams } from './use-task-filter-params';

/**
 * Custom hook to manage task filtering with URL parameter support
 */
export function useTaskFiltering(initialTasks: Task[]) {
  const { updateUrlParams, getFiltersFromUrl } = useTaskFilterParams();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks);
  
  // Initialize from URL parameters or defaults
  const { query: initialQuery, status: initialStatus } = getFiltersFromUrl();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>(initialStatus);
  
  // Update tasks when initialTasks change (from server) or apply initial filters
  useEffect(() => {
    setTasks(initialTasks);
    // Apply any active filters
    applyFilters(searchQuery, statusFilter, initialTasks);
  }, [initialTasks]);
  
  // Apply filters and update URL
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
  
  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchQuery, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value as TaskStatus | 'ALL';
    setStatusFilter(newFilter);
    applyFilters(searchQuery, newFilter);
  };
  
  // Reset filters and URL
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setFilteredTasks(tasks);
    updateUrlParams('', 'ALL');
  };
  
  return {
    tasks,
    setTasks,
    filteredTasks,
    setFilteredTasks,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    handleSearch,
    handleStatusFilterChange,
    applyFilters,
    resetFilters
  };
}
