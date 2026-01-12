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
  Clock,
  Users,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Send,
  Eye,
  Trash2,
} from "lucide-react";
import { notFound } from "next/navigation";

async function getCommunication(id: string, churchId: string) {
  return prisma.communication.findFirst({
    where: { id, churchId },
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, name: true } } },
  });
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function CommunicationDetailPage({
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
  const communication = await getCommunication(
    resolvedParams.id,
    churchData.churchId
  );

  if (!communication) {
    notFound();
  }

  const typeLabels: Record<string, string> = {
    EMAIL: "Email",
    SMS: "SMS",
    PUSH: "Push Notification",
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
    SENT: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };

  const typeIcons: Record<string, typeof Mail> = {
    EMAIL: Mail,
    SMS: MessageSquare,
    PUSH: Send,
  };

  const TypeIcon = typeIcons[communication.type] || Mail;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/communications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{communication.subject}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusColors[communication.status]}>
                {communication.status}
              </Badge>
              <Badge variant="outline">
                <TypeIcon className="h-3 w-3 mr-1" />
                {typeLabels[communication.type]}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {communication.status === "DRAFT" && (
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Now
            </Button>
          )}
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
          {/* Message Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Message Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-6">
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-muted-foreground">Subject:</p>
                  <p className="font-semibold">{communication.subject}</p>
                </div>
                <div className="prose prose-sm max-w-none">
                  {communication.content ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: communication.content }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic">
                      No content provided
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">All Members</p>
                  <p className="text-sm text-muted-foreground">
                    Target audience for this message
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge className={statusColors[communication.status]}>
                  {communication.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">
                  {typeLabels[communication.type]}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-sm">
                  {formatDateTime(communication.createdAt)}
                </span>
              </div>
              {communication.sentAt && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sent</span>
                  <span className="font-medium text-sm">
                    {formatDateTime(communication.sentAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats (for sent messages) */}
          {communication.status === "SENT" && (
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-bold text-green-600">98%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Opened</span>
                  <span className="font-bold">42%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Clicked</span>
                  <span className="font-bold">12%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bounced</span>
                  <span className="font-bold text-red-600">2%</span>
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
                Duplicate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
