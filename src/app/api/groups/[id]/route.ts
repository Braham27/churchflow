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

// GET /api/groups/[id] - Get a specific group
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

    const group = await prisma.group.findFirst({
      where: { id, churchId },
      include: {
        members: {
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
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Get leader info if leaderId exists
    let leader = null;
    if (group.leaderId) {
      leader = await prisma.member.findUnique({
        where: { id: group.leaderId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          photo: true,
        },
      });
    }

    return NextResponse.json({ ...group, leader });
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}

// PATCH /api/groups/[id] - Update a group
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

    // Verify group exists and belongs to church
    const existingGroup = await prisma.group.findFirst({
      where: { id, churchId },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const {
      name,
      description,
      category,
      status,
      leaderId,
      location,
      meetingDay,
      meetingTime,
      maxMembers,
      isPublic,
    } = body;

    const group = await prisma.group.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(leaderId !== undefined && { leaderId }),
        ...(location !== undefined && { location }),
        ...(meetingDay !== undefined && { meetingDay }),
        ...(meetingTime !== undefined && { meetingTime }),
        ...(maxMembers !== undefined && { capacity: maxMembers }),
        ...(isPublic !== undefined && { isPublic }),
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "GROUP_UPDATED",
        entityType: "GROUP",
        entityId: id,
        details: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Failed to update group" },
      { status: 500 }
    );
  }
}

// DELETE /api/groups/[id] - Delete a group
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

    // Verify group exists and belongs to church
    const existingGroup = await prisma.group.findFirst({
      where: { id, churchId },
      include: {
        _count: { select: { members: true } },
      },
    });

    if (!existingGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Delete related group members first
    await prisma.groupMember.deleteMany({
      where: { groupId: id },
    });

    // Delete the group
    await prisma.group.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "GROUP_DELETED",
        entityType: "GROUP",
        entityId: id,
        details: {
          groupName: existingGroup.name,
          memberCount: existingGroup._count.members,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Failed to delete group" },
      { status: 500 }
    );
  }
}
