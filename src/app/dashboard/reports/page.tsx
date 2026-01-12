import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  UserCheck,
  UserPlus,
  Clock,
  Download,
  BarChart3,
  PieChart,
  ArrowRight,
} from "lucide-react";

async function getReportStats(churchId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Get last 4 weeks of attendance
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const count = await prisma.attendance.count({
      where: {
        churchId,
        date: { gte: weekStart, lt: weekEnd },
        status: "PRESENT",
      },
    });

    weeks.unshift({
      week: `Week ${4 - i}`,
      count,
      startDate: weekStart,
    });
  }

  const [
    totalMembers,
    newMembersThisMonth,
    newMembersLastMonth,
    donationsThisMonth,
    donationsLastMonth,
    yearToDateDonations,
    totalDonors,
    averageAttendance,
    checkInsToday,
    activeVolunteers,
    upcomingEvents,
  ] = await Promise.all([
    prisma.member.count({ where: { churchId } }),
    prisma.member.count({
      where: {
        churchId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.member.count({
      where: {
        churchId,
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    }),
    prisma.donation.aggregate({
      where: {
        churchId,
        donatedAt: { gte: thirtyDaysAgo },
        paymentStatus: "COMPLETED",
      },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: {
        churchId,
        donatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        paymentStatus: "COMPLETED",
      },
      _sum: { amount: true },
    }),
    prisma.donation.aggregate({
      where: {
        churchId,
        donatedAt: { gte: startOfYear },
        paymentStatus: "COMPLETED",
      },
      _sum: { amount: true },
    }),
    prisma.donation.groupBy({
      by: ["memberId"],
      where: {
        churchId,
        memberId: { not: null },
        donatedAt: { gte: startOfYear },
      },
    }),
    prisma.attendance.count({
      where: {
        churchId,
        date: { gte: thirtyDaysAgo },
        status: "PRESENT",
      },
    }),
    prisma.checkIn.count({
      where: {
        churchId,
        checkInTime: { gte: new Date(now.setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.volunteer.count({
      where: { churchId, status: "ACTIVE" },
    }),
    prisma.event.count({
      where: {
        churchId,
        startDate: { gte: now },
      },
    }),
  ]);

  const thisMonthDonations = donationsThisMonth._sum.amount || 0;
  const lastMonthDonations = donationsLastMonth._sum.amount || 0;
  const donationGrowth =
    lastMonthDonations > 0
      ? ((thisMonthDonations - lastMonthDonations) / lastMonthDonations) * 100
      : 0;

  const memberGrowth =
    newMembersLastMonth > 0
      ? ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100
      : 0;

  return {
    totalMembers,
    newMembersThisMonth,
    memberGrowth,
    thisMonthDonations,
    donationGrowth,
    yearToDateDonations: yearToDateDonations._sum.amount || 0,
    totalDonors: totalDonors.length,
    averageWeeklyAttendance: Math.round(averageAttendance / 4),
    checkInsToday,
    activeVolunteers,
    upcomingEvents,
    attendanceByWeek: weeks,
  };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, currency: true } } },
  });
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const stats = await getReportStats(churchData.churchId);
  const currency = churchData.church.currency;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Insights and metrics for your church
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Members
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs flex items-center gap-1">
              {stats.memberGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stats.memberGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.memberGrowth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New Members
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newMembersThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Giving
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.thisMonthDonations)}
            </div>
            <p className="text-xs flex items-center gap-1">
              {stats.donationGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stats.donationGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                {stats.donationGrowth.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Weekly Attendance
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageWeeklyAttendance}</div>
            <p className="text-xs text-muted-foreground">
              Based on last 4 weeks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Weekly Attendance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-around gap-4">
            {stats.attendanceByWeek.map((week, index) => {
              const maxCount = Math.max(...stats.attendanceByWeek.map((w) => w.count));
              const height = maxCount > 0 ? (week.count / maxCount) * 100 : 0;
              return (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-sm font-medium">{week.count}</span>
                  <div
                    className="w-full bg-primary rounded-t-md transition-all"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{week.week}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Financial Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Summary
            </CardTitle>
            <Link href="/dashboard/donations">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Year to Date</span>
              <span className="font-semibold text-lg">
                {formatCurrency(stats.yearToDateDonations)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">This Month</span>
              <span className="font-semibold">
                {formatCurrency(stats.thisMonthDonations)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Total Donors (YTD)</span>
              <span className="font-semibold">{stats.totalDonors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Avg. per Donor</span>
              <span className="font-semibold">
                {stats.totalDonors > 0
                  ? formatCurrency(stats.yearToDateDonations / stats.totalDonors)
                  : "$0"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Check-ins Today</span>
              </div>
              <span className="font-semibold">{stats.checkInsToday}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Active Volunteers</span>
              </div>
              <span className="font-semibold">{stats.activeVolunteers}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Upcoming Events</span>
              </div>
              <span className="font-semibold">{stats.upcomingEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Volunteer Ratio</span>
              </div>
              <span className="font-semibold">
                {stats.totalMembers > 0
                  ? `${((stats.activeVolunteers / stats.totalMembers) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Links */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/reports/attendance">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <UserCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Attendance Report</p>
                  <p className="text-xs text-muted-foreground">
                    Detailed attendance data
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/reports/giving">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Giving Report</p>
                  <p className="text-xs text-muted-foreground">
                    Donation analytics
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/reports/members">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Member Report</p>
                  <p className="text-xs text-muted-foreground">
                    Growth and engagement
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/reports/groups">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <PieChart className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Group Report</p>
                  <p className="text-xs text-muted-foreground">
                    Small group metrics
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
