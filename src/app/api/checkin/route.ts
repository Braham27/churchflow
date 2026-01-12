import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateCheckInCode } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const eventId = searchParams.get("eventId") || "";
    const date = searchParams.get("date") || "";
    const isChildCheckIn = searchParams.get("isChildCheckIn");

    const where: Record<string, unknown> = {
      churchId: churchUser.churchId,
    };

    if (eventId) {
      where.eventId = eventId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.checkInTime = { gte: startOfDay, lte: endOfDay };
    }

    if (isChildCheckIn !== null && isChildCheckIn !== undefined) {
      where.isChildCheckIn = isChildCheckIn === "true";
    }

    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              dateOfBirth: true,
            },
          },
          event: {
            select: { id: true, title: true },
          },
        },
        orderBy: { checkInTime: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.checkIn.count({ where }),
    ]);

    return NextResponse.json({
      checkIns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const body = await request.json();

    const {
      memberId,
      eventId,
      isChildCheckIn,
      parentMemberId,
      notes,
      locationName,
    } = body;

    // Validation
    if (!memberId) {
      return NextResponse.json(
        { error: "Member is required" },
        { status: 400 }
      );
    }

    // Check if member belongs to this church
    const member = await prisma.member.findFirst({
      where: { id: memberId, churchId: churchUser.churchId },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found in this church" },
        { status: 404 }
      );
    }

    // Check if already checked in today for this event
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        memberId,
        eventId: eventId || null,
        checkInTime: { gte: today, lt: tomorrow },
      },
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { error: "Member is already checked in for this event today" },
        { status: 400 }
      );
    }

    // Generate security code for child check-ins
    const securityCode = isChildCheckIn ? generateCheckInCode() : null;

    // Create check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        churchId: churchUser.churchId,
        memberId,
        eventId,
        checkInTime: new Date(),
        checkInMethod: "MANUAL",
        securityCode,
        parentName: isChildCheckIn && parentMemberId ? parentMemberId : null,
        notes,
      },
      include: {
        member: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        event: { select: { id: true, title: true } },
      },
    });

    // Update attendance record for member
    await prisma.attendance.create({
      data: {
        churchId: churchUser.churchId,
        memberId,
        eventId: eventId || null,
        date: new Date(),
        checkInTime: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "checkIn",
        entityId: checkIn.id,
        details: {
          description: `Checked in ${member.firstName} ${member.lastName}${
            isChildCheckIn ? " (child)" : ""
          }`,
          memberName: `${member.firstName} ${member.lastName}`,
        },
      },
    });

    return NextResponse.json(
      {
        ...checkIn,
        securityCode, // Return security code for child check-ins
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}
