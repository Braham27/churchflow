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
  UserPlus,
  UserMinus,
  Calendar,
} from "lucide-react";

async function getMembershipData(churchId: string) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  // Get member counts by status
  const membersByStatus = await prisma.member.groupBy({
    by: ["status"],
    where: { churchId },
    _count: true,
  });

  // Get member counts by type
  const membersByType = await prisma.member.groupBy({
    by: ["memberType"],
    where: { churchId },
    _count: true,
  });

  // New members this year
  const newMembersThisYear = await prisma.member.count({
    where: { churchId, createdAt: { gte: startOfYear } },
  });

  // New members this month
  const newMembersThisMonth = await prisma.member.count({
    where: { churchId, createdAt: { gte: startOfMonth } },
  });

  // Total members
  const totalMembers = await prisma.member.count({
    where: { churchId },
  });

  // Members last year (for growth calculation)
  const membersLastYear = await prisma.member.count({
    where: { churchId, createdAt: { lt: lastYear } },
  });

  // Age distribution (if birthDate is available)
  const membersWithBirthDate = await prisma.member.findMany({
    where: { churchId, birthDate: { not: null } },
    select: { birthDate: true },
  });

  const ageGroups = {
    "0-12": 0,
    "13-17": 0,
    "18-25": 0,
    "26-35": 0,
    "36-50": 0,
    "51-65": 0,
    "65+": 0,
  };

  membersWithBirthDate.forEach((m) => {
    if (!m.birthDate) return;
    const age = Math.floor(
      (Date.now() - new Date(m.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );
    if (age <= 12) ageGroups["0-12"]++;
    else if (age <= 17) ageGroups["13-17"]++;
    else if (age <= 25) ageGroups["18-25"]++;
    else if (age <= 35) ageGroups["26-35"]++;
    else if (age <= 50) ageGroups["36-50"]++;
    else if (age <= 65) ageGroups["51-65"]++;
    else ageGroups["65+"]++;
  });

  return {
    membersByStatus,
    membersByType,
    newMembersThisYear,
    newMembersThisMonth,
    totalMembers,
    membersLastYear,
    ageGroups,
    yearlyGrowth:
      membersLastYear > 0
        ? ((totalMembers - membersLastYear) / membersLastYear) * 100
        : 0,
  };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

export default async function MembershipReportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const data = await getMembershipData(churchData.churchId);

  const statusLabels: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    VISITOR: "Visitor",
    DECEASED: "Deceased",
  };

  const typeLabels: Record<string, string> = {
    MEMBER: "Member",
    VISITOR: "Visitor",
    REGULAR_ATTENDER: "Regular Attender",
    CHILD: "Child",
    STAFF: "Staff",
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
            <h1 className="text-2xl font-bold">Membership Report</h1>
            <p className="text-muted-foreground">
              Member demographics and growth trends
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
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-3xl font-bold">{data.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-3xl font-bold">{data.newMembersThisMonth}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Year</p>
                <p className="text-3xl font-bold">{data.newMembersThisYear}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yearly Growth</p>
                <p className="text-3xl font-bold">
                  {data.yearlyGrowth > 0 ? "+" : ""}
                  {data.yearlyGrowth.toFixed(1)}%
                </p>
              </div>
              <TrendingUp
                className={`h-8 w-8 ${
                  data.yearlyGrowth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Status */}
        <Card>
          <CardHeader>
            <CardTitle>Members by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.membersByStatus.map((item) => {
                const percentage = data.totalMembers
                  ? (item._count / data.totalMembers) * 100
                  : 0;
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{statusLabels[item.status] || item.status}</span>
                      <span>
                        {item._count} ({percentage.toFixed(0)}%)
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

        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle>Members by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.membersByType.map((item) => {
                const percentage = data.totalMembers
                  ? (item._count / data.totalMembers) * 100
                  : 0;
                return (
                  <div key={item.memberType}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        {typeLabels[item.memberType] || item.memberType}
                      </span>
                      <span>
                        {item._count} ({percentage.toFixed(0)}%)
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

      {/* Age Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Age Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {Object.entries(data.ageGroups).map(([range, count]) => {
              const total = Object.values(data.ageGroups).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={range} className="text-center">
                  <div className="h-32 flex items-end justify-center mb-2">
                    <div
                      className="w-full bg-primary rounded-t"
                      style={{ height: `${Math.max(percentage * 1.5, 10)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{range}</p>
                  <p className="font-bold">{count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
