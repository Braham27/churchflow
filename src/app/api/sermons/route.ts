import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getChurchId } from "@/lib/session";

// Note: This assumes a Sermon model exists in the schema
// If not, we'll create a simple implementation using MediaFile

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const churchSlug = searchParams.get("churchSlug");

    let churchId: string | null = null;

    // If churchSlug is provided (public access), look up the church
    if (churchSlug) {
      const church = await prisma.church.findUnique({
        where: { slug: churchSlug },
        select: { id: true },
      });
      if (church) {
        churchId = church.id;
      }
    } else if (session?.user) {
      // If authenticated, get from session
      churchId = await getChurchId();
    }

    if (!churchId) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    // Get sermons (stored as MediaFile with type VIDEO and category sermon)
    const sermons = await prisma.mediaFile.findMany({
      where: {
        churchId,
        mimeType: { startsWith: "video/" },
        // You could add a category field to filter sermons
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(sermons);
  } catch (error) {
    console.error("Error fetching sermons:", error);
    return NextResponse.json(
      { error: "Failed to fetch sermons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId();
    if (!churchId) {
      return NextResponse.json(
        { error: "No church associated" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      speaker,
      seriesName,
      date,
      videoUrl,
      audioUrl,
      thumbnailUrl,
      duration,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create sermon as MediaFile
    const sermon = await prisma.mediaFile.create({
      data: {
        churchId,
        filename: title,
        originalName: title,
        url: videoUrl || audioUrl || "",
        mimeType: videoUrl ? "video/mp4" : "audio/mp3",
        size: 0, // Would be calculated from actual file
        uploadedBy: session.user.id,
        category: "SERMON",
        description: description || null,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "Sermon",
        entityId: sermon.id,
        details: { message: `Created sermon: ${title}` },
      },
    });

    return NextResponse.json(sermon, { status: 201 });
  } catch (error) {
    console.error("Error creating sermon:", error);
    return NextResponse.json(
      { error: "Failed to create sermon" },
      { status: 500 }
    );
  }
}
