"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/use-toast";
import { useRouter } from "next/navigation";

interface GitHubPRTemplateProps {
  taskId: string;
  initialData?: {
    jiraTicket?: string;
    jiraLink?: string;
    description?: string;
    testingPlan?: string;
  } | null;
  onUpdate?: () => void;
}

export default function GitHubPRTemplate({
  taskId,
  initialData = {},
  onUpdate,
}: GitHubPRTemplateProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Safely extract data with null checks
  const safeData = initialData || {};
  const [jiraTicket, setJiraTicket] = useState(safeData.jiraTicket || "");
  const [jiraLink, setJiraLink] = useState(safeData.jiraLink || "");
  const [description, setDescription] = useState(safeData.description || "");
  const [testingPlan, setTestingPlan] = useState(safeData.testingPlan || "");

  // For real-time preview
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Store the PR template data in localStorage for now
      // This can be replaced with an API call when the database is ready
      const prData = {
        jiraTicket,
        jiraLink,
        description,
        testingPlan,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(`pr_template_${taskId}`, JSON.stringify(prData));
      }

      toast({
        title: "PR Template Saved",
        description: "Your PR template data has been saved successfully",
        variant: "success",
      });

      if (onUpdate) {
        onUpdate();
      }

      router.refresh();
    } catch (error) {
      console.error("Error saving PR template:", error);
      toast({
        title: "Error",
        description: "Failed to save PR template",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const markdownTemplate = `## Description
${description || "Add a description of the changes..."}

## JIRA Ticket
${
  jiraTicket
    ? `[${jiraTicket}](${jiraLink || "#"})`
    : "Add JIRA ticket reference..."
}

## Testing Plan
${testingPlan || "Explain how these changes were tested..."}

## Checklist

_Please check all items that apply before requesting a review._
`;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium">GitHub PR Template</h4>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {isPreviewMode ? (
        // Preview mode
        <div className="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap text-sm font-mono">
          {markdownTemplate}
        </div>
      ) : (
        // Edit mode
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">JIRA Ticket #</label>
              <Input
                value={jiraTicket}
                onChange={(e) => setJiraTicket(e.target.value)}
                placeholder="e.g. TASK-123"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">JIRA Link</label>
              <Input
                value={jiraLink}
                onChange={(e) => setJiraLink(e.target.value)}
                placeholder="https://jira.example.com/browse/TASK-123"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the changes you made..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Testing Plan</label>
            <Textarea
              value={testingPlan}
              onChange={(e) => setTestingPlan(e.target.value)}
              placeholder="Explain how you tested the changes..."
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      )}
    </div>
  );
}
