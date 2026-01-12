import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// Initialize web-push with VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:notifications@churchflow.app",
    vapidPublicKey,
    vapidPrivateKey
  );
}

// Helper to get church ID for current user
async function getChurchId(userId: string): Promise<string | null> {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId ?? null;
}

// Helper to check if user is admin
async function isAdmin(userId: string, churchId: string): Promise<boolean> {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId, churchId },
    select: { role: true },
  });
  return churchUser?.role === "ADMIN" || churchUser?.role === "OWNER";
}

/**
 * POST /api/push/send
 * Send push notifications to users
 * Requires admin or owner role
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

    // Check admin permission
    const admin = await isAdmin(session.user.id, churchId);
    if (!admin) {
      return NextResponse.json(
        { error: "Only admins can send push notifications" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, url, targetUserIds, targetAll } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      );
    }

    // Get subscriptions based on targeting
    interface WhereClause {
      churchId: string;
      userId?: { in: string[] };
    }

    const whereClause: WhereClause = {
      churchId,
    };

    if (!targetAll && targetUserIds?.length) {
      whereClause.userId = { in: targetUserIds };
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: whereClause,
    });

    const payload = JSON.stringify({
      title,
      body: message,
      url: url || "/dashboard",
      tag: `churchflow-${Date.now()}`,
    });

    let successCount = 0;
    let failCount = 0;

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(pushSubscription, payload);
        successCount++;
      } catch (error: unknown) {
        failCount++;

        // Remove expired subscriptions
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("410") || errorMessage.includes("expired")) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Error sending push notifications:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  }
}
