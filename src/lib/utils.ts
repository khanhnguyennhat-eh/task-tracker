import type { ClassValue } from "class-variance-authority/types";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TaskStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format TaskStatus enum to human-readable string
export function formatStatus(status: TaskStatus): string {
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
}

// Get appropriate status badge variant
export function getStatusVariant(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.INVESTIGATION:
      return 'investigation';
    case TaskStatus.PLANNING:
      return 'planning';
    case TaskStatus.IN_PROGRESS:
      return 'in-progress';
    case TaskStatus.IN_TESTING:
      return 'in-testing';
    case TaskStatus.IN_REVIEW:
      return 'in-review';
    case TaskStatus.DONE:
      return 'done';
    default:
      return 'default';
  }
}

// Get Kanban column color classes
export function getStatusColor(status: TaskStatus): string {
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
}

// Get next status in workflow
export function getNextStatus(currentStatus: TaskStatus): TaskStatus | null {
  const statusOrder = Object.values(TaskStatus);
  const currentIndex = statusOrder.indexOf(currentStatus);

  if (currentIndex < statusOrder.length - 1) {
    return statusOrder[currentIndex + 1];
  }

  return null; // No next status (task is done)
}
