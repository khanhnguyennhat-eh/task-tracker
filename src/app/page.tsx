import { prisma } from '@/lib/prisma';
import KanbanBoard from '@/components/kanban-board';
import { Task, TaskStatus, StatusHistory, PRChecklistItem } from '@/lib/types';
import { Metadata } from 'next';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, ListChecks } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Task Tracker | Manage Your Development Tasks',
  description: 'Organize and track tasks through your development workflow with our intuitive kanban board.',
  keywords: 'task management, kanban, development tasks, project tracking',
};

export default async function Home() {
  try {    // Fetch tasks from the database
    const prismaData = await prisma.task.findMany({
      include: {
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        prChecklist: true,
        prMetadata: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });    // Map Prisma data to our Task type
    const tasks: Task[] = prismaData.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      status: task.status as TaskStatus,
      statusHistory: task.statusHistory.map(h => ({
        id: h.id,
        taskId: h.taskId,
        status: h.status as TaskStatus,
        notes: h.notes,
        createdAt: h.createdAt,
      })) as StatusHistory[],
      prChecklist: task.prChecklist.map(item => ({
        id: item.id,
        taskId: item.taskId,
        text: item.text,
        checked: item.checked,
      })) as PRChecklistItem[],
      prMetadata: task.prMetadata ? {
        id: task.prMetadata.id,
        taskId: task.prMetadata.taskId,
        jiraTicket: task.prMetadata.jiraTicket || '',
        jiraLink: task.prMetadata.jiraLink || '',
        description: task.prMetadata.description || '',
        testingPlan: task.prMetadata.testingPlan || '',
      } : undefined,
    }));

    // Calculate task statistics
    const totalTasks = tasks.length;
    const doneTasks = tasks.filter(t => t.status === TaskStatus.DONE).length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const inReviewTasks = tasks.filter(t => t.status === TaskStatus.IN_REVIEW).length;
    const needsAttentionTasks = tasks.filter(t => 
      t.status === TaskStatus.INVESTIGATION || 
      t.status === TaskStatus.PLANNING
    ).length;

    // Get recently updated tasks (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const recentlyUpdated = tasks.filter(t => new Date(t.updatedAt) > oneDayAgo).length;

    return (
      <main className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your development tasks in one place
          </p>
        </div>
      
        {/* Task summary statistics with improved design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-background rounded-xl border p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
              <ListChecks className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{totalTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {completionRate}% completion rate
            </p>
          </div>
          
          <div className="bg-background rounded-xl border p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">In Progress</h3>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">{inProgressTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {inProgressTasks > 0 ? `${Math.round((inProgressTasks / totalTasks) * 100)}% of all tasks` : 'No tasks in progress'}
            </p>
          </div>
          
          <div className="bg-background rounded-xl border p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{doneTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {doneTasks > 0 ? `Last completed ${formatDistanceToNow(
                new Date(tasks.find(t => t.status === TaskStatus.DONE)?.updatedAt || new Date())
              )} ago` : 'No completed tasks yet'}
            </p>
          </div>
          
          <div className="bg-background rounded-xl border p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Needs Attention</h3>
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold">{needsAttentionTasks}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {recentlyUpdated} tasks updated in last 24h
            </p>
          </div>
        </div>
        
        {/* Improved kanban board section */}
        <div className="bg-background border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Task Board</h2>
          <KanbanBoard initialTasks={tasks} />
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return (
      <main className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center bg-muted/40 rounded-lg p-12 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Error Loading Tasks</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            There was a problem loading your tasks. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }
}