'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useTaskUpdates } from '@/lib/useTaskUpdates';

export default function CreateTaskDialog({
  open,  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { refreshData } = useTaskUpdates();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create task');
      }      // Reset form and close dialog
      setFormData({ title: '', description: '' });
      onOpenChange(false);      
      // Refresh the task list
      router.refresh();
      refreshData(); // Call our custom refresh function
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-bold">Create New Task</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add details for your new task. This will start in the Investigation stage.
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
              </label>
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
          </div>
          
          <DialogFooter className="px-6 py-4 border-t">
            <div className="flex gap-2 w-full justify-between sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-6">
                {isSubmitting ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
