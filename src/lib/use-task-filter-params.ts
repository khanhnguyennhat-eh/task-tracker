'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TaskStatus } from './types';

/**
 * Utility for managing URL query parameters for task filtering
 */
export function useTaskFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Update URL search parameters with current filter values
   */
  const updateUrlParams = (query: string, status: TaskStatus | 'ALL') => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove the search parameter
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    
    // Update or remove the status parameter
    if (status !== 'ALL') {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    
    // Create the new URL
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    
    // Update the URL without refreshing the page
    router.push(newUrl, { scroll: false });
  };

  /**
   * Get filters from URL parameters
   */
  const getFiltersFromUrl = () => {
    const query = searchParams.get('q') || '';
    const statusParam = searchParams.get('status');
    
    // Validate that statusParam is actually a valid TaskStatus enum value
    let status: TaskStatus | 'ALL' = 'ALL';
    if (statusParam && Object.values(TaskStatus).includes(statusParam as TaskStatus)) {
      status = statusParam as TaskStatus;
    }
    
    return { query, status };
  };

  return { updateUrlParams, getFiltersFromUrl };
}
