import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Generate an iCal feed for a church's events
 * GET /api/events/ical?churchId=xxx or /api/events/ical?slug=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get("churchId");
    const slug = searchParams.get("slug");

    if (!churchId && !slug) {
      return NextResponse.json(
        { error: "Church ID or slug is required" },
        { status: 400 }
      );
    }

    // Find the church
    const church = await prisma.church.findFirst({
      where: churchId ? { id: churchId } : { slug: slug! },
      select: {
        id: true,
        name: true,
        slug: true,
        timezone: true,
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Get published events
    const events = await prisma.event.findMany({
      where: {
        churchId: church.id,
        isPublished: true,
        publishToWebsite: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Generate iCal content
    const icalContent = generateICalendar(church, events);

    // Return as iCal file
    return new NextResponse(icalContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${church.slug}-events.ics"`,
      },
    });
  } catch (error) {
    console.error("Error generating iCal feed:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar" },
      { status: 500 }
    );
  }
}

interface Church {
  id: string;
  name: string;
  slug: string | null;
  timezone: string | null;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function generateICalendar(church: Church, events: Event[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//ChurchFlow//${church.name}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICalText(church.name)} Events`,
    `X-WR-TIMEZONE:${church.timezone || "America/New_York"}`,
  ];

  for (const event of events) {
    lines.push(...generateVEvent(event, church));
  }

  lines.push("END:VCALENDAR");

  return lines.join("\r\n");
}

function generateVEvent(event: Event, church: Church): string[] {
  const uid = `${event.id}@churchflow.app`;
  const dtstamp = formatICalDate(new Date());
  const dtstart = formatICalDate(event.startDate);
  const dtend = event.endDate
    ? formatICalDate(event.endDate)
    : formatICalDate(new Date(event.startDate.getTime() + 60 * 60 * 1000)); // Default 1 hour

  const lines: string[] = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICalText(event.title)}`,
    `CREATED:${formatICalDate(event.createdAt)}`,
    `LAST-MODIFIED:${formatICalDate(event.updatedAt)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  // Add recurrence rule if applicable
  if (event.isRecurring && event.recurrenceRule) {
    // The recurrenceRule should already be in RRULE format
    lines.push(event.recurrenceRule);
  }

  lines.push("END:VEVENT");

  return lines;
}

function formatICalDate(date: Date): string {
  // Format: YYYYMMDDTHHMMSSZ
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}
