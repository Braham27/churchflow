import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const givingStats = [
  {
    title: "Total Giving",
    value: "$48,250",
    change: "+12.5%",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Average Gift",
    value: "$127",
    change: "+5.2%",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Unique Donors",
    value: "380",
    change: "+18",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Recurring Donors",
    value: "145",
    change: "+8",
    trend: "up",
    period: "vs last month",
  },
];

const fundBreakdown = [
  { name: "General Fund", amount: 28500, percentage: 59 },
  { name: "Building Fund", amount: 8750, percentage: 18 },
  { name: "Missions", amount: 6200, percentage: 13 },
  { name: "Youth Ministry", amount: 3100, percentage: 6 },
  { name: "Benevolence", amount: 1700, percentage: 4 },
];

const topDonors = [
  { name: "Anonymous", amount: 5000, gifts: 12 },
  { name: "Johnson Family", amount: 3600, gifts: 12 },
  { name: "Smith, Robert", amount: 2400, gifts: 12 },
  { name: "Williams, Sarah", amount: 2100, gifts: 10 },
  { name: "Davis, Michael", amount: 1800, gifts: 8 },
];

const monthlyData = [
  { month: "Jan", amount: 42500 },
  { month: "Feb", amount: 38200 },
  { month: "Mar", amount: 45800 },
  { month: "Apr", amount: 41200 },
  { month: "May", amount: 39500 },
  { month: "Jun", amount: 44100 },
  { month: "Jul", amount: 37800 },
  { month: "Aug", amount: 43200 },
  { month: "Sep", amount: 46500 },
  { month: "Oct", amount: 48900 },
  { month: "Nov", amount: 52300 },
  { month: "Dec", amount: 48250 },
];

export default async function GivingReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const maxAmount = Math.max(...monthlyData.map(d => d.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Giving Reports</h1>
          <p className="text-muted-foreground">
            Track donations and analyze giving patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">2025</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {givingStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Giving Trend</CardTitle>
            <CardDescription>Total donations per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-2">
              {monthlyData.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${(data.amount / maxAmount) * 100}%` }}
                    title={`$${data.amount.toLocaleString()}`}
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fund Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Fund Breakdown</CardTitle>
            <CardDescription>This month&apos;s giving by fund</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fundBreakdown.map((fund) => (
              <div key={fund.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{fund.name}</span>
                  <span className="font-medium">${fund.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${fund.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Donors */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Donors</CardTitle>
              <CardDescription>Highest contributors this year</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDonors.map((donor, index) => (
              <div
                key={donor.name}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{donor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {donor.gifts} gifts this year
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">${donor.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total given</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
