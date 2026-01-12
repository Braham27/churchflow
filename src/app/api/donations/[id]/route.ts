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

// GET /api/donations/[id] - Get a specific donation
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

    const donation = await prisma.donation.findFirst({
      where: { id, churchId },
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
        fund: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error fetching donation:", error);
    return NextResponse.json(
      { error: "Failed to fetch donation" },
      { status: 500 }
    );
  }
}

// PATCH /api/donations/[id] - Update a donation
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

    // Verify donation exists and belongs to church
    const existingDonation = await prisma.donation.findFirst({
      where: { id, churchId },
    });

    if (!existingDonation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    const {
      amount,
      date,
      method,
      fundId,
      memberId,
      notes,
      isRecurring,
      recurringFrequency,
      receiptSent,
      taxDeductible,
    } = body;

    const donation = await prisma.donation.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(date && { date: new Date(date) }),
        ...(method && { method }),
        ...(fundId !== undefined && { fundId }),
        ...(memberId !== undefined && { memberId }),
        ...(notes !== undefined && { notes }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurringFrequency !== undefined && { recurringFrequency }),
        ...(receiptSent !== undefined && { receiptSent }),
        ...(taxDeductible !== undefined && { taxDeductible }),
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        fund: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "DONATION_UPDATED",
        entityType: "DONATION",
        entityId: id,
        details: { updatedFields: Object.keys(body) },
      },
    });

    return NextResponse.json(donation);
  } catch (error) {
    console.error("Error updating donation:", error);
    return NextResponse.json(
      { error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

// DELETE /api/donations/[id] - Delete a donation
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

    // Verify donation exists and belongs to church
    const existingDonation = await prisma.donation.findFirst({
      where: { id, churchId },
      include: {
        member: { select: { firstName: true, lastName: true } },
      },
    });

    if (!existingDonation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // Delete the donation
    await prisma.donation.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "DONATION_DELETED",
        entityType: "DONATION",
        entityId: id,
        details: {
          amount: existingDonation.amount,
          memberName: existingDonation.member
            ? `${existingDonation.member.firstName} ${existingDonation.member.lastName}`
            : "Anonymous",
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting donation:", error);
    return NextResponse.json(
      { error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
