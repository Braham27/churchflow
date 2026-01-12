import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to get church ID for current user
async function getChurchId(userId: string): Promise<string | null> {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId ?? null;
}

/**
 * GET /api/prayer-requests
 * Fetch prayer requests for the church
 */
export async function GET(request: NextRequest) {
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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Check if user is leader (can see private requests)
    const userRole = await prisma.churchUser.findFirst({
      where: { userId: session.user.id, churchId },
      select: { role: true },
    });
    
    const isLeader = ["OWNER", "ADMIN", "PASTOR"].includes(userRole?.role || "");

    // Build where clause
    type PrayerStatus = "PENDING" | "PRAYING" | "ANSWERED";
    interface WhereClause {
      churchId: string;
      status?: PrayerStatus;
      OR?: Array<{ isPrivate: boolean } | { memberId: string | null }>;
    }
    
    const where: WhereClause = { churchId };

    if (status && ["PENDING", "PRAYING", "ANSWERED"].includes(status)) {
      where.status = status as PrayerStatus;
    }

    // Non-leaders can only see public requests or their own
    if (!isLeader) {
      where.OR = [
        { isPrivate: false },
        { memberId: session.user.id },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.prayerRequest.findMany({
        where,
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.prayerRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching prayer requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch prayer requests" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prayer-requests
 * Create a new prayer request
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, isPrivate = false, isAnonymous = false, category } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Find member record for this user
    const member = await prisma.member.findFirst({
      where: { 
        churchId,
        email: session.user.email || undefined,
      },
    });

    const prayerRequest = await prisma.prayerRequest.create({
      data: {
        churchId,
        memberId: member?.id,
        title,
        description,
        isPrivate,
        isAnonymous,
        category,
        status: "PENDING",
        prayerCount: 0,
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(prayerRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating prayer request:", error);
    return NextResponse.json(
      { error: "Failed to create prayer request" },
      { status: 500 }
    );
  }
}
