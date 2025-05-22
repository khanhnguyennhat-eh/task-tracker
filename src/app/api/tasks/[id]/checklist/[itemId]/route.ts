import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string; itemId: string } }
) {
  try {
    const { id: taskId, itemId } = context.params;
    const { checked } = await req.json();

    // Validate
    if (checked === undefined) {
      return NextResponse.json(
        { error: "Checked status is required" },
        { status: 400 }
      );
    }

    // Update the checklist item
    const updatedItem = await prisma.pRChecklistItem.update({
      where: {
        id: itemId,
        taskId, // Ensuring the item belongs to the specified task
      },
      data: {
        checked,
      },
    });    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(
      `Error updating PR checklist item ${context.params.itemId} for task ${context.params.id}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to update PR checklist item" },
      { status: 500 }
    );
  }
}
