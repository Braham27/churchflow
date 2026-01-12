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
  ArrowLeft,
  Briefcase,
  Users,
  Settings,
  Clock,
  MapPin,
} from "lucide-react";

async function getRoles(churchId: string) {
  return prisma.volunteerRole.findMany({
    where: { churchId },
    include: {
      _count: {
        select: { shifts: true },
      },
    },
    orderBy: [{ ministry: "asc" }, { name: "asc" }],
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true } } },
  });
}

export default async function VolunteerRolesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const roles = await getRoles(churchData.churchId);

  // Group roles by ministry
  const rolesByMinistry = roles.reduce(
    (acc, role) => {
      const ministry = role.ministry || "General";
      if (!acc[ministry]) acc[ministry] = [];
      acc[ministry].push(role);
      return acc;
    },
    {} as Record<string, typeof roles>
  );

  const ministries = Object.keys(rolesByMinistry).sort();

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
          <div>
            <h1 className="text-3xl font-bold">Volunteer Roles</h1>
            <p className="text-muted-foreground">
              Manage volunteer positions and requirements
            </p>
          </div>
        </div>
        <Link href="/dashboard/volunteers/roles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Role
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Roles</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ministries</p>
              <p className="text-2xl font-bold">{ministries.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-600 dark:text-purple-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Shifts</p>
              <p className="text-2xl font-bold">
                {roles.reduce((sum, r) => sum + r._count.shifts, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roles by Ministry */}
      {ministries.length > 0 ? (
        <div className="space-y-6">
          {ministries.map((ministry) => (
            <Card key={ministry}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  {ministry}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {rolesByMinistry[ministry].map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{role.name}</h3>
                            {role.requiresBackgroundCheck && (
                              <Badge variant="outline" className="text-xs">
                                Background Check
                              </Badge>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {role.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {role._count.shifts} shift
                              {role._count.shifts !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/dashboard/volunteers/roles/${role.id}`}>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No roles created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create volunteer roles to organize your ministry teams.
            </p>
            <Link href="/dashboard/volunteers/roles/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Role
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
