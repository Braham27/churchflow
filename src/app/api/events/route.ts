import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateCheckInCode } from "@/lib/utils";
import { EventCategory, Prisma } from "@prisma/client";

async function getChurchId(userId: string) {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId;
}

// GET - List all events
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);

    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get("upcoming") === "true";
    const past = searchParams.get("past") === "true";
    const category = searchParams.get("category");

    const now = new Date();

    const where: Prisma.EventWhereInput = {
      churchId,
      ...(upcoming && { startDate: { gte: now } }),
      ...(past && { startDate: { lt: now } }),
      ...(category && { category: category as EventCategory }),
    };

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: upcoming ? "asc" : "desc" },
      include: {
        group: { select: { id: true, name: true } },
        _count: {
          select: {
            registrations: true,
            checkIns: true,
            volunteerShifts: true,
          },
        },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST - Create a new event
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);

    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.startDate) {
      return NextResponse.json(
        { error: "Title and start date are required" },
        { status: 400 }
      );
    }

    // Generate unique check-in code if check-in is enabled
    let checkInCode = null;
    if (body.enableCheckIn) {
      checkInCode = generateCheckInCode();
      // Ensure uniqueness
      let exists = await prisma.event.findFirst({ where: { checkInCode } });
      while (exists) {
        checkInCode = generateCheckInCode();
        exists = await prisma.event.findFirst({ where: { checkInCode } });
      }
    }

    const event = await prisma.event.create({
      data: {
        churchId,
        title: body.title,
        description: body.description || null,
        location: body.location || null,
        address: body.address || null,
        category: body.category || "OTHER",
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : new Date(body.startDate),
        allDay: body.allDay || false,
        isRecurring: body.isRecurring || false,
        recurrenceRule: body.recurrenceRule || null,
        requiresRegistration: body.requiresRegistration || false,
        maxAttendees: body.maxAttendees || null,
        isPublic: body.isPublic !== false,
        isPublished: true,
        publishToWebsite: body.publishToWebsite || false,
        enableCheckIn: body.enableCheckIn || false,
        checkInCode,
        isLiveStream: body.isLiveStream || false,
        streamUrl: body.streamUrl || null,
        streamPlatform: body.streamPlatform || null,
        groupId: body.groupId || null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "EVENT",
        entityId: event.id,
        details: { eventTitle: event.title },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
