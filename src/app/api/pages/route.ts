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
      churchId = (await getChurchId()) || null;
    }

    if (!churchId) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    const publishedOnly = searchParams.get("publishedOnly");

    const where: Record<string, unknown> = { churchId };
    if (publishedOnly === "true") {
      where.isPublished = true;
    }

    const pages = await prisma.webPage.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        template: true,
        isPublished: true,
        isHomePage: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
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
      slug,
      template,
      content,
      metaTitle,
      metaDescription,
      publishStatus,
      showInNav,
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check for duplicate slug
    const existing = await prisma.webPage.findFirst({
      where: { churchId, slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A page with this URL already exists" },
        { status: 400 }
      );
    }

    // Get highest sort order
    const maxOrder = await prisma.webPage.aggregate({
      where: { churchId },
      _max: { order: true },
    });

    const page = await prisma.webPage.create({
      data: {
        churchId,
        title,
        slug: slug.startsWith("/") ? slug : `/${slug}`,
        template: template || "content",
        content: content || {},
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || "",
        isPublished: publishStatus === "PUBLISHED",
        order: (maxOrder._max.order || 0) + 1,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "WebPage",
        entityId: page.id,
        details: { message: `Created page: ${title}` },
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
