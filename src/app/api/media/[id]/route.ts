import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getChurchId } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const churchId = await getChurchId();
    if (!churchId) {
      return NextResponse.json(
        { error: "No church associated" },
        { status: 400 }
      );
    }

    const media = await prisma.mediaFile.findFirst({
      where: {
        id,
        churchId,
      },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const churchId = await getChurchId();
    if (!churchId) {
      return NextResponse.json(
        { error: "No church associated" },
        { status: 400 }
      );
    }

    // Verify media exists and belongs to church
    const existing = await prisma.mediaFile.findFirst({
      where: { id, churchId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const body = await request.json();
    const { filename, folder, alt, caption } = body;

    const media = await prisma.mediaFile.update({
      where: { id },
      data: {
        ...(filename !== undefined && { filename }),
        ...(folder !== undefined && { folder }),
        ...(alt !== undefined && { alt }),
        ...(caption !== undefined && { caption }),
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "UPDATE",
        entityType: "MediaFile",
        entityId: id,
        details: `Updated media: ${media.filename}`,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const churchId = await getChurchId();
    if (!churchId) {
      return NextResponse.json(
        { error: "No church associated" },
        { status: 400 }
      );
    }

    // Verify media exists and belongs to church
    const existing = await prisma.mediaFile.findFirst({
      where: { id, churchId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete the media file
    await prisma.mediaFile.delete({
      where: { id },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "DELETE",
        entityType: "MediaFile",
        entityId: id,
        details: `Deleted media: ${existing.filename}`,
      },
    });

    // In production, you would also delete the actual file from storage (S3, etc.)

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
