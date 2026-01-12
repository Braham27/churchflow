import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageSquare,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react";

async function getCommunications(churchId: string) {
  return prisma.communication.findMany({
    where: { churchId },
    orderBy: { createdAt: "desc" },
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

export default async function AllCommunicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const communications = await getCommunications(churchData.churchId);

  const typeIcons: Record<string, React.ReactNode> = {
    EMAIL: <Mail className="h-4 w-4" />,
    SMS: <MessageSquare className="h-4 w-4" />,
    PUSH: <Send className="h-4 w-4" />,
  };

  const statusStyles: Record<string, { icon: React.ReactNode; className: string }> = {
    DRAFT: {
      icon: <AlertCircle className="h-3 w-3" />,
      className: "bg-gray-100 text-gray-800",
    },
    SCHEDULED: {
      icon: <Clock className="h-3 w-3" />,
      className: "bg-blue-100 text-blue-800",
    },
    SENT: {
      icon: <CheckCircle className="h-3 w-3" />,
      className: "bg-green-100 text-green-800",
    },
    FAILED: {
      icon: <AlertCircle className="h-3 w-3" />,
      className: "bg-red-100 text-red-800",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Communications</h1>
          <p className="text-muted-foreground">
            {communications.length} messages total
          </p>
        </div>
        <Link href="/dashboard/communications/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Message
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
                placeholder="Search communications..."
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Types</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="PUSH">Push Notification</option>
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      {communications.length > 0 ? (
        <div className="space-y-4">
          {communications.map((comm) => (
            <Link
              key={comm.id}
              href={`/dashboard/communications/${comm.id}`}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-muted rounded-lg">
                          {typeIcons[comm.type] || <Mail className="h-4 w-4" />}
                        </div>
                        <div>
                          <h3 className="font-semibold truncate">
                            {comm.subject || "(No Subject)"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {comm.type} Message
                          </p>
                        </div>
                      </div>

                      {comm.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {comm.content.slice(0, 200)}...
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {comm.sentAt ? (
                          <span>
                            Sent: {new Date(comm.sentAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>
                            Created:{" "}
                            {new Date(comm.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge
                      className={`flex items-center gap-1 ${
                        statusStyles[comm.status]?.className || ""
                      }`}
                    >
                      {statusStyles[comm.status]?.icon}
                      {comm.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No communications yet</h3>
            <p className="text-muted-foreground mb-4">
              Start engaging with your congregation through email and SMS
            </p>
            <Link href="/dashboard/communications/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Message
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
