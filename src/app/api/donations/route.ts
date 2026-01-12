import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getGivingBadge } from "@/lib/utils";

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
    const fundId = searchParams.get("fundId") || "";
    const paymentMethod = searchParams.get("paymentMethod") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const where: Record<string, unknown> = {
      churchId: churchUser.churchId,
    };

    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: "insensitive" } },
        { donorEmail: { contains: search, mode: "insensitive" } },
        { member: { firstName: { contains: search, mode: "insensitive" } } },
        { member: { lastName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (fundId) {
      where.fundId = fundId;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      where.donatedAt = {};
      if (startDate) {
        (where.donatedAt as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.donatedAt as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const [donations, total] = await Promise.all([
      prisma.donation.findMany({
        where,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          fund: { select: { id: true, name: true } },
        },
        orderBy: { donatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.donation.count({ where }),
    ]);

    return NextResponse.json({
      donations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { error: "Failed to fetch donations" },
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
      amount,
      paymentMethod,
      donorName,
      donorEmail,
      memberId,
      fundId,
      notes,
      isAnonymous,
      isRecurring,
      recurringFrequency,
      checkNumber,
      transactionId,
      donatedAt,
    } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid donation amount is required" },
        { status: 400 }
      );
    }

    // If fundId is not provided, use the default fund
    let actualFundId = fundId;
    if (!actualFundId) {
      const defaultFund = await prisma.donationFund.findFirst({
        where: {
          churchId: churchUser.churchId,
          isDefault: true,
        },
      });

      if (!defaultFund) {
        // Create a default General Fund if none exists
        const generalFund = await prisma.donationFund.create({
          data: {
            churchId: churchUser.churchId,
            name: "General Fund",
            description: "General church fund for tithes and offerings",
            isDefault: true,
            isActive: true,
          },
        });
        actualFundId = generalFund.id;
      } else {
        actualFundId = defaultFund.id;
      }
    }

    // Create the donation
    const donation = await prisma.donation.create({
      data: {
        churchId: churchUser.churchId,
        amount,
        paymentMethod: paymentMethod || "CASH",
        paymentStatus: "COMPLETED", // Manual entries are considered completed
        donorName: isAnonymous ? null : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        memberId: memberId || null,
        fundId: actualFundId,
        notes: checkNumber ? `Check #${checkNumber}. ${notes || ""}` : notes,
        isAnonymous: isAnonymous || false,
        isRecurring: isRecurring || false,
        recurringFrequency: isRecurring ? recurringFrequency : null,
        transactionId,
        donatedAt: donatedAt ? new Date(donatedAt) : new Date(),
      },
      include: {
        member: { select: { id: true, firstName: true, lastName: true } },
        fund: { select: { id: true, name: true } },
      },
    });

    // Update fund raised amount
    await prisma.donationFund.update({
      where: { id: actualFundId },
      data: { raised: { increment: amount } },
    });

    // If linked to a member, update their giving stats and badge
    if (memberId) {
      // Get total giving for this member (last 12 months for annual badge)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const totalGiving = await prisma.donation.aggregate({
        where: {
          memberId,
          paymentStatus: "COMPLETED",
          donatedAt: { gte: oneYearAgo },
        },
        _sum: { amount: true },
      });

      const totalAmount = totalGiving._sum.amount || 0;
      // Using a default estimated income of $50,000 for badge calculation
      const badge = getGivingBadge(Number(totalAmount), 50000);

      await prisma.member.update({
        where: { id: memberId },
        data: { givingBadge: badge },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "donation",
        entityId: donation.id,
        details: { amount, donor: isAnonymous ? "Anonymous" : donorName || "Guest" },
      },
    });

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    console.error("Error creating donation:", error);
    return NextResponse.json(
      { error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
