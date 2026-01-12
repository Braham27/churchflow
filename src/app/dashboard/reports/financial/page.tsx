import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
} from "lucide-react";

async function getFinancialData(churchId: string) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // This month's donations
  const thisMonthDonations = await prisma.donation.aggregate({
    where: { churchId, donatedAt: { gte: startOfMonth } },
    _sum: { amount: true },
    _count: true,
  });

  // Last month's donations
  const lastMonthDonations = await prisma.donation.aggregate({
    where: { churchId, donatedAt: { gte: lastMonth, lt: startOfMonth } },
    _sum: { amount: true },
    _count: true,
  });

  // Year to date
  const ytdDonations = await prisma.donation.aggregate({
    where: { churchId, donatedAt: { gte: startOfYear } },
    _sum: { amount: true },
    _count: true,
  });

  // Donations by fund
  const donationsByFund = await prisma.donation.groupBy({
    by: ["fundId"],
    where: { churchId, donatedAt: { gte: startOfYear } },
    _sum: { amount: true },
    _count: true,
  });

  // Get fund details
  const funds = await prisma.donationFund.findMany({
    where: { churchId },
    select: { id: true, name: true, goal: true },
  });

  const fundMap = new Map(funds.map((f) => [f.id, f]));

  // Donations by method
  const donationsByMethod = await prisma.donation.groupBy({
    by: ["paymentMethod"],
    where: { churchId, donatedAt: { gte: startOfYear } },
    _sum: { amount: true },
    _count: true,
  });

  // Top donors
  const topDonors = await prisma.donation.groupBy({
    by: ["memberId"],
    where: { churchId, donatedAt: { gte: startOfYear }, memberId: { not: null } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 10,
  });

  // Get donor names
  const donorIds = topDonors.map((d) => d.memberId).filter(Boolean) as string[];
  const donors = await prisma.member.findMany({
    where: { id: { in: donorIds } },
    select: { id: true, firstName: true, lastName: true },
  });
  const donorMap = new Map(donors.map((d) => [d.id, d]));

  // Monthly trend for the year
  const monthlyTrend = [];
  for (let i = 0; i < 12; i++) {
    const monthStart = new Date(now.getFullYear(), i, 1);
    const monthEnd = new Date(now.getFullYear(), i + 1, 0);
    
    if (monthStart > now) break;

    const monthData = await prisma.donation.aggregate({
      where: {
        churchId,
        donatedAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { amount: true },
    });

    monthlyTrend.push({
      month: monthStart.toLocaleString("default", { month: "short" }),
      amount: monthData._sum.amount || 0,
    });
  }

  return {
    thisMonth: {
      amount: thisMonthDonations._sum.amount || 0,
      count: thisMonthDonations._count,
    },
    lastMonth: {
      amount: lastMonthDonations._sum.amount || 0,
      count: lastMonthDonations._count,
    },
    ytd: {
      amount: ytdDonations._sum.amount || 0,
      count: ytdDonations._count,
    },
    byFund: donationsByFund.map((d) => ({
      fund: fundMap.get(d.fundId as string),
      amount: d._sum.amount || 0,
      count: d._count,
    })),
    byMethod: donationsByMethod,
    topDonors: topDonors.map((d) => ({
      member: donorMap.get(d.memberId as string),
      amount: d._sum.amount || 0,
    })),
    monthlyTrend,
    monthlyChange:
      lastMonthDonations._sum.amount && lastMonthDonations._sum.amount > 0
        ? (((thisMonthDonations._sum.amount || 0) -
            lastMonthDonations._sum.amount) /
            lastMonthDonations._sum.amount) *
          100
        : 0,
  };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

export default async function FinancialReportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const data = await getFinancialData(churchData.churchId);

  const methodLabels: Record<string, string> = {
    CASH: "Cash",
    CHECK: "Check",
    CARD: "Card",
    BANK_TRANSFER: "Bank Transfer",
    ONLINE: "Online",
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
            <h1 className="text-2xl font-bold">Financial Report</h1>
            <p className="text-muted-foreground">
              Donation trends and giving patterns
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
                <p className="text-3xl font-bold">
                  ${data.thisMonth.amount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.thisMonth.count} donations
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
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
                <p className="text-3xl font-bold">
                  ${data.ytd.amount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.ytd.count} donations
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Donation</p>
                <p className="text-3xl font-bold">
                  $
                  {data.ytd.count
                    ? (data.ytd.amount / data.ytd.count).toFixed(0)
                    : 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Giving Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-64">
            {data.monthlyTrend.map((month, i) => {
              const maxAmount = Math.max(...data.monthlyTrend.map((m) => m.amount));
              const height =
                maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
              return (
                <div
                  key={month.month}
                  className="flex-1 flex flex-col items-center justify-end"
                >
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${month.month}: $${month.amount.toLocaleString()}`}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {month.month}
                  </p>
                  <p className="text-xs font-medium">
                    ${(month.amount / 1000).toFixed(0)}k
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Fund */}
        <Card>
          <CardHeader>
            <CardTitle>Giving by Fund (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.byFund.map((item) => {
                const percentage =
                  data.ytd.amount > 0 ? (item.amount / data.ytd.amount) * 100 : 0;
                return (
                  <div key={item.fund?.id || "unknown"}>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full bg-primary"
                        />
                        <span>{item.fund?.name || "Unassigned"}</span>
                      </div>
                      <span>
                        ${item.amount.toLocaleString()} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all bg-primary"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* By Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Giving by Method (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.byMethod.map((item) => {
                const percentage =
                  data.ytd.amount > 0
                    ? ((item._sum.amount || 0) / data.ytd.amount) * 100
                    : 0;
                return (
                  <div key={item.paymentMethod}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{methodLabels[item.paymentMethod] || item.paymentMethod}</span>
                      <span>
                        ${(item._sum.amount || 0).toLocaleString()} (
                        {percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Donors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Donors (YTD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topDonors.map((donor, index) => (
              <div
                key={donor.member?.id || index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">
                    {donor.member
                      ? `${donor.member.firstName} ${donor.member.lastName}`
                      : "Anonymous"}
                  </span>
                </div>
                <span className="font-bold text-green-600">
                  ${donor.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
