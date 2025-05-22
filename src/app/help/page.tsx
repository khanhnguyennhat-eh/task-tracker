import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help & Documentation | Task Tracker',
  description: 'Learn how to use Task Tracker effectively with our documentation and guides',
};

export default function HelpPage() {
  return (
    <main className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Help & Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Learn how to use Task Tracker effectively
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/help/getting-started" 
                className="text-primary hover:underline"
              >
                Introduction to Task Tracker
              </Link>
            </li>
            <li>
              <Link 
                href="/help/kanban-board" 
                className="text-primary hover:underline"
              >
                Using the Kanban Board
              </Link>
            </li>
            <li>
              <Link 
                href="/help/task-management" 
                className="text-primary hover:underline"
              >
                Creating and Managing Tasks
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Advanced Features</h2>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/help/workflow" 
                className="text-primary hover:underline"
              >
                Setting Up Your Workflow
              </Link>
            </li>
            <li>
              <Link 
                href="/help/status-transitions" 
                className="text-primary hover:underline"
              >
                Status Transitions and Rules
              </Link>
            </li>
            <li>
              <Link 
                href="/help/checklist" 
                className="text-primary hover:underline"
              >
                Using PR Checklists
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="bg-card rounded-lg border p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">How do I create a new task?</h3>
              <p className="text-muted-foreground">
                Click the "New Task" button in the top-right corner of the Kanban Board 
                or List view to open the task creation dialog.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">Can I move tasks between statuses?</h3>
              <p className="text-muted-foreground">
                Yes, you can drag and drop tasks between columns on the Kanban Board. 
                Tasks will follow the defined workflow rules.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">How do I update a task's details?</h3>
              <p className="text-muted-foreground">
                Click on any task card to open the task details dialog, where you 
                can edit the task description and manage PR checklist items.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-6 bg-muted rounded-lg flex items-center justify-between">
        <div>
          <h3 className="font-medium">Need more help?</h3>
          <p className="text-muted-foreground">Contact support or check our detailed documentation</p>
        </div>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded">
          Contact Support
        </button>
      </div>
    </main>
  );
}
