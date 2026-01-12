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
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const churchSlug = searchParams.get("churchSlug");

    let churchId: string | null = null;

    if (churchSlug) {
      const church = await prisma.church.findUnique({
        where: { slug: churchSlug },
        select: { id: true },
      });
      if (church) {
        churchId = church.id;
      }
    } else {
      const session = await getServerSession(authOptions);
      if (session?.user) {
        churchId = (await getChurchId()) || null;
      }
    }

    if (!churchId) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    const page = await prisma.webPage.findFirst({
      where: {
        id,
        churchId,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json(
      { error: "Failed to fetch page" },
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

    // Verify page exists and belongs to church
    const existing = await prisma.webPage.findFirst({
      where: { id, churchId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      template,
      content,
      metaTitle,
      metaDescription,
      status,
      showInNav,
      sortOrder,
    } = body;

    // Check for duplicate slug if changing
    if (slug && slug !== existing.slug) {
      const duplicate = await prisma.webPage.findFirst({
        where: { churchId, slug, id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "A page with this URL already exists" },
          { status: 400 }
        );
      }
    }

    const page = await prisma.webPage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && {
          slug: slug.startsWith("/") ? slug : `/${slug}`,
        }),
        ...(template !== undefined && { template }),
        ...(content !== undefined && { content }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(status !== undefined && { status }),
        ...(showInNav !== undefined && { showInNav }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "UPDATE",
        entityType: "WebPage",
        entityId: id,
        details: `Updated page: ${page.title}`,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json(
      { error: "Failed to update page" },
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

    // Verify page exists and belongs to church
    const existing = await prisma.webPage.findFirst({
      where: { id, churchId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Delete the page
    await prisma.webPage.delete({
      where: { id },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "DELETE",
        entityType: "WebPage",
        entityId: id,
        details: `Deleted page: ${existing.title}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 }
    );
  }
}
