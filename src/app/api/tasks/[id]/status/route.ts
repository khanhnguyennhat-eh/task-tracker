import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/types";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Use context.params which is already resolved
    const taskId = context.params.id;
    const { status, notes } = await req.json();

    // Validate required fields
    if (!status || !notes) {
      return NextResponse.json(
        { error: "Status and notes are required" },
        { status: 400 }
      );
    }

    // Check if status is valid
    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Get the current task to check the status transition
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!currentTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }    // Validate the status transition (ensure it follows the correct order)
    const statusOrder = Object.values(TaskStatus);
    const currentStatusIndex = statusOrder.indexOf(currentTask.status as TaskStatus);
    const newStatusIndex = statusOrder.indexOf(status as TaskStatus);

    // Allow direct transitions when the request includes a dragOperation flag
    // This is used for drag-and-drop operations in the Kanban board
    const isDragOperation = req.headers.get('x-drag-operation') === 'true';
    
    if (!isDragOperation && newStatusIndex !== currentStatusIndex + 1) {
      return NextResponse.json(
        { error: "Invalid status transition. Status must progress in sequence." },
        { status: 400 }
      );
    }

    // For IN_REVIEW -> DONE transition, check if all PR checklist items are checked
    if (
      currentTask.status === TaskStatus.IN_REVIEW &&
      status === TaskStatus.DONE
    ) {
      const prChecklist = await prisma.pRChecklistItem.findMany({
        where: { taskId },
      });

      const allChecked = prChecklist.every((item) => item.checked);
      if (!allChecked) {
        return NextResponse.json(
          {
            error:
              "All PR checklist items must be checked before marking as Done",
          },
          { status: 400 }
        );
      }
    }

    // Update the task status and add to history
    const [updatedTask, _] = await prisma.$transaction([
      // Update task status
      prisma.task.update({
        where: { id: taskId },
        data: {
          status: status as TaskStatus,
        },
        include: {
          statusHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
          prChecklist: true,
        },
      }),
      // Add status history entry
      prisma.statusHistory.create({
        data: {
          taskId,
          status: status as TaskStatus,
          notes,
        },
      }),
    ]);    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Error updating status for task ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update task status" },
      { status: 500 }
    );
  }
}
