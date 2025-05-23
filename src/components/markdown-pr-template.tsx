'use client';

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/use-toast';
import { useRouter } from 'next/navigation';
import { useTaskUpdates } from '@/lib/use-task-updates';
import { Clipboard } from 'lucide-react';

interface MarkdownPRTemplateProps {
  taskId: string;
  taskTitle?: string;
  taskDescription?: string;
  initialData?: {
    jiraTicket?: string;
    jiraLink?: string;
    description?: string;
    testingPlan?: string;
  } | null;
}

export default function MarkdownPRTemplate({ 
  taskId, 
  taskTitle = '', 
  taskDescription = '',
  initialData = {}
}: MarkdownPRTemplateProps) {
  const router = useRouter();
  const { refreshData } = useTaskUpdates();
  const { toast } = useToast();
  
  const [template, setTemplate] = useState<string>('');
  const [renderedTemplate, setRenderedTemplate] = useState<string>('');
  const [checkboxes, setCheckboxes] = useState<{[key: string]: boolean}>({});
  
  // Form data
  const safeData = initialData || {};
  const [formData, setFormData] = useState({
    jiraTicket: safeData.jiraTicket || '',
    jiraLink: safeData.jiraLink || '',
    description: safeData.description || taskDescription || '',
    testingPlan: safeData.testingPlan || ''
  });
  // Load template from markdown file
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch('/docs/github-pr-template.md');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        let text = await response.text();
        setTemplate(text);
        
        // Extract checkboxes
        const checkboxMatches = text.match(/- \[ \] .+/g) || [];
        const initialCheckboxes: {[key: string]: boolean} = {};
        
        checkboxMatches.forEach((match, index) => {
          initialCheckboxes[`checkbox-${index}`] = false;
        });
        
        setCheckboxes(initialCheckboxes);
      } catch (error) {
        console.error('Error loading PR template:', error);
        setTemplate('# Error loading template');
      }
    };
    
    fetchTemplate();
  }, [taskDescription]);

  // Render template with filled data
  useEffect(() => {
    if (!template) return;
    
    let rendered = template
      .replace('{{description}}', formData.description || 'Add a description of the changes...')
      .replace('{{jiraTicket}}', formData.jiraTicket ? 
        `[${formData.jiraTicket}](${formData.jiraLink || '#'})` : 
        'Add JIRA ticket reference...')
      .replace('{{testingPlan}}', formData.testingPlan || 'Explain how these changes were tested...');
    
    // Update checkboxes in the rendered template
    Object.keys(checkboxes).forEach((key, index) => {
      const pattern = `- \\[ \\]`;
      const replacement = checkboxes[key] ? '- [x]' : '- [ ]';
      
      // Replace only the nth occurrence
      let count = 0;
      rendered = rendered.replace(new RegExp(pattern, 'g'), (match) => {
        count++;
        return count === index + 1 ? replacement : match;
      });
    });
    
    setRenderedTemplate(rendered);
    
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(`pr_template_${taskId}`, JSON.stringify({
        ...formData,
        checkboxes
      }));
    }
  }, [template, formData, checkboxes, taskId]);

  const handleInputChange = (
    field: 'jiraTicket' | 'jiraLink' | 'description' | 'testingPlan',
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (key: string) => {
    setCheckboxes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(renderedTemplate)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "PR template has been copied to your clipboard",
          variant: "success"
        });
      })
      .catch(err => {
        console.error('Failed to copy template:', err);
        toast({
          title: "Copy failed",
          description: "Could not copy template to clipboard",
          variant: "destructive"
        });
      });
  };

  // Save template data to API
  const saveTemplateData = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/pr-metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save PR metadata');
      }

      toast({
        title: "Template saved",
        description: "Your PR template has been saved",
        variant: "success",
      });

      refreshData();
      router.refresh();
    } catch (error: any) {
      console.error('Error saving PR metadata:', error);
      toast({
        title: "Error",
        description: `Failed to save PR template: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  // Render checkbox items separately for interaction
  const renderCheckboxItems = () => {
    if (!template) return null;
    
    const checkboxMatches = template.match(/- \[ \] (.+)/g) || [];
    
    return checkboxMatches.map((match, index) => {
      const text = match.replace(/- \[ \] /, '');
      const checkboxKey = `checkbox-${index}`;
      
      return (
        <div key={checkboxKey} className="flex items-start gap-2 mb-1">
          <input
            type="checkbox"
            id={checkboxKey}
            checked={checkboxes[checkboxKey] || false}
            onChange={() => handleCheckboxChange(checkboxKey)}
            className="mt-1"
          />
          <label 
            htmlFor={checkboxKey}
            className="text-sm cursor-pointer"
          >
            {text}
          </label>
        </div>
      );
    });
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form inputs */}
        <div className="space-y-4">
          <h3 className="text-base font-medium">PR Information</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <label htmlFor="pr-description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="pr-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the changes..."
                rows={4}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="jira-ticket" className="text-sm font-medium">
                  JIRA Ticket
                </label>
                <Input
                  id="jira-ticket"
                  value={formData.jiraTicket}
                  onChange={(e) => handleInputChange('jiraTicket', e.target.value)}
                  placeholder="e.g. TASK-123"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="jira-link" className="text-sm font-medium">
                  JIRA Link
                </label>
                <Input
                  id="jira-link"
                  value={formData.jiraLink}
                  onChange={(e) => handleInputChange('jiraLink', e.target.value)}
                  placeholder="https://jira.example.com/browse/TASK-123"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="testing-plan" className="text-sm font-medium">
                Testing Plan
              </label>
              <Textarea
                id="testing-plan"
                value={formData.testingPlan}
                onChange={(e) => handleInputChange('testingPlan', e.target.value)}
                placeholder="Explain how you tested these changes..."
                rows={4}
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={saveTemplateData} 
              className="w-full"
            >
              Save Template
            </Button>
          </div>
        </div>
          {/* Template preview and checkboxes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">PR Template</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyToClipboard}
              className="flex items-center"
            >
              <Clipboard className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 border text-sm font-mono whitespace-pre-wrap max-h-[350px] overflow-y-auto">
            {renderedTemplate}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-medium">Checklist</h3>
            <div className="bg-muted/30 rounded-lg p-4 border max-h-[200px] overflow-y-auto">
              {renderCheckboxItems()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
