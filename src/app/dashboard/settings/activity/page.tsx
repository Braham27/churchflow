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
  ArrowLeft,
  Activity,
  Search,
  Calendar,
  User,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  CheckSquare,
  Mail,
  Settings,
  Globe,
} from "lucide-react";

async function getActivityLogs(churchId: string) {
  return prisma.activityLog.findMany({
    where: { churchId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

export default async function ActivityLogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const logs = await getActivityLogs(churchData.churchId);

  const actionIcons: Record<string, React.ReactNode> = {
    MEMBER_CREATED: <Users className="h-4 w-4 text-green-600" />,
    MEMBER_UPDATED: <Users className="h-4 w-4 text-blue-600" />,
    MEMBER_DELETED: <Users className="h-4 w-4 text-red-600" />,
    EVENT_CREATED: <CalendarIcon className="h-4 w-4 text-green-600" />,
    EVENT_UPDATED: <CalendarIcon className="h-4 w-4 text-blue-600" />,
    EVENT_DELETED: <CalendarIcon className="h-4 w-4 text-red-600" />,
    DONATION_CREATED: <DollarSign className="h-4 w-4 text-green-600" />,
    DONATION_UPDATED: <DollarSign className="h-4 w-4 text-blue-600" />,
    DONATION_DELETED: <DollarSign className="h-4 w-4 text-red-600" />,
    CHECKIN: <CheckSquare className="h-4 w-4 text-green-600" />,
    CHECKOUT: <CheckSquare className="h-4 w-4 text-blue-600" />,
    CHECKIN_DELETED: <CheckSquare className="h-4 w-4 text-red-600" />,
    COMMUNICATION_SENT: <Mail className="h-4 w-4 text-green-600" />,
    COMMUNICATION_UPDATED: <Mail className="h-4 w-4 text-blue-600" />,
    COMMUNICATION_DELETED: <Mail className="h-4 w-4 text-red-600" />,
    GROUP_CREATED: <Users className="h-4 w-4 text-green-600" />,
    GROUP_UPDATED: <Users className="h-4 w-4 text-blue-600" />,
    GROUP_DELETED: <Users className="h-4 w-4 text-red-600" />,
    VOLUNTEER_CREATED: <User className="h-4 w-4 text-green-600" />,
    VOLUNTEER_UPDATED: <User className="h-4 w-4 text-blue-600" />,
    VOLUNTEER_DELETED: <User className="h-4 w-4 text-red-600" />,
    SETTINGS_UPDATED: <Settings className="h-4 w-4 text-blue-600" />,
    PAGE_CREATED: <Globe className="h-4 w-4 text-green-600" />,
    PAGE_UPDATED: <Globe className="h-4 w-4 text-blue-600" />,
    PAGE_DELETED: <Globe className="h-4 w-4 text-red-600" />,
  };

  const actionLabels: Record<string, string> = {
    MEMBER_CREATED: "Created member",
    MEMBER_UPDATED: "Updated member",
    MEMBER_DELETED: "Deleted member",
    EVENT_CREATED: "Created event",
    EVENT_UPDATED: "Updated event",
    EVENT_DELETED: "Deleted event",
    DONATION_CREATED: "Recorded donation",
    DONATION_UPDATED: "Updated donation",
    DONATION_DELETED: "Deleted donation",
    CHECKIN: "Checked in",
    CHECKOUT: "Checked out",
    CHECKIN_DELETED: "Deleted check-in",
    CHECKIN_UPDATED: "Updated check-in",
    COMMUNICATION_SENT: "Sent communication",
    COMMUNICATION_CREATED: "Created communication",
    COMMUNICATION_UPDATED: "Updated communication",
    COMMUNICATION_DELETED: "Deleted communication",
    GROUP_CREATED: "Created group",
    GROUP_UPDATED: "Updated group",
    GROUP_DELETED: "Deleted group",
    VOLUNTEER_CREATED: "Added volunteer",
    VOLUNTEER_UPDATED: "Updated volunteer",
    VOLUNTEER_DELETED: "Removed volunteer",
    SETTINGS_UPDATED: "Updated settings",
    PAGE_CREATED: "Created page",
    PAGE_UPDATED: "Updated page",
    PAGE_DELETED: "Deleted page",
  };

  // Group by date
  const groupedByDate = logs.reduce(
    (acc, log) => {
      const date = new Date(log.createdAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(log);
      return acc;
    },
    {} as Record<string, typeof logs>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Activity Log</h1>
            <p className="text-muted-foreground">
              Track all actions taken in your church management system
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search activity..."
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <input
              type="date"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Actions</option>
              <option value="MEMBER">Members</option>
              <option value="EVENT">Events</option>
              <option value="DONATION">Donations</option>
              <option value="CHECKIN">Check-ins</option>
              <option value="COMMUNICATION">Communications</option>
              <option value="GROUP">Groups</option>
              <option value="VOLUNTEER">Volunteers</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      {Object.keys(groupedByDate).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, dateLogs]) => (
            <div key={date}>
              <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {date}
              </h2>

              <div className="space-y-2">
                {dateLogs.map((log) => {
                  const details = log.details as Record<string, unknown> | null;
                  
                  return (
                    <Card key={log.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {actionIcons[log.action] || (
                              <Activity className="h-4 w-4 text-gray-600" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">
                                {actionLabels[log.action] || log.action}
                              </span>
                              {log.entityType && (
                                <Badge variant="secondary" className="text-xs">
                                  {log.entityType}
                                </Badge>
                              )}
                            </div>

                            {details && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {details.memberName ? (
                                  <span>{String(details.memberName)}</span>
                                ) : null}
                                {details.eventName ? (
                                  <span>{String(details.eventName)}</span>
                                ) : null}
                                {details.groupName ? (
                                  <span>{String(details.groupName)}</span>
                                ) : null}
                                {details.subject ? (
                                  <span>{String(details.subject)}</span>
                                ) : null}
                                {typeof details.amount === "number" ? (
                                  <span>
                                    ${details.amount.toLocaleString()}
                                  </span>
                                ) : null}
                                {Array.isArray(details.updatedFields) ? (
                                  <span>
                                    Updated:{" "}
                                    {details.updatedFields.join(", ")}
                                  </span>
                                ) : null}
                              </p>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {log.user && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={log.user.image || undefined} />
                                    <AvatarFallback className="text-[10px]">
                                      {log.user.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("") || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{log.user.name || log.user.email}</span>
                                </div>
                              )}
                              <span>
                                {new Date(log.createdAt).toLocaleTimeString(
                                  "en-US",
                                  { hour: "numeric", minute: "2-digit" }
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
            <p className="text-muted-foreground">
              Activity will appear here as you use the system
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
