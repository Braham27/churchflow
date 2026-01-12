import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
    const status = searchParams.get("status") || "";
    const channel = searchParams.get("channel") || "";

    const where: Record<string, unknown> = {
      churchId: churchUser.churchId,
    };

    if (status) {
      where.status = status;
    }

    if (channel) {
      where.type = channel;
    }

    const [communications, total] = await Promise.all([
      prisma.communication.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.communication.count({ where }),
    ]);

    return NextResponse.json({
      communications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching communications:", error);
    return NextResponse.json(
      { error: "Failed to fetch communications" },
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
      channel,
      subject,
      content,
      recipientType,
      groupId,
      status,
      scheduledFor,
    } = body;

    // Validation
    if (!subject?.trim()) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // Determine recipient count based on type
    let recipientCount = 0;
    if (recipientType === "all") {
      recipientCount = await prisma.member.count({
        where: { churchId: churchUser.churchId },
      });
    } else if (recipientType === "volunteers") {
      recipientCount = await prisma.volunteer.count({
        where: { churchId: churchUser.churchId, isActive: true },
      });
    } else if (recipientType === "group" && groupId) {
      recipientCount = await prisma.groupMember.count({
        where: { groupId },
      });
    }

    // Create communication record
    const communication = await prisma.communication.create({
      data: {
        churchId: churchUser.churchId,
        type: channel || "EMAIL",
        subject,
        content,
        status: status || "DRAFT",
        recipientCount,
        createdBy: session.user.id,
        scheduledAt: scheduledFor ? new Date(scheduledFor) : null,
        sentAt: status === "SENDING" ? new Date() : null,
      },
    });

    // If sending immediately, trigger the send process
    if (status === "SENDING") {
      // In a real app, this would queue the message for sending via email/SMS provider
      // For now, we'll just mark it as sent
      await prisma.communication.update({
        where: { id: communication.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "communication",
        entityId: communication.id,
        details: { channel: channel?.toLowerCase() || "email", subject },
      },
    });

    return NextResponse.json(communication, { status: 201 });
  } catch (error) {
    console.error("Error creating communication:", error);
    return NextResponse.json(
      { error: "Failed to create communication" },
      { status: 500 }
    );
  }
}
