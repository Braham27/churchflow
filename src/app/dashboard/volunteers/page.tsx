import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Briefcase,
  ArrowRight,
} from "lucide-react";

async function getVolunteerStats(churchId: string) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const [
    totalVolunteers,
    activeVolunteers,
    totalRoles,
    upcomingShifts,
    recentVolunteers,
    volunteerRoles,
  ] = await Promise.all([
    prisma.volunteer.count({ where: { churchId } }),
    prisma.volunteer.count({
      where: { churchId, status: "ACTIVE" },
    }),
    prisma.volunteerRole.count({ where: { churchId } }),
    prisma.volunteerShift.count({
      where: {
        churchId,
        startTime: { gte: now },
      },
    }),
    prisma.volunteer.findMany({
      where: { churchId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            profileImage: true,
          },
        },
        role: { select: { name: true, color: true } },
      },
    }),
    prisma.volunteerRole.findMany({
      where: { churchId },
      include: {
        _count: { select: { volunteers: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Get this week's shifts with volunteers
  const weekShifts = await prisma.volunteerShift.findMany({
    where: {
      churchId,
      startTime: { gte: startOfWeek, lt: endOfWeek },
    },
    include: {
      volunteer: {
        include: {
          member: { select: { firstName: true, lastName: true } },
        },
      },
      role: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return {
    totalVolunteers,
    activeVolunteers,
    totalRoles,
    upcomingShifts,
    recentVolunteers,
    volunteerRoles,
    weekShifts,
  };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true } } },
  });
}

export default async function VolunteersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const stats = await getVolunteerStats(churchData.churchId);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
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

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    INACTIVE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    ON_LEAVE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    ON_LEAVE: "On Leave",
    PENDING: "Pending",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Volunteers</h1>
          <p className="text-muted-foreground">
            Manage volunteer teams and schedules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/volunteers/roles">
            <Button variant="outline">
              <Briefcase className="mr-2 h-4 w-4" />
              Manage Roles
            </Button>
          </Link>
          <Link href="/dashboard/volunteers/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Volunteer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Volunteers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeVolunteers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Volunteer Roles
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              Ministry positions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Shifts
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingShifts}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled ahead
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekShifts.length}</div>
            <p className="text-xs text-muted-foreground">
              Shifts scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Volunteers */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Volunteers</CardTitle>
            <Link href="/dashboard/volunteers/all">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentVolunteers.length > 0 ? (
              <div className="divide-y">
                {stats.recentVolunteers.map((volunteer) => (
                  <Link
                    key={volunteer.id}
                    href={`/dashboard/volunteers/${volunteer.id}`}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 hover:bg-muted/50 -mx-6 px-6 transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={volunteer.member?.profileImage || ""} />
                      <AvatarFallback>
                        {getInitials(
                          volunteer.member?.firstName || "",
                          volunteer.member?.lastName || ""
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        {volunteer.member?.firstName} {volunteer.member?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {volunteer.member?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {volunteer.role && (
                        <Badge
                          style={{
                            backgroundColor: volunteer.role.color
                              ? `${volunteer.role.color}20`
                              : undefined,
                            color: volunteer.role.color || undefined,
                            borderColor: volunteer.role.color || undefined,
                          }}
                          variant="outline"
                        >
                          {volunteer.role.name}
                        </Badge>
                      )}
                      <Badge className={statusColors[volunteer.status]}>
                        {statusLabels[volunteer.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No volunteers yet</p>
                <Link href="/dashboard/volunteers/new">
                  <Button variant="link">Add your first volunteer</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volunteer Roles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Roles</CardTitle>
            <Link href="/dashboard/volunteers/roles/new">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.volunteerRoles.length > 0 ? (
              <div className="space-y-3">
                {stats.volunteerRoles.map((role) => (
                  <Link
                    key={role.id}
                    href={`/dashboard/volunteers/roles/${role.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 -mx-2 transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: role.color || "#64748b" }}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{role.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {role._count.volunteers} volunteers
                      </p>
                    </div>
                    {role.isRequired && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No roles created</p>
                <Link href="/dashboard/volunteers/roles/new">
                  <Button variant="link" size="sm">Create a role</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* This Week's Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>This Week&apos;s Schedule</CardTitle>
          <Link href="/dashboard/volunteers/schedule">
            <Button variant="outline" size="sm">
              Full Schedule
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.weekShifts.length > 0 ? (
            <div className="divide-y">
              {stats.weekShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(shift.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}
                      </p>
                      <p className="text-lg font-bold leading-none">
                        {new Date(shift.startTime).getDate()}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {shift.volunteer?.member?.firstName}{" "}
                      {shift.volunteer?.member?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shift.role?.name} •{" "}
                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                    </p>
                  </div>
                  <div>
                    {shift.status === "CONFIRMED" ? (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Confirmed
                      </Badge>
                    ) : shift.status === "CANCELLED" ? (
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                        <XCircle className="mr-1 h-3 w-3" />
                        Cancelled
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {shift.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No shifts scheduled this week</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
