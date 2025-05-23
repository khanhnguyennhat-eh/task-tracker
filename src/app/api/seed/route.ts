// File: src/app/api/seed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    console.log('Attempting to create a new task via API endpoint...');

    // Create a simple task
    const task = await prisma.task.create({
      data: {
        title: 'Test task created via API endpoint',
        description: 'This task was created via a special API endpoint to test database connectivity.',
        status: TaskStatus.INVESTIGATION,
        statusHistory: {
          create: {
            status: TaskStatus.INVESTIGATION,
            notes: 'Task created via API endpoint',
          },
        },
      },
    });

    console.log('Task created successfully:', task.id);
    return NextResponse.json({ success: true, taskId: task.id });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message },
      { status: 500 }
    );
  }
}
