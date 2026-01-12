import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { churchId, firstName, lastName, email, phone, subject, message } =
      body;

    if (!churchId) {
      return NextResponse.json(
        { error: "Church ID is required" },
        { status: 400 }
      );
    }

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: "First name, last name, email, and message are required" },
        { status: 400 }
      );
    }

    // Verify church exists
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { id: true, name: true, email: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Store the contact form submission as a communication
    const communication = await prisma.communication.create({
      data: {
        churchId,
        type: "EMAIL",
        subject: `Contact Form: ${subject || "General Inquiry"}`,
        content: `
From: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || "Not provided"}
Subject: ${subject || "General Inquiry"}

Message:
${message}
        `.trim(),
        status: "DRAFT",
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        action: "CREATE",
        entityType: "Communication",
        entityId: communication.id,
        details: { from: `${firstName} ${lastName}`, email },
      },
    });

    // In a real app, you would also:
    // 1. Send an email notification to the church
    // 2. Send a confirmation email to the visitor
    // 3. Create a follow-up task

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully!",
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
