import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckSquare,
  Search,
  Clock,
  Calendar,
  Shield,
} from "lucide-react";

async function getCheckIns(churchId: string) {
  return prisma.checkIn.findMany({
    where: { churchId },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          photo: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
        },
      },
    },
    orderBy: { checkInTime: "desc" },
    take: 200,
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

export default async function AllCheckInsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const checkIns = await getCheckIns(churchData.churchId);

  // Group by date
  const groupedByDate = checkIns.reduce(
    (acc, checkIn) => {
      const date = new Date(checkIn.checkInTime).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(checkIn);
      return acc;
    },
    {} as Record<string, typeof checkIns>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Check-ins</h1>
          <p className="text-muted-foreground">
            {checkIns.length} check-ins (last 200)
          </p>
        </div>
        <Link href="/dashboard/checkin/manual">
          <Button>
            <CheckSquare className="mr-2 h-4 w-4" />
            Manual Check-in
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
                placeholder="Search by name..."
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <input
              type="date"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Events</option>
              {Array.from(new Set(checkIns.filter(c => c.event).map((c) => c.event?.title))).map(
                (event) => (
                  <option key={event} value={event}>
                    {event}
                  </option>
                )
              )}
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Check-ins List grouped by date */}
      {Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, dateCheckIns]) => (
            <div key={date}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                {date}
                <Badge variant="secondary">{dateCheckIns.length} check-ins</Badge>
              </h2>

              <div className="space-y-2">
                {dateCheckIns.map((checkIn) => {
                  return (
                    <Link
                      key={checkIn.id}
                      href={`/dashboard/checkin/${checkIn.id}`}
                    >
                      <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {checkIn.member ? (
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={checkIn.member.photo || undefined}
                                />
                                <AvatarFallback>
                                  {checkIn.member.firstName[0]}
                                  {checkIn.member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {checkIn.guestName?.[0] || "G"}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
                                  {checkIn.member
                                    ? `${checkIn.member.firstName} ${checkIn.member.lastName}`
                                    : checkIn.guestName || "Guest"}
                                </h3>
                                <Badge className="bg-green-100 text-green-800">
                                  Checked In
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {checkIn.event?.title || "Walk-in"}
                              </p>
                            </div>

                            <div className="text-right text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {new Date(checkIn.checkInTime).toLocaleTimeString(
                                  "en-US",
                                  { hour: "numeric", minute: "2-digit" }
                                )}
                              </div>
                            </div>

                            {checkIn.securityCode && (
                              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-lg">
                                <Shield className="h-4 w-4 text-yellow-700" />
                                <span className="font-mono font-bold text-yellow-700">
                                  {checkIn.securityCode}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No check-ins yet</h3>
            <p className="text-muted-foreground mb-4">
              Check-ins will appear here when members check in to events
            </p>
            <Link href="/dashboard/checkin">
              <Button>Go to Check-in</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
