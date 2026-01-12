import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - List all pages for the church
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
      include: { church: { select: { id: true } } },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const pages = await prisma.webPage.findMany({
      where: { churchId: churchUser.churchId },
      orderBy: [{ isHomePage: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        isHomePage: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchUser = await prisma.churchUser.findFirst({
      where: { userId: session.user.id },
      include: { church: { select: { id: true } } },
    });

    if (!churchUser) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Check if user has permission
    if (!["ADMIN", "OWNER"].includes(churchUser.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, metaDescription, isHomepage, isPublished, content } =
      body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Title and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is unique for this church
    const existingPage = await prisma.webPage.findFirst({
      where: {
        churchId: churchUser.churchId,
        slug: slug,
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this URL already exists" },
        { status: 400 }
      );
    }

    // If this is set as homepage, unset current homepage
    if (isHomepage) {
      await prisma.webPage.updateMany({
        where: {
          churchId: churchUser.churchId,
          isHomePage: true,
        },
        data: { isHomePage: false },
      });
    }

    const page = await prisma.webPage.create({
      data: {
        churchId: churchUser.churchId,
        title,
        slug,
        metaDescription: metaDescription || null,
        content: content || {},
        isHomePage: isHomepage || false,
        isPublished: isPublished || false,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId: churchUser.churchId,
        userId: session.user.id,
        action: "PAGE_CREATED",
        entityType: "WebPage",
        entityId: page.id,
        details: { title },
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
