import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Users,
  DollarSign,
  Clock,
  UserCheck,
} from "lucide-react";

async function getMember(id: string, churchId: string) {
  return prisma.member.findFirst({
    where: { id, churchId },
    include: {
      family: {
        include: {
          members: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              familyRole: true,
            },
          },
        },
      },
      groupMemberships: {
        include: {
          group: {
            select: { id: true, name: true, category: true },
          },
        },
      },
      volunteerProfile: {
        include: {
          shifts: {
            include: {
              role: {
                select: { id: true, name: true, ministry: true },
              },
            },
          },
        },
      },
      donations: {
        orderBy: { donatedAt: "desc" },
        take: 5,
        include: {
          fund: { select: { name: true } },
        },
      },
      attendances: {
        orderBy: { checkInTime: "desc" },
        take: 5,
        include: {
          event: { select: { title: true } },
        },
      },
    },
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true } } },
  });
}

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const member = await getMember(params.id, churchData.churchId);

  if (!member) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "VISITOR":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case "FAITHFUL_GIVER":
        return "bg-purple-100 text-purple-800";
      case "GENEROUS_HEART":
        return "bg-blue-100 text-blue-800";
      case "KINGDOM_BUILDER":
        return "bg-gold-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalDonations = member.donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/members">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full text-primary text-2xl font-bold">
              {member.firstName[0]}
              {member.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {member.firstName} {member.lastName}
                </h1>
                <Badge variant="outline" className={getStatusColor(member.membershipStatus)}>
                  {member.membershipStatus}
                </Badge>
                {member.givingBadge && (
                  <Badge
                    variant="outline"
                    className={getBadgeColor(member.givingBadge)}
                  >
                    {member.givingBadge.replace("_", " ")}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Member since {member.membershipDate?.toLocaleDateString() || "N/A"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/members/${member.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{member.email}</p>
                  </div>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{member.phone}</p>
                    </div>
                  </div>
                )}
                {member.address && (
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {member.address}
                        {member.city && `, ${member.city}`}
                        {member.state && `, ${member.state}`} {member.postalCode}
                      </p>
                    </div>
                  </div>
                )}
                {member.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Birthday</p>
                      <p className="font-medium">
                        {new Date(member.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {member.membershipDate && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">
                        {new Date(member.membershipDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Groups */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Groups
              </CardTitle>
              <Button variant="outline" size="sm">
                Add to Group
              </Button>
            </CardHeader>
            <CardContent>
              {member.groupMemberships.length > 0 ? (
                <div className="space-y-2">
                  {member.groupMemberships.map((gm) => (
                    <div
                      key={gm.group.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{gm.group.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {gm.group.category}
                        </p>
                      </div>
                      <Badge variant="outline">{gm.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Not a member of any groups
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Recent Donations
              </CardTitle>
              <Link href={`/dashboard/donations?memberId=${member.id}`}>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {member.donations.length > 0 ? (
                <div className="space-y-2">
                  {member.donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          ${donation.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(donation.donatedAt).toLocaleDateString()}
                          {donation.fund && ` • ${donation.fund.name}`}
                        </p>
                      </div>
                      <Badge variant="outline">{donation.paymentMethod}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No donations recorded
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Donations</span>
                <span className="font-semibold">
                  ${totalDonations.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Attendances</span>
                <span className="font-semibold">{member.attendances.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Groups</span>
                <span className="font-semibold">{member.groupMemberships.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Family */}
          {member.family && (
            <Card>
              <CardHeader>
                <CardTitle>Family</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {member.family.members.map((fm) => (
                  <Link
                    key={fm.id}
                    href={`/dashboard/members/${fm.id}`}
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <span className="font-medium">
                      {fm.firstName} {fm.lastName}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {fm.familyRole || "Member"}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Volunteer Info */}
          {member.volunteerProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Volunteer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge
                  variant="outline"
                  className={
                    member.volunteerProfile.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {member.volunteerProfile.isActive ? "ACTIVE" : "INACTIVE"}
                </Badge>
                {member.volunteerProfile.shifts.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-muted-foreground">Assigned Roles:</p>
                    {member.volunteerProfile.shifts.map((shift) => (
                      <Badge key={shift.id} variant="secondary" className="mr-1">
                        {shift.role.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              {member.attendances.length > 0 ? (
                <div className="space-y-2">
                  {member.attendances.map((att) => (
                    <div key={att.id} className="text-sm">
                      <p className="font-medium">{att.event?.title || "Event"}</p>
                      <p className="text-muted-foreground">
                        {att.checkInTime ? new Date(att.checkInTime).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No attendance records
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
