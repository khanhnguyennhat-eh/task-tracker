// File: src/app/api/seed-complex/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/types";
import { DEFAULT_PR_CHECKLIST } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    console.log('Creating a complex task with all relations...');

    // Create a comprehensive task
    const task = await prisma.task.create({
      data: {
        title: 'Implement URL query parameter filtering',
        description: 'Add support for filtering tasks by status using URL query parameters. This will allow users to share filtered views by copying the URL.',
        status: TaskStatus.IN_PROGRESS,
        statusHistory: {
          createMany: {
            data: [
              {
                status: TaskStatus.INVESTIGATION,
                notes: 'Investigating best approach for URL parameter filtering.',
                createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
              },
              {
                status: TaskStatus.PLANNING,
                notes: 'Planning implementation. Will use Next.js built-in support for query parameters.',
                createdAt: new Date(Date.now() - 2 * 86400000), // 2 days ago
              },
              {
                status: TaskStatus.IN_PROGRESS,
                notes: 'Implementation in progress. Basic filtering working, need to add UI for filter selection.',
                createdAt: new Date(Date.now() - 1 * 86400000), // 1 day ago
              },
            ],
          },
        },
        prChecklist: {
          create: DEFAULT_PR_CHECKLIST.map((text, index) => ({
            text,
            checked: index < 3, // First 3 items checked
          })),
        },
        prMetadata: {
          create: {
            jiraTicket: "TASK-456",
            jiraLink: "https://jira.example.com/TASK-456",
            description: "This PR adds URL query parameter filtering for tasks, allowing users to filter by status and share links to filtered views.",
            testingPlan: "Test all filter combinations, ensure URL parameters are correctly applied and persist across page refreshes."
          }
        }
      },
      include: {
        statusHistory: true,
        prChecklist: true,
        prMetadata: true,
      },
    });

    console.log('Complex task created successfully with ID:', task.id);
    return NextResponse.json({ success: true, taskId: task.id, task });
  } catch (error) {
    console.error('Error creating complex task:', error);
    return NextResponse.json(
      { error: 'Failed to create complex task', details: error.message },
      { status: 500 }
    );
  }
}
