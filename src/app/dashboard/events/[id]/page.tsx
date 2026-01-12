import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  MapPin,
  Users,
  QrCode,
  Share2,
  Trash2,
} from "lucide-react";

async function getEvent(id: string, churchId: string) {
  return prisma.event.findFirst({
    where: { id, churchId },
    include: {
      attendances: {
        orderBy: { checkInTime: "desc" },
        take: 20,
        include: {
          member: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      registrations: {
        take: 20,
      },
      _count: {
        select: { attendances: true, registrations: true },
      },
    },
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true } } },
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const event = await getEvent(params.id, churchData.churchId);

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isPast = endDate < new Date();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SERVICE: "bg-blue-100 text-blue-800",
      BIBLE_STUDY: "bg-purple-100 text-purple-800",
      YOUTH: "bg-green-100 text-green-800",
      CHILDREN: "bg-yellow-100 text-yellow-800",
      OUTREACH: "bg-orange-100 text-orange-800",
      PRAYER: "bg-pink-100 text-pink-800",
      SOCIAL: "bg-indigo-100 text-indigo-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.OTHER;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <Badge variant="outline" className={getCategoryColor(event.category)}>
                {event.category.replace("_", " ")}
              </Badge>
              {isPast && <Badge variant="outline">Past</Badge>}
              {!event.isPublic && <Badge variant="secondary">Private</Badge>}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {startDate.toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {startDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {endDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Link href={`/dashboard/events/${event.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Check-In */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Check-In
              </CardTitle>
              <Link href={`/dashboard/checkin?eventId=${event.id}`}>
                <Button size="sm">Open Check-In</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Check-In Code</p>
                  <p className="text-2xl font-mono font-bold">
                    {event.checkInCode || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Checked In</p>
                  <p className="text-2xl font-bold">
                    {event._count.attendances}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendees ({event._count.attendances})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.attendances.length > 0 ? (
                <div className="divide-y">
                  {event.attendances.filter(att => att.member).map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary text-sm font-semibold">
                          {att.member!.firstName[0]}
                          {att.member!.lastName[0]}
                        </div>
                        <Link
                          href={`/dashboard/members/${att.member!.id}`}
                          className="font-medium hover:underline"
                        >
                          {att.member!.firstName} {att.member!.lastName}
                        </Link>
                      </div>
                      {att.checkInTime && (
                        <span className="text-sm text-muted-foreground">
                          {new Date(att.checkInTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No check-ins yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registered</span>
                <span className="font-semibold">
                  {event._count.registrations}
                  {event.maxAttendees && ` / ${event.maxAttendees}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Checked In</span>
                <span className="font-semibold">{event._count.attendances}</span>
              </div>
              {event.requiresRegistration && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Registration</span>
                  <Badge variant="secondary">Required</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Date & Time</p>
                <p className="font-medium">{startDate.toLocaleDateString()}</p>
                <p className="text-sm">
                  {startDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {endDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {event.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <Badge
                  variant="outline"
                  className={getCategoryColor(event.category)}
                >
                  {event.category.replace("_", " ")}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visibility</p>
                <p className="font-medium">
                  {event.isPublic ? "Public" : "Private"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/events/${event.id}/edit`}>
                <Button variant="outline" className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Event
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Event
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
