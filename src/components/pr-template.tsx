"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/use-toast";
import { PRMetadata } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useTaskUpdates } from "@/lib/use-task-updates";

interface PRTemplateProps {
  taskId: string;
  initialMetadata?: PRMetadata;
}

export default function PRTemplate({
  taskId,
  initialMetadata,
}: PRTemplateProps) {
  const router = useRouter();
  const { refreshData } = useTaskUpdates();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [metadata, setMetadata] = useState<Partial<PRMetadata>>({
    jiraTicket: initialMetadata?.jiraTicket || "",
    jiraLink: initialMetadata?.jiraLink || "",
    description: initialMetadata?.description || "",
    testingPlan: initialMetadata?.testingPlan || "",
  });

  const handleChange = (field: keyof PRMetadata, value: string) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/pr-metadata`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save PR metadata");
      }

      toast({
        title: "PR template saved",
        description: "Your PR template information has been saved",
        variant: "success",
      });

      // Refresh the page data
      router.refresh();
      refreshData();
    } catch (error: any) {
      console.error("Error saving PR metadata:", error);
      toast({
        title: "Error",
        description: `Failed to save PR template: ${
          error.message || "Unknown error"
        }`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Generate the PR template preview
  const generateTemplate = () => {
    return `## Description
${metadata.description || "Add a description of the changes..."}

## JIRA Ticket
${
  metadata.jiraTicket
    ? `[${metadata.jiraTicket}](${metadata.jiraLink || "#"})`
    : "Add JIRA ticket reference..."
}

## Testing Plan
${metadata.testingPlan || "Explain how these changes were tested..."}

## Checklist

_Please check all items that apply before requesting a review._
`;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="jira-ticket" className="text-sm font-medium">
            JIRA Ticket #
          </label>
          <Input
            id="jira-ticket"
            value={metadata.jiraTicket || ""}
            onChange={(e) => handleChange("jiraTicket", e.target.value)}
            placeholder="e.g. TASK-123"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="jira-link" className="text-sm font-medium">
            JIRA Ticket Link
          </label>
          <Input
            id="jira-link"
            value={metadata.jiraLink || ""}
            onChange={(e) => handleChange("jiraLink", e.target.value)}
            placeholder="e.g. https://jira.example.com/browse/TASK-123"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="pr-description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="pr-description"
            value={metadata.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe the changes you've made..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="testing-plan" className="text-sm font-medium">
            Testing Plan
          </label>
          <Textarea
            id="testing-plan"
            value={metadata.testingPlan || ""}
            onChange={(e) => handleChange("testingPlan", e.target.value)}
            placeholder="Explain how you tested these changes..."
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save PR Template"}
        </Button>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold mb-2">PR Template Preview</h4>
        <div className="bg-muted/30 rounded-lg p-4 whitespace-pre-wrap text-sm font-mono">
          {generateTemplate()}
        </div>
      </div>
    </div>
  );
}
