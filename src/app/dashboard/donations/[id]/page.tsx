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
  DollarSign,
  Users,
  Clock,
  Heart,
  MapPin,
  Phone,
  Mail,
  Trash2,
} from "lucide-react";
import { notFound } from "next/navigation";

async function getDonation(id: string, churchId: string) {
  return prisma.donation.findFirst({
    where: { id, churchId },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      fund: {
        select: {
          id: true,
          name: true,
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default async function DonationDetailPage({
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
  const donation = await getDonation(resolvedParams.id, churchData.churchId);

  if (!donation) {
    notFound();
  }

  const methodLabels: Record<string, string> = {
    CASH: "Cash",
    CHECK: "Check",
    ONLINE: "Online",
    CARD: "Card",
    ACH: "ACH",
    OTHER: "Other",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/donations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Donation Details</h1>
            <p className="text-muted-foreground">
              {formatDate(donation.donatedAt)}
            </p>
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
          {/* Donation Amount */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p className="text-5xl font-bold text-green-600">
                  {formatCurrency(donation.amount)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {donation.fund && (
                    <Badge variant="outline">
                      {donation.fund.name}
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {methodLabels[donation.paymentMethod]}
                  </Badge>
                  {donation.isRecurring && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Recurring
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Donor Information */}
          {donation.member && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Donor Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xl font-bold">
                    {donation.member.firstName[0]}
                    {donation.member.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/dashboard/members/${donation.member.id}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {donation.member.firstName} {donation.member.lastName}
                    </Link>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {donation.member.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {donation.member.email}
                        </div>
                      )}
                      {donation.member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {donation.member.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Link href={`/dashboard/members/${donation.member.id}`}>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {donation.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{donation.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Transaction ID</dt>
                  <dd className="font-medium">
                    {donation.transactionId || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Payment Method</dt>
                  <dd className="font-medium">
                    {methodLabels[donation.paymentMethod]}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Date</dt>
                  <dd className="font-medium">{formatDate(donation.donatedAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="default" className="bg-green-600">
                      Completed
                    </Badge>
                  </dd>
                </div>
                {donation.isRecurring && (
                  <>
                    <div>
                      <dt className="text-muted-foreground">Frequency</dt>
                      <dd className="font-medium capitalize">
                        {donation.recurringFrequency?.toLowerCase() || "Monthly"}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Send Receipt
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Refund Donation
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Donation
              </Button>
            </CardContent>
          </Card>

          {/* Fund Information */}
          {donation.fund && (
            <Card>
              <CardHeader>
                <CardTitle>Fund Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full bg-primary"
                  />
                  <span className="font-medium">{donation.fund.name}</span>
                </div>
                <Link href="/dashboard/donations/funds">
                  <Button variant="link" className="p-0 h-auto mt-2">
                    View All Funds →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="w-px h-full bg-border" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Donation Received</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(donation.donatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Record Created</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(donation.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
