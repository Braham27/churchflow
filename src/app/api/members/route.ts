import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MembershipStatus } from "@prisma/client";

async function getChurchId(userId: string) {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId;
}

// GET - List all members
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
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = {
      churchId,
      isActive: true,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(status && { membershipStatus: status as MembershipStatus }),
    };

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        include: {
          family: true,
          _count: {
            select: {
              donations: true,
              attendances: true,
            },
          },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.member.count({ where }),
    ]);

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST - Create a new member
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

    // Check member limit
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      include: { _count: { select: { members: true } } },
    });

    if (church && church._count.members >= church.maxMembers) {
      return NextResponse.json(
        { error: "Member limit reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Check for duplicate email if provided
    if (body.email) {
      const existingMember = await prisma.member.findFirst({
        where: {
          churchId,
          email: body.email,
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "A member with this email already exists" },
          { status: 400 }
        );
      }
    }

    const member = await prisma.member.create({
      data: {
        churchId,
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName || null,
        email: body.email || null,
        phone: body.phone || null,
        alternatePhone: body.alternatePhone || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || null,
        maritalStatus: body.maritalStatus || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        country: body.country || null,
        postalCode: body.postalCode || null,
        membershipStatus: body.membershipStatus || "VISITOR",
        membershipDate: body.membershipDate ? new Date(body.membershipDate) : null,
        baptismDate: body.baptismDate ? new Date(body.baptismDate) : null,
        skills: body.skills || [],
        interests: body.interests || [],
        notes: body.notes || null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "MEMBER",
        entityId: member.id,
        details: { memberName: `${member.firstName} ${member.lastName}` },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}
