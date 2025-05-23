"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Task, TaskStatus } from "@/lib/types";
import { formatStatus, getStatusVariant } from "@/lib/utils";
import { Clock, CheckCircle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isKanban?: boolean;
  isDraggable?: boolean;
}

export default function TaskCard({
  task,
  onClick,
  isKanban = false,
  isDraggable = false,
}: TaskCardProps) {
  // Track mouse position for distinguishing clicks from drags
  const [mouseDownPos, setMouseDownPos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDraggable) {
      setMouseDownPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggable && mouseDownPos) {
      // Only trigger click if mouse didn't move much (not a drag attempt)
      const dx = Math.abs(e.clientX - mouseDownPos.x);
      const dy = Math.abs(e.clientY - mouseDownPos.y);

      if (dx < 5 && dy < 5) {
        onClick();
      }

      setMouseDownPos(null);
    } else {
      onClick();
    }
  };
  // Get the latest history entry if available
  const latestHistory =
    task.statusHistory && task.statusHistory.length > 0
      ? task.statusHistory[0]
      : null;

  // Calculate PR checklist completion percentage
  const prChecklistTotal = task.prChecklist.length;
  const prChecklistCompleted = task.prChecklist.filter(
    (item) => item.checked
  ).length;
  const prChecklistPercentage =
    prChecklistTotal > 0
      ? Math.round((prChecklistCompleted / prChecklistTotal) * 100)
      : 0;
  // Check if PR template is filled
  const getPrTemplateData = () => {
    try {
      // Safely access localStorage (only on client-side)
      if (typeof window !== "undefined") {
        // Try to get from localStorage first
        const savedData = localStorage.getItem(`pr_template_${task.id}`);
        if (savedData) {
          return JSON.parse(savedData);
        }
      }

      // If not in localStorage, try to get from task.prMetadata
      if (task.prMetadata) {
        return {
          jiraTicket: task.prMetadata.jiraTicket || "",
          jiraLink: task.prMetadata.jiraLink || "",
          description: task.prMetadata.description || "",
          testingPlan: task.prMetadata.testingPlan || "",
        };
      }
    } catch (e) {
      console.error("Error reading PR template data", e);
    }
    return null;
  };

  const prTemplateData = getPrTemplateData();
  const hasPrTemplateData =
    prTemplateData &&
    (prTemplateData.description ||
      prTemplateData.jiraTicket ||
      prTemplateData.testingPlan);

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 group
        ${
          isKanban
            ? "hover:shadow-md hover:-translate-y-1 h-auto shadow-sm border-b-2 border-b-primary/40"
            : "hover:shadow-md hover:-translate-y-1 h-full border-b-2 border-b-primary/40"
        }
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={isDraggable ? undefined : onClick}
    >
      <CardHeader className={`${isKanban ? "p-3 pb-1" : "pb-2"}`}>
        <div className="flex justify-between items-start">
          <CardTitle
            className={`${
              isKanban ? "text-base leading-tight" : "text-xl"
            } group-hover:text-primary transition-colors`}
          >
            {task.title}
          </CardTitle>
          {!isKanban && (
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
          )}
        </div>
      </CardHeader>

      <CardContent className={isKanban ? "p-3 pt-0" : ""}>
        <p
          className={`text-sm text-muted-foreground ${
            isKanban ? "line-clamp-2 mb-2" : "line-clamp-3 mb-4"
          }`}
        >
          {task.description}
        </p>{" "}
        {/* PR Checklist Progress (if items exist) */}
        {task.prChecklist.length > 0 && (
          <div className="mt-2 mb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Checklist
              </span>
              <span>{prChecklistPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  prChecklistPercentage === 100 ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${prChecklistPercentage}%` }}
              ></div>
            </div>

            {/* Show PR template status for IN_REVIEW tasks */}
            {task.status === TaskStatus.IN_REVIEW && (
              <div className="flex justify-between items-center mt-1.5 text-xs">
                <span>PR Template: </span>
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    hasPrTemplateData
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {hasPrTemplateData ? "Completed" : "Not Filled"}
                </span>
              </div>
            )}

            {task.status === TaskStatus.IN_REVIEW &&
              prChecklistPercentage < 100 && (
                <div className="text-xs text-amber-500 mt-1">
                  Complete checklist before moving to Done
                </div>
              )}
          </div>
        )}
        {latestHistory && latestHistory.notes !== "Task created" && (
          <div className="bg-muted/50 p-2 rounded text-xs mt-2">
            <p className={isKanban ? "line-clamp-1" : "line-clamp-2"}>
              {latestHistory.notes}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter
        className={`text-xs text-muted-foreground ${
          isKanban ? "p-3 pt-0" : ""
        }`}
      >
        <div className="flex justify-between w-full items-center">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(task.createdAt))} ago
          </span>
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
            ID: {task.id.slice(0, 6)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
