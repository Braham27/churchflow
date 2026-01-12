import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getChurchId } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const churchSlug = searchParams.get("churchSlug");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const seriesId = searchParams.get("seriesId") || "";
    const published = searchParams.get("published");

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

    const where: Record<string, unknown> = { churchId };

    // For public access, only show published sermons
    if (churchSlug) {
      where.isPublished = true;
    } else if (published !== null && published !== undefined) {
      where.isPublished = published === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { speaker: { contains: search, mode: "insensitive" } },
        { scripture: { contains: search, mode: "insensitive" } },
      ];
    }

    if (seriesId) {
      where.seriesId = seriesId;
    }

    const [sermons, total] = await Promise.all([
      prisma.sermon.findMany({
        where,
        include: {
          series: {
            select: { id: true, title: true },
          },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sermon.count({ where }),
    ]);

    return NextResponse.json({
      sermons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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
      date,
      seriesId,
      seriesOrder,
      scripture,
      videoUrl,
      audioUrl,
      thumbnailUrl,
      notes,
      slidesUrl,
      isPublished,
      isFeatured,
      tags,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    const sermon = await prisma.sermon.create({
      data: {
        churchId,
        title: title.trim(),
        description: description?.trim() || null,
        speaker: speaker?.trim() || null,
        date: new Date(date),
        seriesId: seriesId || null,
        seriesOrder: seriesOrder || null,
        scripture: scripture?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        audioUrl: audioUrl?.trim() || null,
        thumbnailUrl: thumbnailUrl?.trim() || null,
        notes: notes?.trim() || null,
        slidesUrl: slidesUrl?.trim() || null,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
        isFeatured: isFeatured || false,
        tags: tags || [],
      },
      include: {
        series: {
          select: { id: true, title: true },
        },
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
