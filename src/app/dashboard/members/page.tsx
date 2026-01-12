import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  MoreHorizontal,
} from "lucide-react";

async function getMembers(churchId: string, searchQuery?: string) {
  const members = await prisma.member.findMany({
    where: {
      churchId,
      isActive: true,
      ...(searchQuery && {
        OR: [
          { firstName: { contains: searchQuery, mode: "insensitive" } },
          { lastName: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      family: true,
      _count: {
        select: {
          donations: true,
          attendances: true,
        },
      },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return members;
}

async function getChurchId(userId: string) {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId;
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchId = await getChurchId(session.user.id);

  if (!churchId) {
    redirect("/onboarding");
  }

  const members = await getMembers(churchId, searchParams.q);

  const membershipStatusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
    VISITOR: "secondary",
    REGULAR_ATTENDER: "warning",
    MEMBER: "success",
    INACTIVE: "destructive",
    TRANSFERRED: "secondary",
    DECEASED: "secondary",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">
            Manage your church community ({members.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/members/import">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/dashboard/members/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search members..."
                defaultValue={searchParams.q}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
            <Button type="button" variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.photo || ""} />
                    <AvatarFallback>
                      {member.firstName[0]}
                      {member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/members/${member.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {member.firstName} {member.lastName}
                      </Link>
                      <Badge variant={membershipStatusColors[member.membershipStatus]}>
                        {member.membershipStatus.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {member.email && (
                        <span className="flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </span>
                      )}
                      {member.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="text-center">
                      <p className="font-medium text-foreground">{member._count.attendances}</p>
                      <p className="text-xs">Attendances</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">{member._count.donations}</p>
                      <p className="text-xs">Donations</p>
                    </div>
                    {member.family && (
                      <div className="text-center">
                        <p className="font-medium text-foreground">{member.family.name}</p>
                        <p className="text-xs">Family</p>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No members found</p>
              {searchParams.q ? (
                <Link href="/dashboard/members">
                  <Button variant="link">Clear search</Button>
                </Link>
              ) : (
                <Link href="/dashboard/members/new">
                  <Button variant="link">Add your first member</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
