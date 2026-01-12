import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getChurchId } from "@/lib/session";

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // image, video, audio, document
    const folder = searchParams.get("folder");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build filter
    const where: Record<string, unknown> = { churchId };

    if (type) {
      const mimeTypeMap: Record<string, string> = {
        image: "image/",
        video: "video/",
        audio: "audio/",
        document: "application/",
      };
      if (mimeTypeMap[type]) {
        where.mimeType = { startsWith: mimeTypeMap[type] };
      }
    }

    if (folder) {
      where.folder = folder;
    }

    if (search) {
      where.filename = { contains: search, mode: "insensitive" };
    }

    const [media, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mediaFile.count({ where }),
    ]);

    // Get unique categories
    const categories = await prisma.mediaFile.findMany({
      where: { churchId },
      distinct: ["category"],
      select: { category: true },
    });

    return NextResponse.json({
      media,
      categories: categories.map((f) => f.category).filter(Boolean),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
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
    const { filename, url, mimeType, size, category, description } = body;

    if (!filename || !url) {
      return NextResponse.json(
        { error: "Filename and URL are required" },
        { status: 400 }
      );
    }

    const media = await prisma.mediaFile.create({
      data: {
        churchId,
        filename,
        originalName: filename,
        url,
        mimeType: mimeType || "application/octet-stream",
        size: size || 0,
        category: category || "OTHER",
        description: description || null,
        uploadedBy: session.user.id,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "MediaFile",
        entityId: media.id,
        details: { filename },
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Media IDs are required" },
        { status: 400 }
      );
    }

    // Delete multiple media files
    const result = await prisma.mediaFile.deleteMany({
      where: {
        id: { in: ids },
        churchId,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "DELETE",
        entityType: "MediaFile",
        details: `Deleted ${result.count} media file(s)`,
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
