import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";

async function getChurch(slug: string) {
  return prisma.church.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      events: {
        where: {
          startDate: { gte: new Date() },
          isPublic: true,
        },
        orderBy: { startDate: "asc" },
        take: 20,
      },
    },
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default async function ChurchEventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const church = await getChurch(resolvedParams.slug);

  if (!church) {
    notFound();
  }

  // Default primary color - could be stored in church.settings in the future
  const primaryColor = "#0ea5e9";

  // Group events by month
  const eventsByMonth: Record<string, typeof church.events> = {};
  church.events.forEach((event) => {
    const monthYear = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(new Date(event.startDate));
    if (!eventsByMonth[monthYear]) {
      eventsByMonth[monthYear] = [];
    }
    eventsByMonth[monthYear].push(event);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href={`/c/${church.slug}`} className="font-bold text-xl">
              {church.name}
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/c/${church.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href={`/c/${church.slug}/about`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href={`/c/${church.slug}/events`}
                className="text-sm font-medium text-primary"
              >
                Events
              </Link>
              <Link
                href={`/c/${church.slug}/give`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Give
              </Link>
              <Link
                href={`/c/${church.slug}/visit`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Plan Your Visit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="py-20 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join us for worship, fellowship, and community
          </p>
        </div>
      </section>

      {/* Events */}
      <main className="container mx-auto px-4 py-12">
        {Object.keys(eventsByMonth).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(eventsByMonth).map(([month, events]) => (
              <div key={month}>
                <h2 className="text-2xl font-bold mb-6">{month}</h2>
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Date Badge */}
                          <div
                            className="sm:w-32 p-6 text-center text-white flex flex-col justify-center"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <span className="text-sm uppercase opacity-75">
                              {new Intl.DateTimeFormat("en-US", {
                                weekday: "short",
                              }).format(new Date(event.startDate))}
                            </span>
                            <span className="text-3xl font-bold">
                              {new Date(event.startDate).getDate()}
                            </span>
                            <span className="text-sm uppercase opacity-75">
                              {new Intl.DateTimeFormat("en-US", {
                                month: "short",
                              }).format(new Date(event.startDate))}
                            </span>
                          </div>

                          {/* Event Details */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">
                                  {event.title}
                                </h3>
                                {event.description && (
                                  <p className="text-muted-foreground mb-4 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {formatTime(event.startDate)}
                                    {event.endDate &&
                                      ` - ${formatTime(event.endDate)}`}
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.location}
                                    </div>
                                  )}
                                  {event.maxAttendees && (
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {event.maxAttendees} spots
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {event.category && (
                                  <Badge variant="secondary">
                                    {event.category.replace("_", " ")}
                                  </Badge>
                                )}
                                {event.requiresRegistration && (
                                  <Button size="sm">Register</Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Upcoming Events</h2>
            <p className="text-muted-foreground mb-6">
              Check back soon for new events and activities!
            </p>
            <Link href={`/c/${church.slug}`}>
              <Button>Return Home</Button>
            </Link>
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">New Here?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            We&apos;d love to have you join us for a service. Plan your visit
            today!
          </p>
          <Link href={`/c/${church.slug}/visit`}>
            <Button size="lg">
              Plan Your Visit
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-lg mb-2">{church.name}</p>
          {church.address && (
            <p className="text-sm text-muted-foreground">{church.address}</p>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            © {new Date().getFullYear()} {church.name}. Powered by ChurchFlow.
          </p>
        </div>
      </footer>
    </div>
  );
}
