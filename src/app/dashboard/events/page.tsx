import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  Clock,
  QrCode,
  MoreHorizontal,
} from "lucide-react";

async function getEvents(churchId: string) {
  const events = await prisma.event.findMany({
    where: {
      churchId,
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
    include: {
      _count: {
        select: {
          registrations: true,
          checkIns: true,
        },
      },
    },
  });

  return events;
}

async function getPastEvents(churchId: string) {
  const events = await prisma.event.findMany({
    where: {
      churchId,
      startDate: { lt: new Date() },
    },
    orderBy: { startDate: "desc" },
    take: 10,
    include: {
      _count: {
        select: {
          registrations: true,
          checkIns: true,
        },
      },
    },
  });

  return events;
}

async function getChurchId(userId: string) {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId;
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchId = await getChurchId(session.user.id);

  if (!churchId) {
    redirect("/onboarding");
  }

  const [upcomingEvents, pastEvents] = await Promise.all([
    getEvents(churchId),
    getPastEvents(churchId),
  ]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const categoryColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    SERVICE: "default",
    WORSHIP: "default",
    PRAYER: "secondary",
    BIBLE_STUDY: "success",
    YOUTH: "warning",
    CHILDREN: "warning",
    OUTREACH: "success",
    FELLOWSHIP: "secondary",
    OTHER: "secondary",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Manage your church events and activities
          </p>
        </div>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Events ({upcomingEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="divide-y">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col items-center justify-center min-w-[60px] h-16 bg-primary/10 rounded-lg text-primary">
                    <span className="text-xs font-medium uppercase">
                      {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-2xl font-bold leading-none">
                      {new Date(event.startDate).getDate()}
                    </span>
                    <span className="text-xs">
                      {new Date(event.startDate).toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="font-semibold hover:text-primary"
                      >
                        {event.title}
                      </Link>
                      <Badge variant={categoryColors[event.category] || "secondary"}>
                        {event.category.replace("_", " ")}
                      </Badge>
                      {event.isRecurring && (
                        <Badge variant="outline">Recurring</Badge>
                      )}
                      {event.enableCheckIn && (
                        <Badge variant="outline" className="gap-1">
                          <QrCode className="h-3 w-3" />
                          Check-in
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.startDate)}
                        {event.endDate && ` - ${formatTime(event.endDate)}`}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                      {event.requiresRegistration && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event._count.registrations}
                          {event.maxAttendees && ` / ${event.maxAttendees}`} registered
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {event.enableCheckIn && event.checkInCode && (
                      <Link href={`/dashboard/checkin/${event.id}`}>
                        <Button variant="outline" size="sm">
                          <QrCode className="mr-2 h-4 w-4" />
                          Check-in
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming events</p>
              <Link href="/dashboard/events/new">
                <Button variant="link">Create your first event</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5" />
              Recent Past Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 opacity-60"
                >
                  <div className="flex flex-col items-center justify-center min-w-[50px] text-muted-foreground">
                    <span className="text-xs uppercase">
                      {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-lg font-bold">
                      {new Date(event.startDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/events/${event.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {event.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {event._count.checkIns} attended
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
