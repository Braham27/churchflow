import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Clock,
  Award,
  TrendingUp,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const volunteerStats = [
  {
    title: "Total Volunteers",
    value: "87",
    change: "+12",
    period: "vs last month",
  },
  {
    title: "Active This Month",
    value: "65",
    change: "+8",
    period: "vs last month",
  },
  {
    title: "Hours Served",
    value: "1,245",
    change: "+180",
    period: "vs last month",
  },
  {
    title: "Avg. Hours/Volunteer",
    value: "14.3",
    change: "+2.1",
    period: "vs last month",
  },
];

const roleBreakdown = [
  { role: "Worship Team", volunteers: 18, hours: 324, shifts: 48 },
  { role: "Greeters", volunteers: 24, hours: 192, shifts: 96 },
  { role: "Ushers", volunteers: 16, hours: 144, shifts: 64 },
  { role: "Children's Ministry", volunteers: 20, hours: 480, shifts: 80 },
  { role: "Tech/AV", volunteers: 8, hours: 256, shifts: 32 },
  { role: "Hospitality", volunteers: 12, hours: 108, shifts: 36 },
];

const topVolunteers = [
  { name: "Sarah Johnson", role: "Children's Ministry", hours: 48, reliability: 100 },
  { name: "Michael Chen", role: "Tech/AV", hours: 42, reliability: 98 },
  { name: "Emily Davis", role: "Worship Team", hours: 38, reliability: 95 },
  { name: "David Wilson", role: "Greeters", hours: 32, reliability: 100 },
  { name: "Lisa Anderson", role: "Hospitality", hours: 28, reliability: 92 },
];

const upcomingShifts = [
  { date: "Jan 12", role: "Greeter", slots: 4, filled: 3, status: "needs-help" },
  { date: "Jan 12", role: "Nursery", slots: 3, filled: 3, status: "filled" },
  { date: "Jan 12", role: "Usher", slots: 4, filled: 4, status: "filled" },
  { date: "Jan 19", role: "Greeter", slots: 4, filled: 2, status: "needs-help" },
  { date: "Jan 19", role: "Sound Tech", slots: 2, filled: 2, status: "filled" },
];

export default async function VolunteerReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

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
          <h1 className="text-3xl font-bold">Volunteer Reports</h1>
          <p className="text-muted-foreground">
            Track volunteer engagement and service hours
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">January 2026</span>
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
        {volunteerStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.period}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Role Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Service by Role</CardTitle>
            <CardDescription>Hours and shifts breakdown by ministry role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground border-b pb-2">
                <span>Role</span>
                <span className="text-center">Volunteers</span>
                <span className="text-center">Hours</span>
                <span className="text-center">Shifts</span>
              </div>
              {roleBreakdown.map((role) => (
                <div key={role.role} className="grid grid-cols-4 gap-2 items-center">
                  <span className="font-medium text-sm">{role.role}</span>
                  <span className="text-center">{role.volunteers}</span>
                  <span className="text-center">{role.hours}</span>
                  <span className="text-center">{role.shifts}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Shifts */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Shifts</CardTitle>
            <CardDescription>Volunteer coverage for upcoming services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingShifts.map((shift, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    shift.status === "needs-help" 
                      ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {shift.status === "filled" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{shift.role}</p>
                      <p className="text-xs text-muted-foreground">{shift.date}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={shift.status === "filled" ? "secondary" : "outline"}
                    className={shift.status === "needs-help" ? "border-orange-500 text-orange-600" : ""}
                  >
                    {shift.filled}/{shift.slots} filled
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Volunteers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Volunteers This Month
              </CardTitle>
              <CardDescription>Most active volunteers by hours served</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topVolunteers.map((volunteer, index) => (
              <div
                key={volunteer.name}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                    index === 0 
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                      : index === 1
                      ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      : index === 2
                      ? "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{volunteer.name}</p>
                    <p className="text-sm text-muted-foreground">{volunteer.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="font-bold">{volunteer.hours}h</p>
                    <p className="text-xs text-muted-foreground">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-green-600">{volunteer.reliability}%</p>
                    <p className="text-xs text-muted-foreground">Reliability</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
