"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Heart,
  CreditCard,
  Calendar,
  DollarSign,
  Lock,
  ChevronRight,
} from "lucide-react";

const givingOptions = [
  { amount: 25, label: "$25" },
  { amount: 50, label: "$50" },
  { amount: 100, label: "$100" },
  { amount: 250, label: "$250" },
  { amount: 500, label: "$500" },
  { amount: 1000, label: "$1,000" },
];

const funds = [
  { id: "general", name: "General Fund", description: "Support our church operations" },
  { id: "missions", name: "Missions", description: "Support global outreach" },
  { id: "building", name: "Building Fund", description: "Facility improvements" },
  { id: "youth", name: "Youth Ministry", description: "Invest in the next generation" },
];

export default function ChurchGivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const [amount, setAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState("");
  const [selectedFund, setSelectedFund] = useState("general");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [loading, setLoading] = useState(false);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setCustomAmount(value);
    setAmount("");
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalAmount || finalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      // In a real implementation, this would redirect to Stripe
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Redirecting to secure payment...");
      // window.location.href = stripeUrl;
    } catch (error) {
      toast.error("Failed to process donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href={`/c/${resolvedParams.slug}`} className="font-bold text-xl">
              Church Name
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/c/${resolvedParams.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href={`/c/${resolvedParams.slug}/about`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href={`/c/${resolvedParams.slug}/events`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Events
              </Link>
              <Link
                href={`/c/${resolvedParams.slug}/give`}
                className="text-sm font-medium text-primary"
              >
                Give
              </Link>
              <Link
                href={`/c/${resolvedParams.slug}/visit`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Plan Your Visit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Give Online</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Your generosity makes a difference in our community and beyond
          </p>
        </div>
      </section>

      {/* Giving Form */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Select Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Amount Options */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {givingOptions.map((option) => (
                    <button
                      key={option.amount}
                      type="button"
                      onClick={() => handleAmountSelect(option.amount)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        amount === option.amount
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <span className="text-lg font-bold">{option.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Or enter a custom amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                      placeholder="0.00"
                      className="pl-10 text-lg h-12"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fund Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Fund</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {funds.map((fund) => (
                    <button
                      key={fund.id}
                      type="button"
                      onClick={() => setSelectedFund(fund.id)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        selectedFund === fund.id
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <span className="font-semibold">{fund.name}</span>
                      <p className="text-sm text-muted-foreground">
                        {fund.description}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recurring Option */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Giving Frequency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(false)}
                    className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                      !isRecurring
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <span className="font-semibold">One-Time</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(true)}
                    className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${
                      isRecurring
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <span className="font-semibold">Recurring</span>
                  </button>
                </div>

                {isRecurring && (
                  <div className="mt-4">
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary & Submit */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-3xl font-bold">
                    ${finalAmount ? finalAmount.toLocaleString() : "0.00"}
                    {isRecurring && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /{frequency.replace("ly", "")}
                      </span>
                    )}
                  </span>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={!finalAmount || loading}
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Give {finalAmount ? `$${finalAmount.toLocaleString()}` : "Now"}
                    </>
                  )}
                </Button>
                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  Secure payment powered by Stripe
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Why Give */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>Why We Give</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your generosity enables us to:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0" />
                  Support local community outreach programs
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0" />
                  Fund global mission initiatives
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0" />
                  Invest in children and youth ministry
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-primary shrink-0" />
                  Maintain and improve our facilities
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Church Name. Powered by ChurchFlow.
          </p>
        </div>
      </footer>
    </div>
  );
}
