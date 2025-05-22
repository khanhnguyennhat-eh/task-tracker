import { prisma } from '@/lib/prisma';
import KanbanBoard from '@/components/kanban-board';
import { Task, TaskStatus, StatusHistory, PRChecklistItem } from '@/lib/types';

export default async function Home() {
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
    status: task.status as unknown as TaskStatus,    statusHistory: task.statusHistory.map(h => ({
      id: h.id,
      taskId: h.taskId,
      status: h.status as unknown as TaskStatus,
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
      <KanbanBoard initialTasks={tasks} />
    </main>
  );
}