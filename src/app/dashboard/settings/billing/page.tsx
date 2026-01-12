import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CreditCard,
  Check,
  AlertCircle,
  ArrowUpRight,
  Download,
  Calendar,
} from "lucide-react";

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: {
      church: {
        select: {
          id: true,
          name: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          trialEndsAt: true,
          stripeCustomerId: true,
        },
      },
    },
  });
}

const plans = [
  {
    name: "Free",
    tier: "FREE",
    price: "$0",
    description: "Perfect for small churches getting started",
    features: [
      "Up to 50 members",
      "Basic event management",
      "Simple check-in",
      "Email support",
    ],
    limits: "50 members",
  },
  {
    name: "Starter",
    tier: "STARTER",
    price: "$29",
    description: "Essential tools for growing churches",
    features: [
      "Up to 250 members",
      "Full event management",
      "Child check-in with security codes",
      "Basic reporting",
      "Email templates",
      "Priority email support",
    ],
    limits: "250 members",
    popular: true,
  },
  {
    name: "Growth",
    tier: "GROWTH",
    price: "$79",
    description: "Advanced features for established churches",
    features: [
      "Up to 1,000 members",
      "Custom website builder",
      "Advanced reporting & analytics",
      "SMS communications",
      "Volunteer scheduling",
      "API access",
      "Phone support",
    ],
    limits: "1,000 members",
  },
  {
    name: "Enterprise",
    tier: "ENTERPRISE",
    price: "Custom",
    description: "For large churches with custom needs",
    features: [
      "Unlimited members",
      "Multi-campus support",
      "Custom integrations",
      "Dedicated account manager",
      "Training & onboarding",
      "SLA guarantees",
      "24/7 support",
    ],
    limits: "Unlimited",
  },
];

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const currentPlan = plans.find(
    (p) => p.tier === churchData.church.subscriptionTier
  );
  const isTrialing = churchData.church.subscriptionStatus === "TRIAL";
  const trialDaysLeft = churchData.church.trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(churchData.church.trialEndsAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment methods
          </p>
        </div>
      </div>

      {/* Trial Banner */}
      {isTrialing && trialDaysLeft > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Trial Period Active
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {trialDaysLeft} days remaining in your free trial
                  </p>
                </div>
              </div>
              <Button>Upgrade Now</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{currentPlan?.name}</h3>
                <Badge
                  variant={
                    churchData.church.subscriptionStatus === "ACTIVE"
                      ? "default"
                      : "secondary"
                  }
                >
                  {churchData.church.subscriptionStatus}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {currentPlan?.description}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Member limit: {currentPlan?.limits}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{currentPlan?.price}</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.tier}
              className={`relative ${
                plan.tier === churchData.church.subscriptionTier
                  ? "border-primary ring-2 ring-primary/20"
                  : ""
              } ${plan.popular ? "border-blue-500" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.tier === churchData.church.subscriptionTier ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : plan.tier === "ENTERPRISE" ? (
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                ) : (
                  <Button className="w-full">
                    {plans.indexOf(plan) >
                    plans.findIndex(
                      (p) => p.tier === churchData.church.subscriptionTier
                    )
                      ? "Upgrade"
                      : "Downgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {churchData.church.stripeCustomerId ? (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                No payment method on file
              </p>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              Download invoices and view payment history
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No billing history yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
