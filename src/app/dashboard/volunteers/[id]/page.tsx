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
  Calendar,
  Users,
  Clock,
  Heart,
  Mail,
  Phone,
  Shield,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { notFound } from "next/navigation";

async function getVolunteer(id: string, churchId: string) {
  return prisma.volunteer.findFirst({
    where: { id, churchId },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          photo: true,
        },
      },
      shifts: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { startTime: "desc" },
        take: 10,
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
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function VolunteerDetailPage({
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
  const volunteer = await getVolunteer(resolvedParams.id, churchData.churchId);

  if (!volunteer) {
    notFound();
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const totalHours = volunteer.shifts.reduce((acc, shift) => {
    if (shift.startTime && shift.endTime) {
      const hours =
        (new Date(shift.endTime).getTime() - new Date(shift.startTime).getTime()) /
        (1000 * 60 * 60);
      return acc + hours;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/volunteers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold">
              {volunteer.member?.firstName[0]}
              {volunteer.member?.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {volunteer.member?.firstName} {volunteer.member?.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(volunteer.isActive)}>
                  {volunteer.isActive ? "Active" : "Inactive"}
                </Badge>
                {volunteer.backgroundCheck && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Background Checked
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {volunteer.member?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{volunteer.member.email}</span>
                  </div>
                )}
                {volunteer.member?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{volunteer.member.phone}</span>
                  </div>
                )}
              </div>
              {volunteer.member && (
                <Link href={`/dashboard/members/${volunteer.member.id}`}>
                  <Button variant="link" className="p-0 h-auto mt-4">
                    View Member Profile →
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Assigned Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const uniqueRoles = Array.from(
                  new Map(
                    volunteer.shifts.map((s) => [s.role.id, s.role])
                  ).values()
                );
                return uniqueRoles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {uniqueRoles.map((role) => (
                      <Badge
                        key={role.id}
                        variant="secondary"
                        className="text-sm py-1 px-3"
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No roles assigned yet</p>
                );
              })()}
              <Link href="/dashboard/volunteers/roles">
                <Button variant="outline" size="sm" className="mt-4">
                  Manage Roles
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Shifts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Shifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {volunteer.shifts.length > 0 ? (
                <div className="space-y-3">
                  {volunteer.shifts.map((shift) => (
                    <div
                      key={shift.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            shift.status === "COMPLETED"
                              ? "bg-green-100 text-green-600"
                              : shift.status === "NO_SHOW"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {shift.status === "COMPLETED" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : shift.status === "NO_SHOW" ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {shift.event?.title || "General Shift"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateTime(shift.startTime)}
                            {shift.endTime &&
                              ` - ${formatDateTime(shift.endTime)}`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          shift.status === "COMPLETED"
                            ? "default"
                            : shift.status === "NO_SHOW"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {shift.status.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No shifts recorded yet</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {volunteer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{volunteer.notes}</p>
              </CardContent>
            </Card>
          )}
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
                <span className="text-muted-foreground">Total Shifts</span>
                <span className="font-bold">{volunteer.shifts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Hours</span>
                <span className="font-bold">{totalHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Roles</span>
                <span className="font-bold">{new Set(volunteer.shifts.map((s) => s.role.id)).size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Joined</span>
                <span className="font-bold">
                  {formatDate(volunteer.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Background Check</span>
                {volunteer.backgroundCheck ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Training</span>
                {volunteer.trainingCompleted ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Shift
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Heart className="mr-2 h-4 w-4" />
                Add Appreciation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
