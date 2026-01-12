import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET: Get a specific member by ID
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

    const member = await prisma.member.findFirst({
      where: { id: resolvedParams.id, churchId: churchUser.churchId },
      include: {
        family: {
          include: {
            members: {
              where: { id: { not: resolvedParams.id } },
              select: {
                id: true,
                firstName: true,
                lastName: true,
                familyRole: true,
              },
            },
          },
        },
        groupMemberships: {
          include: {
            group: {
              select: { id: true, name: true, category: true },
            },
          },
        },
        donations: {
          orderBy: { donatedAt: "desc" },
          take: 10,
          include: {
            fund: { select: { name: true } },
          },
        },
        volunteerProfile: true,
        attendances: {
          orderBy: { checkInTime: "desc" },
          take: 10,
          include: {
            event: { select: { title: true } },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

// PATCH: Update a member
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

    // Verify member belongs to church
    const existingMember = await prisma.member.findFirst({
      where: { id: resolvedParams.id, churchId: churchUser.churchId },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      dateOfBirth,
      membershipDate,
      membershipStatus,
      notes,
      photo,
      alternatePhone,
    } = body;

    const member = await prisma.member.update({
      where: { id: resolvedParams.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        membershipDate: membershipDate ? new Date(membershipDate) : undefined,
        membershipStatus,
        notes,
        photo,
        alternatePhone,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "MEMBER_UPDATED",
        entityType: "MEMBER",
        entityId: member.id,
        details: { message: `Updated member: ${member.firstName} ${member.lastName}` },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a member
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

    // Verify member belongs to church
    const existingMember = await prisma.member.findFirst({
      where: { id: resolvedParams.id, churchId: churchUser.churchId },
    });

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Delete related records first
    await prisma.groupMember.deleteMany({
      where: { memberId: resolvedParams.id },
    });

    await prisma.attendance.deleteMany({
      where: { memberId: resolvedParams.id },
    });

    // Delete the member
    await prisma.member.delete({
      where: { id: resolvedParams.id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "MEMBER_DELETED",
        entityType: "MEMBER",
        entityId: resolvedParams.id,
        details: { message: `Deleted member: ${existingMember.firstName} ${existingMember.lastName}` },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting member:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}
