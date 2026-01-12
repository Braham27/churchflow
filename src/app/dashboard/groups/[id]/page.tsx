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
  Edit,
  MoreVertical,
  Users,
  Calendar,
  MapPin,
  Mail,
  UserPlus,
  Settings,
} from "lucide-react";
import { notFound } from "next/navigation";

async function getGroup(id: string, churchId: string) {
  return prisma.group.findFirst({
    where: { id, churchId },
    include: {
      members: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              photo: true,
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      },
    },
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const resolvedParams = await params;
  const group = await getGroup(resolvedParams.id, churchData.churchId);

  if (!group) {
    notFound();
  }

  const categoryLabels: Record<string, string> = {
    SMALL_GROUP: "Small Group",
    MINISTRY: "Ministry",
    CLASS: "Class",
    COMMITTEE: "Committee",
    TEAM: "Team",
    OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/groups">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">
                {categoryLabels[group.category]}
              </Badge>
              <Badge
                variant={group.status === "ACTIVE" ? "default" : "secondary"}
              >
                {group.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Group
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {group.description && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{group.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Group Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Group Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.meetingDay && (
                  <div>
                    <p className="text-sm text-muted-foreground">Meeting Day</p>
                    <p className="font-medium capitalize">
                      {group.meetingDay.toLowerCase()}
                    </p>
                  </div>
                )}
                {group.meetingTime && (
                  <div>
                    <p className="text-sm text-muted-foreground">Meeting Time</p>
                    <p className="font-medium">{group.meetingTime}</p>
                  </div>
                )}
                {group.location && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {group.location}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Group Leader */}
          {group.leader && (
            <Card>
              <CardHeader>
                <CardTitle>Group Leader</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {group.leader.firstName[0]}
                    {group.leader.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/dashboard/members/${group.leader.id}`}
                      className="font-semibold hover:underline"
                    >
                      {group.leader.firstName} {group.leader.lastName}
                    </Link>
                    {group.leader.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {group.leader.email}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({group.members.length}
                {group.maxMembers && ` / ${group.maxMembers}`})
              </CardTitle>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {group.members.length > 0 ? (
                <div className="space-y-3">
                  {group.members.map((gm) => (
                    <div
                      key={gm.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                          {gm.member.firstName[0]}
                          {gm.member.lastName[0]}
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/members/${gm.member.id}`}
                            className="font-medium hover:underline"
                          >
                            {gm.member.firstName} {gm.member.lastName}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Joined {formatDate(gm.joinedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {gm.role.toLowerCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No members in this group yet</p>
                  <Button className="mt-4">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-bold">{group.members.length}</span>
              </div>
              {group.maxMembers && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Capacity</span>
                  <span className="font-bold">{group.maxMembers}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Created</span>
                <span className="font-bold text-sm">
                  {formatDate(group.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Capacity Progress */}
          {group.maxMembers && (
            <Card>
              <CardHeader>
                <CardTitle>Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{group.members.length} members</span>
                    <span>{group.maxMembers} max</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (group.members.length / group.maxMembers) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {group.maxMembers - group.members.length} spots remaining
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Email Group
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Members
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
