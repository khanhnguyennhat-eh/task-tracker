import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const taskId = context.params.id; const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        statusHistory: {
          orderBy: {
            createdAt: "desc",
          },
        },
        prChecklist: true,
        prMetadata: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    } return NextResponse.json(task);
  } catch (error) {
    console.error(`Error fetching task ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const taskId = context.params.id;
    const { title, description } = await req.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
      },
      include: {
        statusHistory: true,
        prChecklist: true,
      },
    }); return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Error updating task ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const taskId = context.params.id;

    // Delete the task
    await prisma.task.delete({
      where: { id: taskId },
    }); return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(`Error deleting task ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
