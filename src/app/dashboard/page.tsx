import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Clock,
} from "lucide-react";

async function getChurchData(userId: string) {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    include: {
      church: {
        include: {
          _count: {
            select: {
              members: true,
              events: true,
              donations: true,
              volunteers: true,
            },
          },
        },
      },
    },
  });

  if (!churchUser) return null;

  // Get recent stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // This month's donations
  const thisMonthDonations = await prisma.donation.aggregate({
    where: {
      churchId: churchUser.churchId,
      donatedAt: { gte: startOfMonth },
      paymentStatus: "COMPLETED",
    },
    _sum: { amount: true },
  });

  // Last month's donations
  const lastMonthDonations = await prisma.donation.aggregate({
    where: {
      churchId: churchUser.churchId,
      donatedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      paymentStatus: "COMPLETED",
    },
    _sum: { amount: true },
  });

  // Upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: {
      churchId: churchUser.churchId,
      startDate: { gte: now },
      isPublished: true,
    },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  // Recent members
  const recentMembers = await prisma.member.findMany({
    where: { churchId: churchUser.churchId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // New members this month
  const newMembersThisMonth = await prisma.member.count({
    where: {
      churchId: churchUser.churchId,
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    church: churchUser.church,
    role: churchUser.role,
    stats: {
      totalMembers: churchUser.church._count.members,
      totalEvents: churchUser.church._count.events,
      totalDonations: churchUser.church._count.donations,
      totalVolunteers: churchUser.church._count.volunteers,
      thisMonthDonations: thisMonthDonations._sum.amount || 0,
      lastMonthDonations: lastMonthDonations._sum.amount || 0,
      newMembersThisMonth,
    },
    upcomingEvents,
    recentMembers,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const data = await getChurchData(session.user.id);

  if (!data) {
    redirect("/onboarding");
  }

  const { church, stats, upcomingEvents, recentMembers } = data;

  const donationGrowth =
    stats.lastMonthDonations > 0
      ? ((stats.thisMonthDonations - stats.lastMonthDonations) / stats.lastMonthDonations) * 100
      : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: church.currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{church.name}</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening at your church.</p>
      </div>

      {/* Trial Banner */}
      {church.subscriptionStatus === "TRIAL" && church.trialEndsAt && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-primary">Free Trial Active</p>
            <p className="text-sm text-muted-foreground">
              Your trial ends on {formatDate(church.trialEndsAt)}
            </p>
          </div>
          <Link href="/dashboard/settings/billing">
            <Button size="sm">Upgrade Now</Button>
          </Link>
        </div>
      )}

      {/* Stats Cards */}
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
            <p className="text-xs text-muted-foreground">
              +{stats.newMembersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month&apos;s Giving
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.thisMonthDonations)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {donationGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
              )}
              {donationGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              In the next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Volunteers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
            <p className="text-xs text-muted-foreground">
              Ready to serve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Events</CardTitle>
            <Link href="/dashboard/events">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary">
                      <span className="text-xs font-medium">
                        {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="font-medium hover:text-primary truncate block"
                      >
                        {event.title}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.startDate)}
                        {event.location && (
                          <>
                            <span>•</span>
                            <span className="truncate">{event.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events</p>
                <Link href="/dashboard/events/new">
                  <Button variant="link" className="mt-2">
                    Create your first event
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Members</CardTitle>
            <Link href="/dashboard/members">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentMembers.length > 0 ? (
              <div className="space-y-4">
                {recentMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary font-medium">
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/members/${member.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {member.firstName} {member.lastName}
                      </Link>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email || "No email"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(member.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No members yet</p>
                <Link href="/dashboard/members/new">
                  <Button variant="link" className="mt-2">
                    Add your first member
                  </Button>
                </Link>
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
            <Link href="/dashboard/members/new">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Link>
            <Link href="/dashboard/events/new">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
            <Link href="/dashboard/communications/new">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </Link>
            <Link href="/dashboard/donations/new">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Donation
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
