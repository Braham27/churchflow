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
  CreditCard,
  TrendingUp,
  DollarSign,
  Users,
  RefreshCw,
  Calendar,
  ArrowRight,
} from "lucide-react";

async function getDonationStats(churchId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    thisMonthTotal,
    lastMonthTotal,
    yearTotal,
    totalDonors,
    recurringCount,
    recentDonations,
    donationFunds,
  ] = await Promise.all([
    prisma.donation.aggregate({
      where: {
        churchId,
        donatedAt: { gte: startOfMonth },
        paymentStatus: "COMPLETED",
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.donation.aggregate({
      where: {
        churchId,
        donatedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
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
        paymentStatus: "COMPLETED",
      },
    }),
    prisma.donation.count({
      where: {
        churchId,
        isRecurring: true,
        paymentStatus: "COMPLETED",
      },
    }),
    prisma.donation.findMany({
      where: { churchId },
      orderBy: { donatedAt: "desc" },
      take: 10,
      include: {
        member: { select: { firstName: true, lastName: true } },
        fund: { select: { name: true } },
      },
    }),
    prisma.donationFund.findMany({
      where: { churchId, isActive: true },
      include: {
        _count: { select: { donations: true } },
      },
    }),
  ]);

  return {
    thisMonth: thisMonthTotal._sum.amount || 0,
    thisMonthCount: thisMonthTotal._count,
    lastMonth: lastMonthTotal._sum.amount || 0,
    yearTotal: yearTotal._sum.amount || 0,
    totalDonors: totalDonors.length,
    recurringCount,
    recentDonations,
    donationFunds,
  };
}

async function getChurchData(userId: string) {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, currency: true } } },
  });
  return churchUser;
}

export default async function DonationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const stats = await getDonationStats(churchData.churchId);
  const currency = churchData.church.currency;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const growthPercent =
    stats.lastMonth > 0
      ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100
      : 0;

  const paymentMethodLabels: Record<string, string> = {
    CARD: "Card",
    BANK_TRANSFER: "Bank",
    CASH: "Cash",
    CHECK: "Check",
    TEXT_TO_GIVE: "Text",
    MOBILE_APP: "App",
    KIOSK: "Kiosk",
    OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Donations</h1>
          <p className="text-muted-foreground">
            Track and manage giving at your church
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/donations/funds">
            <Button variant="outline">
              Manage Funds
            </Button>
          </Link>
          <Link href="/dashboard/donations/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Donation
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {growthPercent >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
              )}
              {growthPercent.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Year to Date
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.yearTotal)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.thisMonthCount} donations this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonors}</div>
            <p className="text-xs text-muted-foreground">
              Unique givers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recurring Gifts
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recurringCount}</div>
            <p className="text-xs text-muted-foreground">
              Active recurring donations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Donations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Donations</CardTitle>
            <Link href="/dashboard/donations/all">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentDonations.length > 0 ? (
              <div className="divide-y">
                {stats.recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full text-green-600 dark:text-green-400">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {donation.isAnonymous
                          ? "Anonymous"
                          : donation.member
                          ? `${donation.member.firstName} ${donation.member.lastName}`
                          : donation.donorName || "Guest"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {donation.fund?.name || "General Fund"} •{" "}
                        {paymentMethodLabels[donation.paymentMethod]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        +{formatCurrency(donation.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(donation.donatedAt)}
                      </p>
                    </div>
                    {donation.isRecurring && (
                      <Badge variant="outline" className="hidden sm:flex">
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No donations yet</p>
                <Link href="/dashboard/donations/new">
                  <Button variant="link">Record your first donation</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donation Funds */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Donation Funds</CardTitle>
            <Link href="/dashboard/donations/funds/new">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.donationFunds.length > 0 ? (
              <div className="space-y-4">
                {stats.donationFunds.map((fund) => (
                  <div key={fund.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{fund.name}</span>
                      {fund.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    {fund.goal && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{formatCurrency(fund.raised)}</span>
                          <span>{formatCurrency(fund.goal)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${Math.min((fund.raised / fund.goal) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {fund._count.donations} donations
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No funds created</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
