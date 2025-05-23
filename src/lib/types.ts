// Task status enum
export enum TaskStatus {
  INVESTIGATION = "INVESTIGATION",
  PLANNING = "PLANNING", 
  IN_PROGRESS = "IN_PROGRESS",
  IN_TESTING = "IN_TESTING",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE"
}

// Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status: TaskStatus;
  statusHistory: StatusHistory[];
  prChecklist: PRChecklistItem[];
  prMetadata?: PRMetadata;
}

// Status history interface
export interface StatusHistory {
  id: string;
  taskId: string;
  status: TaskStatus;
  notes: string;
  createdAt: Date;
}

// PR checklist item interface
export interface PRChecklistItem {
  id: string;
  taskId: string;
  text: string;
  checked: boolean;
}

// PR metadata interface for GitHub PR template
export interface PRMetadata {
  id: string;
  taskId: string;
  jiraTicket?: string;
  jiraLink?: string;
  description?: string;
  testingPlan?: string;
}

// Default PR checklist items
export const DEFAULT_PR_CHECKLIST = [
  "Code follows project style guidelines",
  "All tests are passing",
  "Documentation has been updated",
  "Self-review has been completed",
  "No unnecessary debug code or comments",
  "No sensitive information is exposed",
  "Performance considerations have been addressed",
  "Accessibility requirements have been met"
];
