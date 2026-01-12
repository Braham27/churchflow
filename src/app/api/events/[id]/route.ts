import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: Get a specific event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "No church found" }, { status: 404 });
    }

    const resolvedParams = await params;

    const event = await prisma.event.findFirst({
      where: { id: resolvedParams.id, churchId: churchUser.churchId },
      include: {
        registrations: true,
        attendances: {
          include: {
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}

// PATCH: Update an event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "No church found" }, { status: 404 });
    }

    const resolvedParams = await params;
    const body = await request.json();

    // Verify event belongs to church
    const existingEvent = await prisma.event.findFirst({
      where: { id: resolvedParams.id, churchId: churchUser.churchId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      location,
      eventType,
      isRecurring,
      recurringPattern,
      maxAttendees,
      requiresRegistration,
      isPublic,
      enableCheckIn,
    } = body;

    const event = await prisma.event.update({
      where: { id: resolvedParams.id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        isRecurring,
        recurrenceRule: recurringPattern,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        requiresRegistration,
        isPublic,
        enableCheckIn,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE: Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "No church found" }, { status: 404 });
    }

    const resolvedParams = await params;

    // Verify event belongs to church
    const existingEvent = await prisma.event.findFirst({
      where: { id: resolvedParams.id, churchId: churchUser.churchId },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete related records first
    await prisma.eventRegistration.deleteMany({
      where: { eventId: resolvedParams.id },
    });

    await prisma.attendance.deleteMany({
      where: { eventId: resolvedParams.id },
    });

    // Delete the event
    await prisma.event.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
