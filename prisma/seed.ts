// This is a script to initialize the database with the Prisma schema

import { PrismaClient, TaskStatus } from '@prisma/client';
import { DEFAULT_PR_CHECKLIST } from '../src/lib/types';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database initialization...');

  // Create a sample task
  const task = await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Add user authentication to the application using NextAuth.js. This should include login, registration, and password reset functionality.',
      status: TaskStatus.INVESTIGATION,
      statusHistory: {
        create: {
          status: TaskStatus.INVESTIGATION,
          notes: 'Task created and investigation started. Need to research the best authentication solution for Next.js.',
        },
      },
      prChecklist: {
        create: DEFAULT_PR_CHECKLIST.map((text) => ({
          text,
          checked: false,
        })),
      },
    },
  });

  // Create another sample task in a different status
  const task2 = await prisma.task.create({
    data: {
      title: 'Refactor database queries',
      description: 'Optimize database queries to improve performance. Some queries are taking too long to execute, particularly on the user dashboard.',
      status: TaskStatus.PLANNING,
      statusHistory: {
        createMany: {
          data: [
            {
              status: TaskStatus.INVESTIGATION,
              notes: 'Initial investigation of slow queries. Identified several N+1 query problems.',
              createdAt: new Date(Date.now() - 86400000), // 1 day ago
            },
            {
              status: TaskStatus.PLANNING,
              notes: 'Planning database optimizations. Will use query batching and improve indexes.',
              createdAt: new Date(),
            },
          ],
        },
      },
      prChecklist: {
        create: DEFAULT_PR_CHECKLIST.map((text) => ({
          text,
          checked: false,
        })),
      },
    },
  });

  // Create a third task that's further along
  const task3 = await prisma.task.create({
    data: {
      title: 'Implement dark mode',
      description: 'Add dark mode support to the application. This should include a toggle in the UI and respect system preferences.',
      status: TaskStatus.IN_REVIEW,
      statusHistory: {
        createMany: {
          data: [
            {
              status: TaskStatus.INVESTIGATION,
              notes: 'Investigated approaches for implementing dark mode. Will use CSS variables and Tailwind.',
              createdAt: new Date(Date.now() - 5 * 86400000), // 5 days ago
            },
            {
              status: TaskStatus.PLANNING,
              notes: 'Planned implementation approach. Will create a theme context and add toggle button.',
              createdAt: new Date(Date.now() - 4 * 86400000), // 4 days ago
            },
            {
              status: TaskStatus.IN_PROGRESS,
              notes: 'Implemented theme switching logic and updated color variables.',
              createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
            },
            {
              status: TaskStatus.IN_TESTING,
              notes: 'Testing dark mode on different browsers and devices. Fixed some issues with contrast.',
              createdAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
            },
            {
              status: TaskStatus.IN_REVIEW,
              notes: 'Dark mode implementation complete. PR submitted for review.',
              createdAt: new Date(Date.now() - 1 * 86400000), // 1 day ago
            },
          ],
        },
      },
      prChecklist: {
        create: DEFAULT_PR_CHECKLIST.map((text, index) => ({
          text,
          checked: index < 5, // First 5 items checked
        })),
      },
    },
  });

  console.log('Database initialization completed successfully!');
  console.log(`Created tasks with IDs: ${task.id}, ${task2.id}, ${task3.id}`);
}

main()
  .catch((e) => {
    console.error('Error initializing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
