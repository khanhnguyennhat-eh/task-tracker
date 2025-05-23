"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useTaskUpdates } from "@/lib/use-task-updates";
import { useToast } from "@/lib/use-toast";

export default function CreateTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { refreshData } = useTaskUpdates();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jiraTicket: "",
    jiraLink: "",
    prDescription: "",
    testingPlan: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First create the task with basic details
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create task");
      }

      const newTask = await response.json();
      // If PR metadata fields are provided, save them using the PR metadata API
      if (
        formData.jiraTicket ||
        formData.jiraLink ||
        formData.prDescription ||
        formData.testingPlan
      ) {
        const metadataResponse = await fetch(
          `/api/tasks/${newTask.id}/pr-metadata`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jiraTicket: formData.jiraTicket,
              jiraLink: formData.jiraLink,
              description: formData.prDescription,
              testingPlan: formData.testingPlan,
            }),
          }
        );

        if (!metadataResponse.ok) {
          console.error("Failed to save PR metadata, but task was created");
        }
      }

      // Reset form and close dialog
      setFormData({
        title: "",
        description: "",
        jiraTicket: "",
        jiraLink: "",
        prDescription: "",
        testingPlan: "",
      });
      onOpenChange(false);

      // Show success toast
      toast({
        title: "Task created",
        description: `"${formData.title}" has been successfully created`,
        variant: "success",
      });

      // Refresh the task list
      router.refresh();
      refreshData(); // Call our custom refresh function
    } catch (error: any) {
      console.error("Error creating task:", error);

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-bold">
              Create New Task
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add details for your new task. This will start in the
              Investigation stage.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 px-6 py-4 space-y-6 overflow-auto">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Task Title
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Task Description
              </label>{" "}
              <Textarea
                id="description"
                name="description"
                placeholder="Describe what needs to be done"
                rows={5}
                value={formData.description}
                onChange={handleInputChange}
                required
                className="resize-none w-full min-h-[150px]"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-4">
                Pull Request Information (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="jiraTicket" className="text-sm font-medium">
                    JIRA Ticket #
                  </label>
                  <Input
                    id="jiraTicket"
                    name="jiraTicket"
                    placeholder="e.g. TASK-123"
                    value={formData.jiraTicket}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="jiraLink" className="text-sm font-medium">
                    JIRA Link
                  </label>
                  <Input
                    id="jiraLink"
                    name="jiraLink"
                    placeholder="https://jira.example.com/browse/TASK-123"
                    value={formData.jiraLink}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <label htmlFor="prDescription" className="text-sm font-medium">
                  PR Description
                </label>
                <Textarea
                  id="prDescription"
                  name="prDescription"
                  placeholder="Describe the changes for the PR"
                  rows={3}
                  value={formData.prDescription}
                  onChange={handleInputChange}
                  className="resize-none w-full"
                />
              </div>

              <div className="space-y-2 mt-4">
                <label htmlFor="testingPlan" className="text-sm font-medium">
                  Testing Plan
                </label>
                <Textarea
                  id="testingPlan"
                  name="testingPlan"
                  placeholder="Explain how these changes will be tested"
                  rows={3}
                  value={formData.testingPlan}
                  onChange={handleInputChange}
                  className="resize-none w-full"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <div className="flex gap-2 w-full justify-between sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-6">
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
