import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - List all groups for the church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
      include: { church: { select: { id: true } } },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const whereClause: Record<string, unknown> = {
      churchId: churchUser.churchId,
    };

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const groups = await prisma.group.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    // Get available categories for filtering
    const categories = await prisma.group.findMany({
      where: { churchId: churchUser.churchId },
      select: { category: true },
      distinct: ["category"],
    });

    return NextResponse.json({
      groups,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
      include: { church: { select: { id: true } } },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      category,
      meetingSchedule,
      meetingLocation,
      leaderId,
      maxMembers,
      isOpen,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    // Verify leader belongs to this church if provided
    if (leaderId) {
      const leader = await prisma.member.findFirst({
        where: {
          id: leaderId,
          churchId: churchUser.churchId,
        },
      });

      if (!leader) {
        return NextResponse.json(
          { error: "Leader not found in church" },
          { status: 400 }
        );
      }
    }

    const group = await prisma.group.create({
      data: {
        churchId: churchUser.churchId,
        name,
        description: description || null,
        category: category || "SMALL_GROUP",
        meetingDay: meetingSchedule || null,
        location: meetingLocation || null,
        leaderId: leaderId || null,
        capacity: maxMembers ? parseInt(maxMembers) : null,
        isPublic: isOpen !== undefined ? isOpen : true,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "GROUP_CREATED",
        entityType: "Group",
        entityId: group.id,
        details: { name },
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
