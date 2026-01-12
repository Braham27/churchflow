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
  Users,
  UserPlus,
  Calendar,
  MessageSquare,
  Search,
} from "lucide-react";

async function getGroupStats(churchId: string) {
  const [groups, totalMembers] = await Promise.all([
    prisma.group.findMany({
      where: { churchId },
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.groupMember.count({
      where: { group: { churchId } },
    }),
  ]);

  // Get leader info for each group
  const groupsWithLeaders = await Promise.all(
    groups.map(async (group) => {
      let leader = null;
      if (group.leaderId) {
        leader = await prisma.member.findUnique({
          where: { id: group.leaderId },
          select: { firstName: true, lastName: true },
        });
      }
      return { ...group, leader };
    })
  );

  const groupsByCategory = groupsWithLeaders.reduce((acc, group) => {
    const category = group.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(group);
    return acc;
  }, {} as Record<string, typeof groupsWithLeaders>);

  return { groups: groupsWithLeaders, totalMembers, groupsByCategory };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true } } },
  });
}

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const stats = await getGroupStats(churchData.churchId);

  const categoryColors: Record<string, string> = {
    "Small Group": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    "Ministry Team": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    "Bible Study": "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "Sunday School": "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    "Youth": "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    "Other": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">
            Manage small groups, ministry teams, and classes
          </p>
        </div>
        <Link href="/dashboard/groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Groups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groups.length}</div>
            <p className="text-xs text-muted-foreground">
              Active groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Group Members
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Total participants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.groupsByCategory).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Group types
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search groups..."
              className="w-full h-10 pl-9 pr-4 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Groups by Category */}
      {Object.entries(stats.groupsByCategory).map(([category, groups]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Badge className={categoryColors[category] || categoryColors["Other"]}>
                {category}
              </Badge>
              <span className="text-sm text-muted-foreground font-normal">
                ({groups.length} groups)
              </span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Link key={group.id} href={`/dashboard/groups/${group.id}`}>
                <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold line-clamp-1">{group.name}</h3>
                      {group.isPublic ? (
                        <Badge variant="outline" className="shrink-0">Public</Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">Private</Badge>
                      )}
                    </div>

                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {group.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{group._count.members} members</span>
                      </div>

                      {group.leader && (
                        <span className="text-muted-foreground">
                          Led by {group.leader.firstName} {group.leader.lastName?.[0]}.
                        </span>
                      )}
                    </div>

                    {group.meetingDay && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>{group.meetingDay}{group.meetingTime && ` at ${group.meetingTime}`}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {stats.groups.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">
              Create groups to organize your congregation into small groups, ministry teams, or classes.
            </p>
            <Link href="/dashboard/groups/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/groups/new">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Plus className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Create Group</p>
                  <p className="text-xs text-muted-foreground">
                    Start a new group
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/communications/new?audience=group">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <MessageSquare className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Message Group</p>
                  <p className="text-xs text-muted-foreground">
                    Send to a specific group
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/groups/reports">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Group Reports</p>
                  <p className="text-xs text-muted-foreground">
                    View engagement data
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
