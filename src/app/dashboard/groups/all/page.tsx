import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";

async function getGroups(churchId: string) {
  return prisma.group.findMany({
    where: { churchId },
    include: {
      _count: { select: { members: true } },
      leader: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

export default async function AllGroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const groups = await getGroups(churchData.churchId);

  const categoryLabels: Record<string, string> = {
    SMALL_GROUP: "Small Group",
    MINISTRY: "Ministry",
    CLASS: "Class",
    COMMITTEE: "Committee",
    TEAM: "Team",
    OTHER: "Other",
  };

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    INACTIVE: "bg-gray-100 text-gray-800",
    ARCHIVED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Groups</h1>
          <p className="text-muted-foreground">
            {groups.length} groups total
          </p>
        </div>
        <Link href="/dashboard/groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Group
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search groups..."
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Categories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      {groups.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {categoryLabels[group.category]}
                      </Badge>
                    </div>
                    <Badge className={statusColors[group.status]}>
                      {group.status}
                    </Badge>
                  </div>

                  {group.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {group.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {group._count.members} member
                        {group._count.members !== 1 ? "s" : ""}
                        {group.maxMembers && ` / ${group.maxMembers} max`}
                      </span>
                    </div>
                    {group.leader && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Led by {group.leader.firstName} {group.leader.lastName}
                        </span>
                      </div>
                    )}
                    {group.meetingDay && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="capitalize">
                          {group.meetingDay.toLowerCase()}
                          {group.meetingTime && ` at ${group.meetingTime}`}
                        </span>
                      </div>
                    )}
                    {group.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{group.location}</span>
                      </div>
                    )}
                  </div>

                  {group.maxMembers && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>{group._count.members} members</span>
                        <span>{group.maxMembers} max</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (group._count.members / group.maxMembers) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first group to start building community
            </p>
            <Link href="/dashboard/groups/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
