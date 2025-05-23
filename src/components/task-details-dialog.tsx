"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDistanceToNow, format } from "date-fns";
import { Task, TaskStatus, StatusHistory, PRChecklistItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useTaskUpdates } from "@/lib/use-task-updates";
import { useToast } from "@/lib/use-toast";
import { formatStatus, getStatusVariant, getNextStatus } from "@/lib/utils";
import MarkdownPRTemplate from "./markdown-pr-template";

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailsDialogProps) {
  const router = useRouter();
  const { refreshData } = useTaskUpdates();
  const { toast } = useToast();
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [prTemplateData, setPrTemplateData] = useState<any>(null);

  // Load PR template data from localStorage when the task changes
  useEffect(() => {
    if (task && typeof window !== "undefined") {
      try {
        // First try to get from localStorage
        const savedData = localStorage.getItem(`pr_template_${task.id}`);
        if (savedData) {
          setPrTemplateData(JSON.parse(savedData));
          return;
        }

        // If not in localStorage but exists in task.prMetadata, use that
        if (task.prMetadata) {
          setPrTemplateData({
            jiraTicket: task.prMetadata.jiraTicket || "",
            jiraLink: task.prMetadata.jiraLink || "",
            description: task.prMetadata.description || "",
            testingPlan: task.prMetadata.testingPlan || "",
          });
        } else {
          // If neither localStorage nor task.prMetadata has data, set to empty values
          setPrTemplateData({
            jiraTicket: "",
            jiraLink: "",
            description: "",
            testingPlan: "",
          });
        }
      } catch (error) {
        console.error("Error loading PR template data:", error);
        // Fallback to empty values on error
        setPrTemplateData({
          jiraTicket: "",
          jiraLink: "",
          description: "",
          testingPlan: "",
        });
      }
    }
  }, [task]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!task) return;

    const nextStatus = getNextStatus(task.status);
    if (!nextStatus) return;

    if (!statusNotes) {
      alert("Please provide notes for this status update.");
      return;
    }

    setIsUpdatingStatus(true);

    try {
      const response = await fetch(`/api/tasks/${task.id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          notes: statusNotes,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update status");
      }

      const result = await response.json();

      // Reset form and refresh page
      setStatusNotes("");
      onOpenChange(false);

      // Show success toast
      toast({
        title: "Task updated",
        description: `Task status changed to ${formatStatus(nextStatus)}`,
        variant: "success",
      });

      router.refresh();
      refreshData(); // Call our custom refresh function
    } catch (error: any) {
      console.error("Error updating task status:", error);

      // Show error toast instead of alert
      toast({
        title: "Error",
        description: `Failed to update task status: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  // Get the badge color for timeline dots
  const getBadgeColor = (status: TaskStatus): string => {
    // Return tailwind class names for background color
    switch (status) {
      case TaskStatus.INVESTIGATION:
        return "bg-status-investigation";
      case TaskStatus.PLANNING:
        return "bg-status-planning";
      case TaskStatus.IN_PROGRESS:
        return "bg-status-in-progress";
      case TaskStatus.IN_TESTING:
        return "bg-status-in-testing";
      case TaskStatus.IN_REVIEW:
        return "bg-status-in-review";
      case TaskStatus.DONE:
        return "bg-status-done";
      default:
        return "bg-primary";
    }
  };
  // Process history to group similar consecutive updates
  type GroupedHistory = {
    id: string;
    status: TaskStatus;
    notes: string;
    createdAt: Date;
    occurrences: number;
    firstCreatedAt: Date;
    lastCreatedAt: Date;
  };
  const processHistory = (history: StatusHistory[]): GroupedHistory[] => {
    if (!history || history.length === 0) return [];

    const result: GroupedHistory[] = [];
    let currentGroup: GroupedHistory | null = null;
    // Process history items in reverse order (newest first)
    [...history].forEach((item, index) => {
      // Simplify notes by removing "via drag and drop" text
      let simplifiedNotes = item.notes;
      if (simplifiedNotes.includes("via drag and drop")) {
        simplifiedNotes = `Moved to ${formatStatus(item.status)}`;
      }

      // Further simplify - if it starts with "Task moved to" just use "Moved to"
      if (simplifiedNotes.startsWith("Task moved to")) {
        simplifiedNotes = simplifiedNotes.replace("Task moved to", "Moved to");
      }

      // If this is the first item or it's different from the current group
      if (
        !currentGroup ||
        currentGroup.notes !== simplifiedNotes ||
        currentGroup.status !== item.status
      ) {
        // If we have a current group, add it to the result
        if (currentGroup) {
          result.push(currentGroup);
        }

        // Start a new group
        currentGroup = {
          id: item.id,
          status: item.status,
          notes: simplifiedNotes, // Use simplified notes
          createdAt: item.createdAt,
          occurrences: 1,
          firstCreatedAt: item.createdAt,
          lastCreatedAt: item.createdAt,
        };
      } else {
        // This item is similar to the current group, increment the count
        currentGroup.occurrences++;
        currentGroup.lastCreatedAt = item.createdAt;
      }
    });

    // Don't forget to add the last group
    if (currentGroup) {
      result.push(currentGroup);
    }

    return result;
  };

  if (!task) return null;

  const nextStatus = getNextStatus(task.status); // Determine dialog width based on task status
  const dialogWidthClass =
    task.status === TaskStatus.IN_REVIEW
      ? "sm:max-w-[850px] md:max-w-[900px] lg:max-w-[1000px]"
      : "sm:max-w-[700px]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${dialogWidthClass} max-h-[90vh] overflow-y-auto p-0`}
      >
        {/* Dialog Header with Task Title and Status Badge */}
        <DialogHeader className="px-6 pt-6 pb-4 sticky top-0 bg-background z-10 border-b">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold leading-tight">
                {task.title}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {" "}
              <Badge
                variant={
                  getStatusVariant(task.status) as
                    | "investigation"
                    | "planning"
                    | "in-progress"
                    | "in-testing"
                    | "in-review"
                    | "done"
                    | "default"
                }
                className="text-sm shrink-0"
              >
                {formatStatus(task.status)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full ml-1 hover:bg-muted"
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            {" "}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Created {formatDistanceToNow(new Date(task.createdAt))} ago
              </span>
              <span className="font-mono">ID: {task.id}</span>
            </div>
          </div>
        </DialogHeader>
        {/* Main Content Area */}
        <div className="px-6 py-4 space-y-6">
          {/* Task Description */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Description</h3>
            <div className="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap text-sm">
              {task.description}
            </div>
          </div>
          {/* PR Template (only for in-review status) */}
          {task.status === TaskStatus.IN_REVIEW && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Pull Request Template</h3>

              {/* GitHub PR Template using Markdown */}
              <div className="bg-muted/30 rounded-lg p-5">
                <MarkdownPRTemplate
                  taskId={task.id}
                  taskTitle={task.title}
                  taskDescription={task.description}
                  initialData={prTemplateData}
                />
              </div>
            </div>
          )}
          {/* Status Update Form (if not done) */}
          {nextStatus && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">Update Status</h3>
              <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium block">
                      Current status:
                    </span>{" "}
                    <Badge
                      variant={
                        getStatusVariant(task.status) as
                          | "investigation"
                          | "planning"
                          | "in-progress"
                          | "in-testing"
                          | "in-review"
                          | "done"
                          | "default"
                      }
                    >
                      {formatStatus(task.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-medium block">
                      Next status:
                    </span>{" "}
                    <Badge
                      variant={
                        getStatusVariant(nextStatus) as
                          | "investigation"
                          | "planning"
                          | "in-progress"
                          | "in-testing"
                          | "in-review"
                          | "done"
                          | "default"
                      }
                    >
                      {formatStatus(nextStatus)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label
                    htmlFor="status-notes"
                    className="text-sm font-medium block"
                  >
                    Notes (required)
                  </label>
                  <Textarea
                    id="status-notes"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder={`What did you do during the ${formatStatus(
                      task.status
                    )} phase?`}
                    rows={3}
                    className="resize-none w-full"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleStatusUpdate}
                  disabled={!statusNotes || isUpdatingStatus}
                >
                  {isUpdatingStatus
                    ? "Updating..."
                    : `Update to ${formatStatus(nextStatus)}`}
                </Button>
              </div>
            </div>
          )}{" "}
          {/* Status History Timeline - Ultra Minimal */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">History</h3>
              <span className="text-xs text-muted-foreground">
                {processHistory(task.statusHistory).reduce(
                  (total, item) => total + item.occurrences,
                  0
                )}{" "}
                updates
              </span>
            </div>{" "}
            <div className="max-h-[240px] overflow-y-auto">
              {processHistory(task.statusHistory).map(
                (history: GroupedHistory, index: number) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between py-1 border-b border-muted/5 last:border-0"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground/70 w-16 shrink-0">
                        {format(new Date(history.createdAt), "MM/dd")}
                      </span>

                      <span className="text-xs">
                        {formatStatus(history.status)}
                        {history.occurrences > 1 && (
                          <span className="text-muted-foreground text-[10px]">
                            {` ×${history.occurrences}`}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground text-right max-w-[50%] truncate">
                      {history.notes}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
