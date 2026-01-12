import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Users,
  UserCheck,
  Clock,
  Calendar,
  Baby,
  ExternalLink,
  Monitor,
  ArrowRight,
} from "lucide-react";

async function getCheckInStats(churchId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  const [
    todayCheckIns,
    weekCheckIns,
    activeEvents,
    recentCheckIns,
  ] = await Promise.all([
    prisma.checkIn.count({
      where: {
        churchId,
        checkInTime: { gte: today },
      },
    }),
    prisma.checkIn.count({
      where: {
        churchId,
        checkInTime: { gte: thisWeekStart },
      },
    }),
    prisma.event.findMany({
      where: {
        churchId,
        startDate: { lte: new Date(now.getTime() + 2 * 60 * 60 * 1000) }, // Within 2 hours
        endDate: { gte: now },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        _count: { select: { checkIns: true } },
      },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    prisma.checkIn.findMany({
      where: { churchId },
      orderBy: { checkInTime: "desc" },
      take: 10,
      include: {
        member: { select: { firstName: true, lastName: true } },
        event: { select: { title: true } },
      },
    }),
  ]);

  return {
    todayCheckIns,
    weekCheckIns,
    activeEvents,
    recentCheckIns,
  };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true, slug: true } } },
  });
}

export default async function CheckInPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const stats = await getCheckInStats(churchData.churchId);
  const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/c/${churchData.church.slug}/checkin`;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Check-In</h1>
          <p className="text-muted-foreground">
            Track attendance with QR codes and self-service check-in
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/checkin/kiosk" target="_blank">
            <Button variant="outline">
              <Monitor className="mr-2 h-4 w-4" />
              Launch Kiosk
            </Button>
          </Link>
          <Link href="/dashboard/checkin/manual">
            <Button>
              <UserCheck className="mr-2 h-4 w-4" />
              Manual Check-In
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Check-Ins
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCheckIns}</div>
            <p className="text-xs text-muted-foreground">
              People checked in today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekCheckIns}</div>
            <p className="text-xs text-muted-foreground">
              Total weekly check-ins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Activity
            </CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentCheckIns.length}</div>
            <p className="text-xs text-muted-foreground">
              Latest check-ins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Events
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Events with check-in enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Self-Service Check-In Link */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg text-primary-foreground">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Self-Service Check-In</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share this link or QR code for members to check themselves in
              </p>
              <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block break-all">
                {checkInUrl}
              </code>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(checkInUrl)}
            >
              Copy Link
            </Button>
            <Link href="/dashboard/checkin/qr">
              <Button>
                <QrCode className="mr-2 h-4 w-4" />
                View QR Code
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Events for Check-In */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Events</CardTitle>
            <Link href="/dashboard/events">
              <Button variant="ghost" size="sm">
                Manage Events
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.activeEvents.length > 0 ? (
              <div className="space-y-4">
                {stats.activeEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">{event._count.checkIns}</p>
                        <p className="text-xs text-muted-foreground">checked in</p>
                      </div>
                      <Link href={`/dashboard/events/${event.id}/checkin`}>
                        <Button variant="outline" size="sm">
                          <QrCode className="mr-2 h-4 w-4" />
                          Check-In
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No active events with check-in enabled</p>
                <Link href="/dashboard/events/new">
                  <Button variant="link" size="sm">Create an event</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-Ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Check-Ins</CardTitle>
            <Link href="/dashboard/checkin/history">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentCheckIns.length > 0 ? (
              <div className="divide-y">
                {stats.recentCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-400">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {checkIn.member?.firstName} {checkIn.member?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {checkIn.event?.title || "General Check-In"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(checkIn.checkInTime)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No check-ins yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/checkin/manual">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Manual Check-In</p>
                  <p className="text-xs text-muted-foreground">
                    Check in members manually
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/checkin/child">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Baby className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Child Check-In</p>
                  <p className="text-xs text-muted-foreground">
                    Secure kids ministry check-in
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/attendance">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Attendance Reports</p>
                  <p className="text-xs text-muted-foreground">
                    View attendance trends
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/checkin/settings">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Monitor className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Kiosk Settings</p>
                  <p className="text-xs text-muted-foreground">
                    Configure check-in stations
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
