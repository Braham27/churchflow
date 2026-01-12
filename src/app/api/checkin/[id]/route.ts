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

// GET /api/checkin/[id] - Get a specific check-in
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

    const checkIn = await prisma.checkIn.findFirst({
      where: { id, churchId },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photo: true,
            membershipStatus: true,
            dateOfBirth: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            category: true,
          },
        },
      },
    });

    if (!checkIn) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error("Error fetching check-in:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-in" },
      { status: 500 }
    );
  }
}

// PATCH /api/checkin/[id] - Update a check-in (e.g., check out)
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

    // Verify check-in exists and belongs to church
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: { id, churchId },
    });

    if (!existingCheckIn) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }

    const { checkOutTime, notes, location } = body;

    const checkIn = await prisma.checkIn.update({
      where: { id },
      data: {
        ...(checkOutTime && {
          checkOutTime: new Date(checkOutTime),
          checkedOutById: session.user.id,
        }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CHECKIN_UPDATED",
        entityType: "CHECKIN",
        entityId: id,
        details: {
          memberName: `${checkIn.member?.firstName} ${checkIn.member?.lastName}`,
          eventTitle: checkIn.event.title,
        },
      },
    });

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error("Error updating check-in:", error);
    return NextResponse.json(
      { error: "Failed to update check-in" },
      { status: 500 }
    );
  }
}

// DELETE /api/checkin/[id] - Delete a check-in
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

    // Verify check-in exists and belongs to church
    const existingCheckIn = await prisma.checkIn.findFirst({
      where: { id, churchId },
      include: {
        member: { select: { firstName: true, lastName: true } },
        event: { select: { title: true } },
      },
    });

    if (!existingCheckIn) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }

    // Delete the check-in
    await prisma.checkIn.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CHECKIN_DELETED",
        entityType: "CHECKIN",
        entityId: id,
        details: {
          memberName: `${existingCheckIn.member?.firstName} ${existingCheckIn.member?.lastName}`,
          eventTitle: existingCheckIn.event.title,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting check-in:", error);
    return NextResponse.json(
      { error: "Failed to delete check-in" },
      { status: 500 }
    );
  }
}
