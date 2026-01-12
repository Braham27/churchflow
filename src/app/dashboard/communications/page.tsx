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
  Mail,
  MessageSquare,
  Send,
  Users,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

async function getCommunicationStats(churchId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalSent,
    recentMessages,
    templates,
    scheduledMessages,
  ] = await Promise.all([
    prisma.communication.count({
      where: {
        churchId,
        sentAt: { gte: thirtyDaysAgo },
        status: "SENT",
      },
    }),
    prisma.communication.findMany({
      where: { churchId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.messageTemplate.findMany({
      where: { churchId },
      orderBy: { name: "asc" },
      take: 6,
    }),
    prisma.communication.count({
      where: {
        churchId,
        status: "SCHEDULED",
      },
    }),
  ]);

  return {
    totalSent,
    recentMessages,
    templates,
    scheduledMessages,
  };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

export default async function CommunicationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const stats = await getCommunicationStats(churchData.churchId);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const typeIcons: Record<string, typeof Mail> = {
    EMAIL: Mail,
    SMS: MessageSquare,
    PUSH: Send,
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    SENT: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    FAILED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Communications</h1>
          <p className="text-muted-foreground">
            Send emails, SMS, and notifications to your congregation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/communications/templates">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </Link>
          <Link href="/dashboard/communications/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sent (30 days)
            </CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
            <p className="text-xs text-muted-foreground">
              Messages delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Scheduled
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledMessages}</div>
            <p className="text-xs text-muted-foreground">
              Pending messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Templates
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Saved templates
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
              AI Compose
            </CardTitle>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/communications/ai">
              <Button variant="outline" size="sm" className="w-full">
                Try AI Writer
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/communications/new?type=email">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Send Email</p>
                <p className="text-sm text-muted-foreground">
                  Compose and send an email
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/communications/new?type=sms">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Send SMS</p>
                <p className="text-sm text-muted-foreground">
                  Text message to members
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/communications/new?type=push">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg text-orange-600 dark:text-orange-400">
                <Send className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Push Notification</p>
                <p className="text-sm text-muted-foreground">
                  App notification
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Messages */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <Link href="/dashboard/communications/history">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentMessages.length > 0 ? (
              <div className="divide-y">
                {stats.recentMessages.map((message) => {
                  const Icon = typeIcons[message.type] || Mail;
                  return (
                    <Link
                      key={message.id}
                      href={`/dashboard/communications/${message.id}`}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 hover:bg-muted/50 -mx-6 px-6 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{message.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {message.type} message
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[message.status]}>
                          {message.status === "SENT" && (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {message.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages sent yet</p>
                <Link href="/dashboard/communications/new">
                  <Button variant="link">Send your first message</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick Templates</CardTitle>
            <Link href="/dashboard/communications/templates/new">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.templates.length > 0 ? (
              <div className="space-y-3">
                {stats.templates.map((template) => (
                  <Link
                    key={template.id}
                    href={`/dashboard/communications/new?template=${template.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 -mx-2 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {template.type.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No templates created</p>
                <Link href="/dashboard/communications/templates/new">
                  <Button variant="link" size="sm">Create template</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recipient Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Send to Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/communications/new?audience=all">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">All Members</p>
                  <p className="text-xs text-muted-foreground">
                    Entire congregation
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/communications/new?audience=volunteers">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Volunteers</p>
                  <p className="text-xs text-muted-foreground">
                    Active volunteers
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/communications/new?audience=leaders">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Group Leaders</p>
                  <p className="text-xs text-muted-foreground">
                    Ministry leaders
                  </p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard/groups">
              <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Custom Groups</p>
                  <p className="text-xs text-muted-foreground">
                    Select specific groups
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
