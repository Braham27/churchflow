import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: Get members of a specific group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's church
    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "No church found" }, { status: 404 });
    }

    const resolvedParams = await params;
    
    const groupMembers = await prisma.groupMember.findMany({
      where: {
        groupId: resolvedParams.id,
        group: { churchId: churchUser.churchId },
      },
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
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json(groupMembers);
  } catch (error) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      { error: "Failed to fetch group members" },
      { status: 500 }
    );
  }
}

// POST: Add a member to a group
export async function POST(
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
    const { memberId, role = "MEMBER" } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Verify group belongs to church
    const group = await prisma.group.findFirst({
      where: { id: resolvedParams.id, churchId: churchUser.churchId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Verify member belongs to church
    const member = await prisma.member.findFirst({
      where: { id: memberId, churchId: churchUser.churchId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if already a member
    const existing = await prisma.groupMember.findFirst({
      where: { groupId: resolvedParams.id, memberId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Member is already in this group" },
        { status: 400 }
      );
    }

    // Check group capacity
    if (group.capacity) {
      const currentCount = await prisma.groupMember.count({
        where: { groupId: resolvedParams.id },
      });

      if (currentCount >= group.capacity) {
        return NextResponse.json(
          { error: "Group is at capacity" },
          { status: 400 }
        );
      }
    }

    const groupMember = await prisma.groupMember.create({
      data: {
        groupId: resolvedParams.id,
        memberId,
        role,
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

    return NextResponse.json(groupMember, { status: 201 });
  } catch (error) {
    console.error("Error adding group member:", error);
    return NextResponse.json(
      { error: "Failed to add group member" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a member from a group
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
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Verify group belongs to church
    const group = await prisma.group.findFirst({
      where: { id: resolvedParams.id, churchId: churchUser.churchId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    await prisma.groupMember.deleteMany({
      where: {
        groupId: resolvedParams.id,
        memberId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing group member:", error);
    return NextResponse.json(
      { error: "Failed to remove group member" },
      { status: 500 }
    );
  }
}
