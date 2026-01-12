import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/seo/structured-data
 * Generate JSON-LD structured data for a church
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const type = searchParams.get("type") || "organization";

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
        description: true,
        logo: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        country: true,
        postalCode: true,
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const baseUrl = church.website || `https://churchflow.app/c/${church.slug}`;

    let structuredData: object;

    switch (type) {
      case "organization":
        structuredData = generateOrganizationSchema(church, baseUrl);
        break;
      case "localBusiness":
        structuredData = generateLocalBusinessSchema(church, baseUrl);
        break;
      case "events":
        structuredData = await generateEventsSchema(church.id, baseUrl);
        break;
      case "sermons":
        structuredData = await generateSermonsSchema(church.id, baseUrl);
        break;
      default:
        structuredData = generateOrganizationSchema(church, baseUrl);
    }

    return NextResponse.json(structuredData);
  } catch (error) {
    console.error("Error generating structured data:", error);
    return NextResponse.json(
      { error: "Failed to generate structured data" },
      { status: 500 }
    );
  }
}

interface ChurchData {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
}

function generateOrganizationSchema(church: ChurchData, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ReligiousOrganization",
    "@id": `${baseUrl}/#organization`,
    name: church.name,
    description: church.description,
    url: baseUrl,
    logo: church.logo,
    email: church.email,
    telephone: church.phone,
    address: church.address
      ? {
          "@type": "PostalAddress",
          streetAddress: church.address,
          addressLocality: church.city,
          addressRegion: church.state,
          postalCode: church.postalCode,
          addressCountry: church.country,
        }
      : undefined,
    sameAs: [],
  };
}

function generateLocalBusinessSchema(church: ChurchData, baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "PlaceOfWorship",
    "@id": `${baseUrl}/#place`,
    name: church.name,
    description: church.description,
    url: baseUrl,
    image: church.logo,
    email: church.email,
    telephone: church.phone,
    address: church.address
      ? {
          "@type": "PostalAddress",
          streetAddress: church.address,
          addressLocality: church.city,
          addressRegion: church.state,
          postalCode: church.postalCode,
          addressCountry: church.country,
        }
      : undefined,
    geo: undefined, // Would need lat/lng
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Sunday",
        opens: "09:00",
        closes: "12:00",
      },
    ],
  };
}

async function generateEventsSchema(churchId: string, baseUrl: string) {
  const events = await prisma.event.findMany({
    where: {
      churchId,
      isPublished: true,
      publishToWebsite: true,
      startDate: { gte: new Date() },
    },
    take: 10,
    orderBy: { startDate: "asc" },
  });

  return events.map((event) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString(),
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
          address: event.address,
        }
      : undefined,
    url: `${baseUrl}/events/${event.id}`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  }));
}

async function generateSermonsSchema(churchId: string, baseUrl: string) {
  const sermons = await prisma.sermon.findMany({
    where: {
      churchId,
      isPublished: true,
    },
    take: 10,
    orderBy: { date: "desc" },
    include: {
      series: { select: { title: true } },
    },
  });

  return sermons.map((sermon) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: sermon.title,
    description: sermon.description,
    uploadDate: sermon.date.toISOString(),
    contentUrl: sermon.videoUrl || sermon.audioUrl,
    thumbnailUrl: sermon.thumbnailUrl,
    duration: undefined, // Would need duration
    author: {
      "@type": "Person",
      name: sermon.speaker,
    },
    isPartOf: sermon.series
      ? {
          "@type": "CreativeWorkSeries",
          name: sermon.series.title,
        }
      : undefined,
    url: `${baseUrl}/sermons/${sermon.id}`,
  }));
}
