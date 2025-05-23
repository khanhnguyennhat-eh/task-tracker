import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/types";
import { DEFAULT_PR_CHECKLIST } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        statusHistory: true,
        prChecklist: true,
        prMetadata: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Ensure database is healthy before proceeding    await checkDatabaseHealth();

    const { title, description, prMetadata } = await req.json();

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }// Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: TaskStatus.INVESTIGATION,
        // Create initial status history
        statusHistory: {
          create: {
            status: TaskStatus.INVESTIGATION,
            notes: "Task created",
          },
        },        // Create PR checklist items
        prChecklist: {
          create: DEFAULT_PR_CHECKLIST.map((text) => ({
            text,
            checked: false,
          })),
        },
        // Create PR metadata with provided values or empty strings
        prMetadata: {
          create: {
            jiraTicket: prMetadata?.jiraTicket || "",
            jiraLink: prMetadata?.jiraLink || "",
            description: prMetadata?.description || "",
            testingPlan: prMetadata?.testingPlan || "",
          }
        }
      },
      include: {
        statusHistory: true,
        prChecklist: true,
        prMetadata: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
