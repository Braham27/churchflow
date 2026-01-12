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
 * GET /api/integrations/quickbooks
 * Get QuickBooks connection status and sync donations
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

    // Get church settings for QuickBooks
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { settings: true },
    });

    const settings = church?.settings as {
      quickbooksRealmId?: string;
      quickbooksAccessToken?: string;
      quickbooksRefreshToken?: string;
      quickbooksTokenExpiry?: string;
    } | null;

    const isConnected = !!(settings?.quickbooksRealmId && settings?.quickbooksAccessToken);

    return NextResponse.json({
      connected: isConnected,
      realmId: settings?.quickbooksRealmId,
    });
  } catch (error) {
    console.error("Error checking QuickBooks status:", error);
    return NextResponse.json(
      { error: "Failed to check QuickBooks status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/quickbooks
 * Connect to QuickBooks or sync donations
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
    const { action, code, realmId } = body;

    if (action === "connect") {
      // Exchange authorization code for tokens
      const clientId = process.env.QUICKBOOKS_CLIENT_ID;
      const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
      const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

      if (!clientId || !clientSecret || !code) {
        return NextResponse.json(
          { error: "QuickBooks configuration missing" },
          { status: 400 }
        );
      }

      const tokenResponse = await fetch(
        "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri || "",
          }),
        }
      );

      if (!tokenResponse.ok) {
        throw new Error("Failed to exchange QuickBooks authorization code");
      }

      const tokens = await tokenResponse.json();

      // Save tokens to church settings
      const church = await prisma.church.findUnique({
        where: { id: churchId },
        select: { settings: true },
      });

      const existingSettings = (church?.settings as Record<string, unknown>) || {};

      await prisma.church.update({
        where: { id: churchId },
        data: {
          settings: {
            ...existingSettings,
            quickbooksRealmId: realmId,
            quickbooksAccessToken: tokens.access_token,
            quickbooksRefreshToken: tokens.refresh_token,
            quickbooksTokenExpiry: new Date(
              Date.now() + tokens.expires_in * 1000
            ).toISOString(),
          },
        },
      });

      return NextResponse.json({ success: true, connected: true });
    }

    if (action === "sync") {
      // Sync donations to QuickBooks
      const church = await prisma.church.findUnique({
        where: { id: churchId },
        select: { settings: true },
      });

      const settings = church?.settings as {
        quickbooksRealmId?: string;
        quickbooksAccessToken?: string;
      } | null;

      if (!settings?.quickbooksAccessToken || !settings?.quickbooksRealmId) {
        return NextResponse.json(
          { error: "QuickBooks not connected" },
          { status: 400 }
        );
      }

      // Get unsynced donations
      const donations = await prisma.donation.findMany({
        where: {
          churchId,
          paymentStatus: "COMPLETED",
          // Add a field to track synced donations
        },
        include: {
          member: { select: { firstName: true, lastName: true, email: true } },
          fund: { select: { name: true } },
        },
        take: 100,
      });

      let syncedCount = 0;
      const baseUrl = process.env.QUICKBOOKS_API_URL || "https://quickbooks.api.intuit.com";

      for (const donation of donations) {
        try {
          // Create sales receipt in QuickBooks
          const salesReceipt = {
            Line: [
              {
                Amount: donation.amount,
                DetailType: "SalesItemLineDetail",
                SalesItemLineDetail: {
                  ItemRef: {
                    name: donation.fund?.name || "Donation",
                  },
                },
              },
            ],
            CustomerRef: {
              name: donation.member
                ? `${donation.member.firstName} ${donation.member.lastName}`
                : "Anonymous",
            },
            TxnDate: donation.donatedAt.toISOString().split("T")[0],
            PrivateNote: `ChurchFlow Donation ID: ${donation.id}`,
          };

          const response = await fetch(
            `${baseUrl}/v3/company/${settings.quickbooksRealmId}/salesreceipt`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${settings.quickbooksAccessToken}`,
                Accept: "application/json",
              },
              body: JSON.stringify(salesReceipt),
            }
          );

          if (response.ok) {
            syncedCount++;
          }
        } catch (error) {
          console.error(`Error syncing donation ${donation.id}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        synced: syncedCount,
        total: donations.length,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error with QuickBooks:", error);
    return NextResponse.json(
      { error: "QuickBooks operation failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/quickbooks
 * Disconnect QuickBooks
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Remove QuickBooks settings
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { settings: true },
    });

    const existingSettings = (church?.settings as Record<string, unknown>) || {};
    
    // Remove QuickBooks-related settings
    const { 
      quickbooksRealmId, 
      quickbooksAccessToken, 
      quickbooksRefreshToken, 
      quickbooksTokenExpiry, 
      ...remainingSettings 
    } = existingSettings;

    await prisma.church.update({
      where: { id: churchId },
      data: { settings: remainingSettings as object },
    });

    return NextResponse.json({ success: true, connected: false });
  } catch (error) {
    console.error("Error disconnecting QuickBooks:", error);
    return NextResponse.json(
      { error: "Failed to disconnect QuickBooks" },
      { status: 500 }
    );
  }
}
