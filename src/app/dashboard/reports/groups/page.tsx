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
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  UserPlus,
  Calendar,
} from "lucide-react";

const groupStats = [
  {
    title: "Total Groups",
    value: "24",
    change: "+2",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Total Members",
    value: "342",
    change: "+28",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "Avg. Attendance",
    value: "78%",
    change: "+5%",
    trend: "up",
    period: "vs last month",
  },
  {
    title: "New Signups",
    value: "45",
    change: "+12",
    trend: "up",
    period: "vs last month",
  },
];

const groupsData = [
  { 
    name: "Young Adults", 
    category: "Age Group",
    members: 45, 
    avgAttendance: 82,
    meetings: 4,
    leader: "Pastor Mike"
  },
  { 
    name: "Men's Bible Study", 
    category: "Bible Study",
    members: 28, 
    avgAttendance: 75,
    meetings: 4,
    leader: "John Smith"
  },
  { 
    name: "Women's Fellowship", 
    category: "Fellowship",
    members: 35, 
    avgAttendance: 88,
    meetings: 4,
    leader: "Sarah Johnson"
  },
  { 
    name: "Marriage & Family", 
    category: "Life Stage",
    members: 24, 
    avgAttendance: 70,
    meetings: 2,
    leader: "The Davises"
  },
  { 
    name: "College & Career", 
    category: "Age Group",
    members: 32, 
    avgAttendance: 65,
    meetings: 4,
    leader: "Emily Chen"
  },
  { 
    name: "Senior Saints", 
    category: "Age Group",
    members: 18, 
    avgAttendance: 90,
    meetings: 4,
    leader: "Bob Wilson"
  },
];

const categoryBreakdown = [
  { category: "Bible Study", groups: 6, members: 85 },
  { category: "Age Group", groups: 8, members: 142 },
  { category: "Life Stage", groups: 4, members: 52 },
  { category: "Fellowship", groups: 3, members: 38 },
  { category: "Interest", groups: 3, members: 25 },
];

const monthlyGrowth = [
  { month: "Aug", members: 285 },
  { month: "Sep", members: 298 },
  { month: "Oct", members: 312 },
  { month: "Nov", members: 328 },
  { month: "Dec", members: 335 },
  { month: "Jan", members: 342 },
];

export default async function GroupsReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const maxMembers = Math.max(...monthlyGrowth.map(m => m.members));
  const minMembers = Math.min(...monthlyGrowth.map(m => m.members));
  const range = maxMembers - minMembers;

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
          <h1 className="text-3xl font-bold">Groups Reports</h1>
          <p className="text-muted-foreground">
            Track group engagement and growth metrics
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
        {groupStats.map((stat) => (
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
        {/* Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Group Membership Growth
            </CardTitle>
            <CardDescription>Total members across all groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-4">
              {monthlyGrowth.map((data) => (
                <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-medium">{data.members}</span>
                  <div 
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ 
                      height: `${((data.members - minMembers) / range) * 80 + 20}%` 
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              By Category
            </CardTitle>
            <CardDescription>Groups and members by type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{cat.category}</p>
                  <p className="text-xs text-muted-foreground">{cat.groups} groups</p>
                </div>
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {cat.members}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Groups</CardTitle>
              <CardDescription>Detailed breakdown of each group</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
              <span className="col-span-2">Group Name</span>
              <span className="text-center">Members</span>
              <span className="text-center">Attendance</span>
              <span className="text-center">Meetings</span>
              <span>Leader</span>
            </div>
            {groupsData.map((group) => (
              <div
                key={group.name}
                className="grid grid-cols-6 gap-4 items-center p-3 rounded-lg hover:bg-muted/50"
              >
                <div className="col-span-2">
                  <p className="font-medium">{group.name}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {group.category}
                  </Badge>
                </div>
                <div className="text-center">
                  <span className="font-medium">{group.members}</span>
                </div>
                <div className="text-center">
                  <span className={`font-medium ${
                    group.avgAttendance >= 80 
                      ? "text-green-600"
                      : group.avgAttendance >= 70
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}>
                    {group.avgAttendance}%
                  </span>
                </div>
                <div className="text-center flex items-center justify-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{group.meetings}/mo</span>
                </div>
                <div>
                  <span className="text-sm">{group.leader}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
