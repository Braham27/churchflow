import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getChurchId(userId: string): Promise<string | null> {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId || null;
}

// GET /api/communications/[id] - Get a specific communication
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const { id } = await params;

    const communication = await prisma.communication.findFirst({
      where: { id, churchId },
    });

    if (!communication) {
      return NextResponse.json(
        { error: "Communication not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(communication);
  } catch (error) {
    console.error("Error fetching communication:", error);
    return NextResponse.json(
      { error: "Failed to fetch communication" },
      { status: 500 }
    );
  }
}

// PATCH /api/communications/[id] - Update a communication
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify communication exists and belongs to church
    const existingCommunication = await prisma.communication.findFirst({
      where: { id, churchId },
    });

    if (!existingCommunication) {
      return NextResponse.json(
        { error: "Communication not found" },
        { status: 404 }
      );
    }

    // Only allow editing if not yet sent
    if (existingCommunication.status === "SENT") {
      return NextResponse.json(
        { error: "Cannot edit a sent communication" },
        { status: 400 }
      );
    }

    const {
      subject,
      content,
      type,
      recipientType,
      recipientFilter,
      scheduledFor,
      status,
    } = body;

    const communication = await prisma.communication.update({
      where: { id },
      data: {
        ...(subject !== undefined && { subject }),
        ...(content !== undefined && { content }),
        ...(type && { type }),
        ...(recipientType && { recipientType }),
        ...(recipientFilter !== undefined && { recipientFilter }),
        ...(scheduledFor !== undefined && {
          scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        }),
        ...(status && { status }),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "COMMUNICATION_UPDATED",
        entityType: "COMMUNICATION",
        entityId: id,
        details: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json(communication);
  } catch (error) {
    console.error("Error updating communication:", error);
    return NextResponse.json(
      { error: "Failed to update communication" },
      { status: 500 }
    );
  }
}

// DELETE /api/communications/[id] - Delete a communication
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const { id } = await params;

    // Verify communication exists and belongs to church
    const existingCommunication = await prisma.communication.findFirst({
      where: { id, churchId },
    });

    if (!existingCommunication) {
      return NextResponse.json(
        { error: "Communication not found" },
        { status: 404 }
      );
    }

    // Only allow deleting if not yet sent
    if (existingCommunication.status === "SENT") {
      return NextResponse.json(
        { error: "Cannot delete a sent communication" },
        { status: 400 }
      );
    }

    // Delete the communication
    await prisma.communication.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "COMMUNICATION_DELETED",
        entityType: "COMMUNICATION",
        entityId: id,
        details: {
          subject: existingCommunication.subject,
          type: existingCommunication.type,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting communication:", error);
    return NextResponse.json(
      { error: "Failed to delete communication" },
      { status: 500 }
    );
  }
}
