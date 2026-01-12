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
  DollarSign,
  Target,
  ArrowLeft,
  Settings,
  TrendingUp,
} from "lucide-react";

async function getFunds(churchId: string) {
  return prisma.donationFund.findMany({
    where: { churchId },
    include: {
      _count: {
        select: { donations: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true } } },
  });
}

export default async function FundsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const funds = await getFunds(churchData.churchId);

  // Calculate totals for each fund
  const fundsWithTotals = await Promise.all(
    funds.map(async (fund) => {
      const total = await prisma.donation.aggregate({
        where: { fundId: fund.id },
        _sum: { amount: true },
      });
      return {
        ...fund,
        totalRaised: total._sum.amount || 0,
      };
    })
  );

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
            <h1 className="text-3xl font-bold">Donation Funds</h1>
            <p className="text-muted-foreground">
              Manage funds and track campaign progress
            </p>
          </div>
        </div>
        <Link href="/dashboard/donations/funds/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Fund
          </Button>
        </Link>
      </div>

      {/* Funds Grid */}
      {fundsWithTotals.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fundsWithTotals.map((fund) => {
            const progress = fund.goal
              ? Math.min((fund.totalRaised / fund.goal) * 100, 100)
              : null;

            return (
              <Card
                key={fund.id}
                className={!fund.isActive ? "opacity-60" : ""}
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full bg-primary"
                    />
                    <CardTitle className="text-lg">{fund.name}</CardTitle>
                  </div>
                  {!fund.isActive && <Badge variant="secondary">Inactive</Badge>}
                </CardHeader>
                <CardContent className="space-y-4">
                  {fund.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {fund.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Raised</span>
                      <span className="font-semibold">
                        ${fund.totalRaised.toLocaleString()}
                      </span>
                    </div>

                    {fund.goal && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Goal</span>
                          <span className="font-semibold">
                            ${fund.goal.toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all bg-primary"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-right">
                            {progress?.toFixed(0)}% of goal
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <span className="text-muted-foreground">
                        {fund._count.donations} donations
                      </span>
                      <Link href={`/dashboard/donations/funds/${fund.id}`}>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No funds created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create funds to organize and track donations for specific
              purposes.
            </p>
            <Link href="/dashboard/donations/funds/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Fund
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Across Funds</p>
              <p className="text-2xl font-bold">
                $
                {fundsWithTotals
                  .reduce((sum, f) => sum + f.totalRaised, 0)
                  .toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Funds</p>
              <p className="text-2xl font-bold">
                {fundsWithTotals.filter((f) => f.isActive).length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">With Goals</p>
              <p className="text-2xl font-bold">
                {fundsWithTotals.filter((f) => f.goal).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
