import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const roleId = searchParams.get("roleId") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {
      churchId: churchUser.churchId,
    };

    if (search) {
      where.member = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (status) {
      where.status = status;
    }

    const [volunteers, total] = await Promise.all([
      prisma.volunteer.findMany({
        where,
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
            where: {
              startTime: { gte: new Date() },
            },
            take: 3,
            orderBy: { startTime: "asc" },
            include: {
              role: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.volunteer.count({ where }),
    ]);

    return NextResponse.json({
      volunteers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
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
      skills,
      availability,
      preferredRoles,
      backgroundCheck,
      backgroundCheckDate,
      trainingCompleted,
      notes,
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

    // Check if already a volunteer
    const existingVolunteer = await prisma.volunteer.findFirst({
      where: { memberId, churchId: churchUser.churchId },
    });

    if (existingVolunteer) {
      return NextResponse.json(
        { error: "This member is already registered as a volunteer" },
        { status: 400 }
      );
    }

    // Create volunteer
    const volunteer = await prisma.volunteer.create({
      data: {
        churchId: churchUser.churchId,
        memberId,
        skills: skills || [],
        availability: availability || null,
        preferredRoles: preferredRoles || [],
        backgroundCheck: backgroundCheck || false,
        backgroundCheckDate: backgroundCheckDate ? new Date(backgroundCheckDate) : null,
        trainingCompleted: trainingCompleted || [],
        notes: notes || null,
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "volunteer",
        entityId: volunteer.id,
        details: { memberName: `${member.firstName} ${member.lastName}` },
      },
    });

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error("Error creating volunteer:", error);
    return NextResponse.json(
      { error: "Failed to create volunteer" },
      { status: 500 }
    );
  }
}
