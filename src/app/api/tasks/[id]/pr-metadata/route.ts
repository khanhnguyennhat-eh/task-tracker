import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handle GET request to fetch PR metadata
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: taskId } = context.params;

    const prMetadata = await prisma.pRMetadata.findUnique({
      where: {
        taskId,
      },
    });

    if (!prMetadata) {
      return NextResponse.json(
        { error: "PR metadata not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(prMetadata);
  } catch (error) {
    console.error(`Error fetching PR metadata for task ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch PR metadata" },
      { status: 500 }
    );
  }
}

// Handle PUT request to update or create PR metadata
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: taskId } = context.params;
    const { jiraTicket, jiraLink, description, testingPlan } = await req.json();

    // First check if we need to update or create
    const existingMetadata = await prisma.pRMetadata.findUnique({
      where: {
        taskId,
      },
    });

    if (existingMetadata) {
      // Update existing metadata
      const updatedMetadata = await prisma.pRMetadata.update({
        where: {
          id: existingMetadata.id,
        },
        data: {
          jiraTicket,
          jiraLink,
          description,
          testingPlan,
        },
      });
      return NextResponse.json(updatedMetadata);
    } else {
      // Create new metadata
      const newMetadata = await prisma.pRMetadata.create({
        data: {
          taskId,
          jiraTicket,
          jiraLink,
          description,
          testingPlan,
        },
      });
      return NextResponse.json(newMetadata);
    }
  } catch (error) {
    console.error(`Error updating PR metadata for task ${context.params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update PR metadata" },
      { status: 500 }
    );
  }
}
