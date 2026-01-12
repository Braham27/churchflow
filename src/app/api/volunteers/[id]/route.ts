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

// GET /api/volunteers/[id] - Get a specific volunteer
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

    const volunteer = await prisma.volunteer.findFirst({
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
          },
        },
        shifts: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                startDate: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
                description: true,
                ministry: true,
              },
            },
          },
          orderBy: { startTime: "desc" },
          take: 20,
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json({ error: "Volunteer not found" }, { status: 404 });
    }

    // Calculate total hours served
    const totalMinutes = volunteer.shifts.reduce((acc, shift) => {
      if (shift.startTime && shift.endTime) {
        const start = new Date(shift.startTime).getTime();
        const end = new Date(shift.endTime).getTime();
        return acc + (end - start) / (1000 * 60);
      }
      return acc;
    }, 0);

    return NextResponse.json({
      ...volunteer,
      totalHoursServed: Math.round(totalMinutes / 60),
    });
  } catch (error) {
    console.error("Error fetching volunteer:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer" },
      { status: 500 }
    );
  }
}

// PATCH /api/volunteers/[id] - Update a volunteer
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

    // Verify volunteer exists and belongs to church
    const existingVolunteer = await prisma.volunteer.findFirst({
      where: { id, churchId },
    });

    if (!existingVolunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    const {
      roleId,
      status,
      skills,
      availability,
      preferredRoles,
      backgroundCheck,
      backgroundCheckDate,
      trainingCompleted,
      notes,
      isActive,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (skills !== undefined) updateData.skills = skills;
    if (availability !== undefined) updateData.availability = availability;
    if (preferredRoles !== undefined) updateData.preferredRoles = preferredRoles;
    if (backgroundCheck !== undefined) updateData.backgroundCheck = backgroundCheck;
    if (backgroundCheckDate !== undefined) {
      updateData.backgroundCheckDate = backgroundCheckDate ? new Date(backgroundCheckDate) : null;
    }
    if (trainingCompleted !== undefined) updateData.trainingCompleted = trainingCompleted;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;

    const volunteer = await prisma.volunteer.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "VOLUNTEER_UPDATED",
        entityType: "VOLUNTEER",
        entityId: id,
        details: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json(volunteer);
  } catch (error) {
    console.error("Error updating volunteer:", error);
    return NextResponse.json(
      { error: "Failed to update volunteer" },
      { status: 500 }
    );
  }
}

// DELETE /api/volunteers/[id] - Delete a volunteer
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

    // Verify volunteer exists and belongs to church
    const existingVolunteer = await prisma.volunteer.findFirst({
      where: { id, churchId },
      include: {
        member: { select: { firstName: true, lastName: true } },
      },
    });

    if (!existingVolunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    // Delete related shifts first
    await prisma.volunteerShift.deleteMany({
      where: { volunteerId: id },
    });

    // Delete the volunteer
    await prisma.volunteer.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "VOLUNTEER_DELETED",
        entityType: "VOLUNTEER",
        entityId: id,
        details: {
          memberName: `${existingVolunteer.member.firstName} ${existingVolunteer.member.lastName}`,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting volunteer:", error);
    return NextResponse.json(
      { error: "Failed to delete volunteer" },
      { status: 500 }
    );
  }
}
