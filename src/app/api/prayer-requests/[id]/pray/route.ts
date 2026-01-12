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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/prayer-requests/[id]/pray
 * Record that someone has prayed for this request
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Check if request exists
    const existing = await prisma.prayerRequest.findFirst({
      where: { id, churchId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Prayer request not found" },
        { status: 404 }
      );
    }

    // Increment prayer count
    const updated = await prisma.prayerRequest.update({
      where: { id },
      data: {
        prayerCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      prayerCount: updated.prayerCount,
    });
  } catch (error) {
    console.error("Error recording prayer:", error);
    return NextResponse.json(
      { error: "Failed to record prayer" },
      { status: 500 }
    );
  }
}
