import { prisma } from '@/lib/prisma';
import { Task, TaskStatus, StatusHistory, PRChecklistItem } from '@/lib/types';
import { Metadata } from 'next';
import TaskGrid from '@/components/task-grid';

export const metadata: Metadata = {
  title: 'Task List | Task Tracker',
  description: 'View your tasks in a list format. Filter, sort, and manage your development tasks easily.',
};

export default async function ListPage() {
  try {
    // Fetch tasks from the database
    const prismaData = await prisma.task.findMany({
      include: {
        statusHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        prChecklist: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Map Prisma data to our Task type
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
    }));
    
    return (
      <main className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Task List</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your tasks in a list format
          </p>
        </div>
        <TaskGrid initialTasks={tasks} />
      </main>
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return (
      <main className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center bg-muted/40 rounded-lg p-12 text-center">
          <h3 className="text-lg font-medium">Error Loading Tasks</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            There was a problem loading your tasks. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }
}
