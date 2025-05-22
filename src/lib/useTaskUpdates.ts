'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to refresh page data on task changes
 * Ensures UI stays in sync with the server-side data
 */
export function useTaskUpdates() {
  const router = useRouter();
  
  // For more advanced use cases, you could implement custom event listeners
  // to handle specific update types
  
  // Simple function to refresh data
  const refreshData = () => {
    router.refresh();
  };
  
  return { refreshData };
}
