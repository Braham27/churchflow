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

    const roles = await prisma.volunteerRole.findMany({
      where: { churchId: churchUser.churchId },
      include: {
        _count: { select: { shifts: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error("Error fetching volunteer roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer roles" },
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
      name,
      description,
      ministry,
      requiresBackgroundCheck,
      requiredTraining,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Role name is required" },
        { status: 400 }
      );
    }

    // Check for duplicate role name
    const existingRole = await prisma.volunteerRole.findFirst({
      where: {
        churchId: churchUser.churchId,
        name: { equals: name, mode: "insensitive" },
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "A role with this name already exists" },
        { status: 400 }
      );
    }

    const role = await prisma.volunteerRole.create({
      data: {
        churchId: churchUser.churchId,
        name,
        description: description || null,
        ministry: ministry || null,
        requiresBackgroundCheck: requiresBackgroundCheck || false,
        requiredTraining: requiredTraining || [],
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "volunteerRole",
        entityId: role.id,
        details: { name },
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Error creating volunteer role:", error);
    return NextResponse.json(
      { error: "Failed to create volunteer role" },
      { status: 500 }
    );
  }
}
