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
 * GET /api/integrations/xero
 * Get Xero connection status
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

    // Get church settings for Xero
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { settings: true },
    });

    const settings = church?.settings as {
      xeroTenantId?: string;
      xeroAccessToken?: string;
    } | null;

    const isConnected = !!(settings?.xeroTenantId && settings?.xeroAccessToken);

    return NextResponse.json({
      connected: isConnected,
      tenantId: settings?.xeroTenantId,
    });
  } catch (error) {
    console.error("Error checking Xero status:", error);
    return NextResponse.json(
      { error: "Failed to check Xero status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations/xero
 * Connect to Xero or sync donations
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
    const { action, code } = body;

    if (action === "connect") {
      // Exchange authorization code for tokens
      const clientId = process.env.XERO_CLIENT_ID;
      const clientSecret = process.env.XERO_CLIENT_SECRET;
      const redirectUri = process.env.XERO_REDIRECT_URI;

      if (!clientId || !clientSecret || !code) {
        return NextResponse.json(
          { error: "Xero configuration missing" },
          { status: 400 }
        );
      }

      const tokenResponse = await fetch(
        "https://identity.xero.com/connect/token",
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
        throw new Error("Failed to exchange Xero authorization code");
      }

      const tokens = await tokenResponse.json();

      // Get tenant connections
      const connectionsResponse = await fetch(
        "https://api.xero.com/connections",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const connections = await connectionsResponse.json();
      const tenantId = connections[0]?.tenantId;

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
            xeroTenantId: tenantId,
            xeroAccessToken: tokens.access_token,
            xeroRefreshToken: tokens.refresh_token,
            xeroTokenExpiry: new Date(
              Date.now() + tokens.expires_in * 1000
            ).toISOString(),
          },
        },
      });

      return NextResponse.json({ success: true, connected: true });
    }

    if (action === "sync") {
      // Sync donations to Xero
      const church = await prisma.church.findUnique({
        where: { id: churchId },
        select: { settings: true },
      });

      const settings = church?.settings as {
        xeroTenantId?: string;
        xeroAccessToken?: string;
      } | null;

      if (!settings?.xeroAccessToken || !settings?.xeroTenantId) {
        return NextResponse.json(
          { error: "Xero not connected" },
          { status: 400 }
        );
      }

      // Get unsynced donations
      const donations = await prisma.donation.findMany({
        where: {
          churchId,
          paymentStatus: "COMPLETED",
        },
        include: {
          member: { select: { firstName: true, lastName: true, email: true } },
          fund: { select: { name: true } },
        },
        take: 100,
      });

      let syncedCount = 0;

      for (const donation of donations) {
        try {
          // Create invoice in Xero (as a receive money transaction)
          const bankTransaction = {
            Type: "RECEIVE",
            Contact: {
              Name: donation.member
                ? `${donation.member.firstName} ${donation.member.lastName}`
                : "Anonymous Donor",
            },
            LineItems: [
              {
                Description: `Donation - ${donation.fund?.name || "General"}`,
                Quantity: 1,
                UnitAmount: donation.amount,
                AccountCode: "200", // Default income account
              },
            ],
            BankAccount: {
              Code: "090", // Default bank account
            },
            Date: donation.donatedAt.toISOString().split("T")[0],
            Reference: `ChurchFlow-${donation.id}`,
          };

          const response = await fetch(
            "https://api.xero.com/api.xro/2.0/BankTransactions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${settings.xeroAccessToken}`,
                "Xero-Tenant-Id": settings.xeroTenantId,
              },
              body: JSON.stringify({ BankTransactions: [bankTransaction] }),
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
    console.error("Error with Xero:", error);
    return NextResponse.json(
      { error: "Xero operation failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/integrations/xero
 * Disconnect Xero
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

    // Remove Xero settings
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { settings: true },
    });

    const existingSettings = (church?.settings as Record<string, unknown>) || {};
    
    // Remove Xero-related settings
    const { 
      xeroTenantId, 
      xeroAccessToken, 
      xeroRefreshToken, 
      xeroTokenExpiry, 
      ...remainingSettings 
    } = existingSettings;

    await prisma.church.update({
      where: { id: churchId },
      data: { settings: remainingSettings as object },
    });

    return NextResponse.json({ success: true, connected: false });
  } catch (error) {
    console.error("Error disconnecting Xero:", error);
    return NextResponse.json(
      { error: "Failed to disconnect Xero" },
      { status: 500 }
    );
  }
}
