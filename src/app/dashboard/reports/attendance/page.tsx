import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
} from "lucide-react";

async function getAttendanceData(churchId: string) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // This month check-ins
  const thisMonthCheckins = await prisma.checkIn.count({
    where: { churchId, checkInTime: { gte: startOfMonth } },
  });

  // Last month check-ins
  const lastMonthCheckins = await prisma.checkIn.count({
    where: {
      churchId,
      checkInTime: { gte: lastMonth, lt: startOfMonth },
    },
  });

  // YTD check-ins
  const ytdCheckins = await prisma.checkIn.count({
    where: { churchId, checkInTime: { gte: startOfYear } },
  });

  // Average attendance
  const uniqueAttendees = await prisma.checkIn.groupBy({
    by: ["memberId"],
    where: { churchId, checkInTime: { gte: startOfYear } },
    _count: true,
  });

  // Check-ins by event type
  const checkinsByEventType = await prisma.$queryRaw`
    SELECT e."type", COUNT(c.id) as count
    FROM "CheckIn" c
    JOIN "Event" e ON c."eventId" = e.id
    WHERE c."churchId" = ${churchId}
    AND c."checkInTime" >= ${startOfYear}
    GROUP BY e."type"
  ` as { type: string; count: bigint }[];

  // Weekly trend (last 12 weeks)
  const weeklyTrend = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7 + now.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const count = await prisma.checkIn.count({
      where: {
        churchId,
        checkInTime: { gte: weekStart, lte: weekEnd },
      },
    });

    weeklyTrend.push({
      week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
      count,
    });
  }

  // Recent events with attendance
  const recentEvents = await prisma.event.findMany({
    where: { churchId, startDate: { lte: now } },
    orderBy: { startDate: "desc" },
    take: 10,
    include: {
      _count: { select: { checkIns: true } },
    },
  });

  return {
    thisMonth: thisMonthCheckins,
    lastMonth: lastMonthCheckins,
    ytd: ytdCheckins,
    uniqueAttendees: uniqueAttendees.length,
    monthlyChange:
      lastMonthCheckins > 0
        ? ((thisMonthCheckins - lastMonthCheckins) / lastMonthCheckins) * 100
        : 0,
    byEventType: checkinsByEventType.map((e) => ({
      type: e.type,
      count: Number(e.count),
    })),
    weeklyTrend,
    recentEvents,
  };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

export default async function AttendanceReportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const data = await getAttendanceData(churchData.churchId);

  const eventTypeLabels: Record<string, string> = {
    SERVICE: "Worship Service",
    CLASS: "Class",
    MEETING: "Meeting",
    SPECIAL_EVENT: "Special Event",
    SMALL_GROUP: "Small Group",
    YOUTH: "Youth",
    CHILDREN: "Children",
    OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Attendance Report</h1>
            <p className="text-muted-foreground">
              Check-in trends and event attendance
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-3xl font-bold">{data.thisMonth}</p>
                <p className="text-sm text-muted-foreground">check-ins</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">vs Last Month</p>
                <p
                  className={`text-3xl font-bold ${
                    data.monthlyChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {data.monthlyChange > 0 ? "+" : ""}
                  {data.monthlyChange.toFixed(1)}%
                </p>
              </div>
              {data.monthlyChange >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Year to Date</p>
                <p className="text-3xl font-bold">{data.ytd}</p>
                <p className="text-sm text-muted-foreground">check-ins</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Attendees</p>
                <p className="text-3xl font-bold">{data.uniqueAttendees}</p>
                <p className="text-sm text-muted-foreground">this year</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Attendance (Last 12 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-64">
            {data.weeklyTrend.map((week) => {
              const maxCount = Math.max(...data.weeklyTrend.map((w) => w.count));
              const height = maxCount > 0 ? (week.count / maxCount) * 100 : 0;
              return (
                <div
                  key={week.week}
                  className="flex-1 flex flex-col items-center justify-end"
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`Week of ${week.week}: ${week.count} check-ins`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {week.week}
                  </p>
                  <p className="text-xs font-medium">{week.count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Event Type */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance by Event Type (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.byEventType.map((item) => {
                const percentage =
                  data.ytd > 0 ? (item.count / data.ytd) * 100 : 0;
                return (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{eventTypeLabels[item.type] || item.type}</span>
                      <span>
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Event Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{event._count.checkIns}</p>
                    <p className="text-xs text-muted-foreground">check-ins</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
