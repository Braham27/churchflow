import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mark this route as dynamic
export const dynamic = "force-dynamic";

/**
 * GET /api/seo/sitemap
 * Generate XML sitemap for a church's public website
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Church slug is required" },
        { status: 400 }
      );
    }

    // Find the church
    const church = await prisma.church.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        website: true,
        updatedAt: true,
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const baseUrl = church.website || `https://churchflow.app/c/${church.slug}`;

    // Get published pages
    const pages = await prisma.webPage.findMany({
      where: {
        churchId: church.id,
        isPublished: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    // Get published events
    const events = await prisma.event.findMany({
      where: {
        churchId: church.id,
        isPublished: true,
        publishToWebsite: true,
        startDate: { gte: new Date() },
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 50,
    });

    // Get published sermons
    const sermons = await prisma.sermon.findMany({
      where: {
        churchId: church.id,
        isPublished: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 100,
    });

    // Generate sitemap XML
    const urls = [
      // Main pages
      { loc: baseUrl, lastmod: church.updatedAt, priority: "1.0", changefreq: "weekly" },
      { loc: `${baseUrl}/about`, lastmod: church.updatedAt, priority: "0.8", changefreq: "monthly" },
      { loc: `${baseUrl}/contact`, lastmod: church.updatedAt, priority: "0.7", changefreq: "monthly" },
      { loc: `${baseUrl}/events`, lastmod: new Date(), priority: "0.9", changefreq: "daily" },
      { loc: `${baseUrl}/sermons`, lastmod: new Date(), priority: "0.9", changefreq: "weekly" },
      { loc: `${baseUrl}/give`, lastmod: church.updatedAt, priority: "0.7", changefreq: "monthly" },
      { loc: `${baseUrl}/visit`, lastmod: church.updatedAt, priority: "0.8", changefreq: "monthly" },
      
      // Custom pages
      ...pages.map((page) => ({
        loc: `${baseUrl}/${page.slug}`,
        lastmod: page.updatedAt,
        priority: "0.6",
        changefreq: "monthly",
      })),
      
      // Events
      ...events.map((event) => ({
        loc: `${baseUrl}/events/${event.id}`,
        lastmod: event.updatedAt,
        priority: "0.7",
        changefreq: "weekly",
      })),
      
      // Sermons
      ...sermons.map((sermon) => ({
        loc: `${baseUrl}/sermons/${sermon.id}`,
        lastmod: sermon.updatedAt,
        priority: "0.6",
        changefreq: "monthly",
      })),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${(url.lastmod instanceof Date ? url.lastmod : new Date(url.lastmod)).toISOString().split("T")[0]}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 }
    );
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
