import { prisma } from '@/lib/prisma';
import TaskGrid from '@/components/task-grid';

export default async function Home() {
  // Fetch tasks from the database
  const tasks = await prisma.task.findMany({
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

  return (
    <main className="container mx-auto py-6">
      <TaskGrid initialTasks={tasks} />
    </main>
  );
}