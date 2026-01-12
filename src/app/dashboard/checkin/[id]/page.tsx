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
  Clock,
  Phone,
  Shield,
  CheckCircle,
  User,
  Baby,
} from "lucide-react";
import { notFound } from "next/navigation";

async function getCheckIn(id: string, churchId: string) {
  return prisma.checkIn.findFirst({
    where: { id, churchId },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          photo: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          location: true,
        },
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

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default async function CheckInDetailPage({
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
  const checkIn = await getCheckIn(resolvedParams.id, churchData.churchId);

  if (!checkIn) {
    notFound();
  }

  const isChild = checkIn.member?.dateOfBirth
    ? calculateAge(checkIn.member.dateOfBirth) < 18
    : false;
  const age = checkIn.member?.dateOfBirth
    ? calculateAge(checkIn.member.dateOfBirth)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/checkin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Check-In Details</h1>
            <p className="text-muted-foreground">
              {checkIn.event?.title || "Walk-in Check-in"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Member Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isChild ? <Baby className="h-5 w-5" /> : <User className="h-5 w-5" />}
                {isChild ? "Child" : "Attendee"} Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checkIn.member ? (
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
                    {checkIn.member.firstName[0]}
                    {checkIn.member.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/dashboard/members/${checkIn.member.id}`}
                        className="text-xl font-semibold hover:underline"
                      >
                        {checkIn.member.firstName} {checkIn.member.lastName}
                      </Link>
                      {isChild && (
                        <Badge variant="secondary">
                          <Baby className="h-3 w-3 mr-1" />
                          Child ({age} years)
                        </Badge>
                      )}
                    </div>
                    {checkIn.member.phone && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {checkIn.member.phone}
                      </p>
                    )}
                    <Link href={`/dashboard/members/${checkIn.member.id}`}>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        View Full Profile →
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : checkIn.guestName ? (
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-2xl font-bold">
                    {checkIn.guestName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-semibold">{checkIn.guestName}</p>
                    <Badge variant="outline" className="mt-2">Guest</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No attendee information</p>
              )}
            </CardContent>
          </Card>

          {/* Security Code (for children) */}
          {isChild && checkIn.securityCode && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Shield className="h-5 w-5" />
                  Security Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-6xl font-mono font-bold text-yellow-800 dark:text-yellow-200 tracking-widest">
                    {checkIn.securityCode}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-4">
                    This code is required for pickup. Keep this label with the
                    parent/guardian.
                  </p>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline">Print Parent Label</Button>
                  <Button variant="outline">Print Child Label</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Event Details */}
          {checkIn.event && (
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <Link
                      href={`/dashboard/events/${checkIn.event.id}`}
                      className="font-semibold hover:underline"
                    >
                      {checkIn.event.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(checkIn.event.startDate)}
                    </p>
                    {checkIn.event.location && (
                      <p className="text-sm text-muted-foreground">
                        {checkIn.event.location}
                      </p>
                    )}
                  </div>
                  <Link href={`/dashboard/events/${checkIn.event.id}`}>
                    <Button variant="outline" size="sm">
                      View Event
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {checkIn.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p>{checkIn.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <Badge className="bg-green-100 text-green-800 text-lg px-4 py-1">
                  Checked In
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Times */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Check-In Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">
                {formatDateTime(checkIn.checkInTime)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Method: {checkIn.checkInMethod.replace("_", " ")}
              </p>
            </CardContent>
          </Card>

          {/* Parent Info */}
          {checkIn.parentName && (
            <Card>
              <CardHeader>
                <CardTitle>Parent/Guardian</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{checkIn.parentName}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
