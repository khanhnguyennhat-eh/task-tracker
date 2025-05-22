'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to manage task data refreshing
 * Provides both auto-refresh and manual refresh functions
 */
export function useTaskUpdates(autoRefreshInterval = 5000) {
  const router = useRouter();
  
  // Set up automatic refresh at specified interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    
    const interval = setInterval(() => {
      router.refresh();
    }, autoRefreshInterval);
    
    return () => clearInterval(interval);
  }, [router, autoRefreshInterval]);
  
  // Simple function to refresh data manually
  const refreshData = () => {
    router.refresh();
  };
  
  return { refreshData };
}
