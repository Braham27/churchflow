import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { name, email, password, churchName } = await request.json();

    // Validate input
    if (!name || !email || !password || !churchName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Generate church slug
    let slug = generateSlug(churchName);
    let slugExists = await prisma.church.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(churchName)}-${counter}`;
      slugExists = await prisma.church.findUnique({ where: { slug } });
      counter++;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and church in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          hashedPassword,
        },
      });

      // Create church with 30-day trial
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 30);

      const church = await tx.church.create({
        data: {
          name: churchName,
          slug,
          email,
          subscriptionStatus: "TRIAL",
          subscriptionTier: "STANDARD",
          trialEndsAt,
          enabledModules: ["members", "events", "communications", "donations", "volunteers"],
          maxMembers: 500,
          maxStorage: 25,
        },
      });

      // Connect user to church as owner
      await tx.churchUser.create({
        data: {
          userId: user.id,
          churchId: church.id,
          role: "OWNER",
        },
      });

      // Create default donation fund
      await tx.donationFund.create({
        data: {
          churchId: church.id,
          name: "General Fund",
          description: "General tithes and offerings",
          isDefault: true,
        },
      });

      return { user, church };
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        userId: result.user.id,
        churchId: result.church.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
