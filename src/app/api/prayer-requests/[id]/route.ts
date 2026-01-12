import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to get church ID for current user
async function getChurchId(userId: string): Promise<string | null> {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId ?? null;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/prayer-requests/[id]
 * Get a specific prayer request
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const prayerRequest = await prisma.prayerRequest.findFirst({
      where: {
        id,
        churchId,
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!prayerRequest) {
      return NextResponse.json(
        { error: "Prayer request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(prayerRequest);
  } catch (error) {
    console.error("Error fetching prayer request:", error);
    return NextResponse.json(
      { error: "Failed to fetch prayer request" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/prayer-requests/[id]
 * Update a prayer request
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Check if request exists
    const existing = await prisma.prayerRequest.findFirst({
      where: { id, churchId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Prayer request not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, status, isPrivate, isAnonymous, category } = body;

    // Build update data
    interface UpdateData {
      title?: string;
      description?: string;
      status?: "PENDING" | "PRAYING" | "ANSWERED";
      isPrivate?: boolean;
      isAnonymous?: boolean;
      category?: string;
      answeredAt?: Date;
    }
    
    const updateData: UpdateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) {
      updateData.status = status;
      if (status === "ANSWERED") {
        updateData.answeredAt = new Date();
      }
    }
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
    if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;
    if (category !== undefined) updateData.category = category;

    const updated = await prisma.prayerRequest.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating prayer request:", error);
    return NextResponse.json(
      { error: "Failed to update prayer request" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prayer-requests/[id]
 * Delete a prayer request
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if request exists
    const existing = await prisma.prayerRequest.findFirst({
      where: { id, churchId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Prayer request not found" },
        { status: 404 }
      );
    }

    await prisma.prayerRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting prayer request:", error);
    return NextResponse.json(
      { error: "Failed to delete prayer request" },
      { status: 500 }
    );
  }
}
