import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Get donation funds for the church
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

    const funds = await prisma.donationFund.findMany({
      where: { churchId: churchUser.churchId },
      include: {
        _count: {
          select: { donations: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(funds);
  } catch (error) {
    console.error("Error fetching funds:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new donation fund
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
    const { name, description, goalAmount, color, isDefault } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Fund name is required" },
        { status: 400 }
      );
    }

    // If setting as default, unset current default
    if (isDefault) {
      await prisma.donationFund.updateMany({
        where: {
          churchId: churchUser.churchId,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const fund = await prisma.donationFund.create({
      data: {
        churchId: churchUser.churchId,
        name: name.trim(),
        description: description || null,
        goal: goalAmount ? parseFloat(goalAmount) : null,
        isDefault: isDefault || false,
        isActive: true,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "FUND_CREATED",
        entityType: "DonationFund",
        entityId: fund.id,
        details: { name },
      },
    });

    return NextResponse.json(fund, { status: 201 });
  } catch (error) {
    console.error("Error creating fund:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
