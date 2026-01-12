import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.church.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// GET - Get current user's church
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
      include: {
        church: true,
      },
    });

    if (!churchUser) {
      return NextResponse.json({ church: null });
    }

    return NextResponse.json({ church: churchUser.church });
  } catch (error) {
    console.error("Error fetching church:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new church
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a church
    const existingChurchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
    });

    if (existingChurchUser) {
      return NextResponse.json(
        { error: "You already belong to a church" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      churchName,
      denomination,
      website,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      country,
      timezone,
      teamSize,
      averageAttendance,
    } = body;

    if (!churchName?.trim()) {
      return NextResponse.json(
        { error: "Church name is required" },
        { status: 400 }
      );
    }

    const slug = await getUniqueSlug(generateSlug(churchName));

    // Determine subscription tier based on attendance
    let subscriptionTier = "FREE";
    if (averageAttendance) {
      const attendance = averageAttendance.replace(/[^\d-+]/g, "");
      if (attendance.includes("2500") || attendance.includes("+")) {
        subscriptionTier = "ENTERPRISE";
      } else if (attendance.includes("1000") || attendance.includes("1001")) {
        subscriptionTier = "PREMIUM";
      } else if (attendance.includes("250") || attendance.includes("500")) {
        subscriptionTier = "STANDARD";
      } else if (attendance.includes("100")) {
        subscriptionTier = "BASIC";
      }
    }

    // Create church and link user
    const church = await prisma.church.create({
      data: {
        name: churchName.trim(),
        slug,
        description: denomination || null,
        website: website || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        state: state || null,
        postalCode: zipCode || null,
        country: country || "United States",
        timezone: timezone || "America/New_York",
        subscriptionTier: subscriptionTier as
          | "FREE"
          | "BASIC"
          | "STANDARD"
          | "PREMIUM"
          | "ENTERPRISE",
        subscriptionStatus: "TRIAL",
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        enabledModules: [
          "members",
          "events",
          "donations",
          "checkin",
          "communications",
          "groups",
          "volunteers",
        ],
      },
    });

    // Create church user relationship (as owner)
    await prisma.churchUser.create({
      data: {
        churchId: church.id,
        userId: session.user.id,
        role: "OWNER",
      },
    });

    // Create default donation fund
    await prisma.donationFund.create({
      data: {
        churchId: church.id,
        name: "General Fund",
        description: "General tithes and offerings",
        isDefault: true,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId: church.id,
        userId: session.user.id,
        action: "CHURCH_CREATED",
        entityType: "Church",
        entityId: church.id,
        details: { churchName },
      },
    });

    return NextResponse.json(church, { status: 201 });
  } catch (error) {
    console.error("Error creating church:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update church settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
      include: { church: true },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    if (!["ADMIN", "OWNER"].includes(churchUser.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      "name",
      "denomination",
      "website",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
      "timezone",
      "logo",
      "primaryColor",
      "enabledModules",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const church = await prisma.church.update({
      where: { id: churchUser.churchId },
      data: updateData,
    });

    return NextResponse.json(church);
  } catch (error) {
    console.error("Error updating church:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
