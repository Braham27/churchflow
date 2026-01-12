"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  User,
  Building,
  RefreshCw,
} from "lucide-react";

const PAYMENT_METHODS = [
  { value: "CARD", label: "Credit/Debit Card", icon: CreditCard },
  { value: "CASH", label: "Cash", icon: DollarSign },
  { value: "CHECK", label: "Check", icon: Building },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building },
  { value: "TEXT_TO_GIVE", label: "Text to Give", icon: CreditCard },
  { value: "MOBILE_APP", label: "Mobile App", icon: CreditCard },
  { value: "KIOSK", label: "Kiosk", icon: CreditCard },
  { value: "OTHER", label: "Other", icon: CreditCard },
];

const RECURRING_FREQUENCIES = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Bi-weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "ANNUALLY", label: "Annually" },
];

export default function NewDonationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "CARD",
    donorName: "",
    donorEmail: "",
    fundId: "",
    notes: "",
    checkNumber: "",
    transactionId: "",
    recurringFrequency: "MONTHLY",
    donatedAt: new Date().toISOString().split("T")[0],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          isRecurring,
          isAnonymous,
          donatedAt: new Date(formData.donatedAt).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to record donation");
      }

      toast.success("Donation recorded successfully!");
      router.push("/dashboard/donations");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/donations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Record Donation</h1>
          <p className="text-muted-foreground">
            Add a new donation record manually
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount and Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Donation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="donatedAt">Date *</Label>
                <Input
                  id="donatedAt"
                  name="donatedAt"
                  type="date"
                  value={formData.donatedAt}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fundId">Donation Fund</Label>
              <select
                id="fundId"
                name="fundId"
                value={formData.fundId}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">General Fund (Default)</option>
                {/* Funds will be loaded dynamically */}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: method.value,
                      }))
                    }
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.paymentMethod === method.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs text-center">{method.label}</span>
                  </button>
                );
              })}
            </div>

            {formData.paymentMethod === "CHECK" && (
              <div className="space-y-2">
                <Label htmlFor="checkNumber">Check Number</Label>
                <Input
                  id="checkNumber"
                  name="checkNumber"
                  placeholder="Enter check number"
                  value={formData.checkNumber}
                  onChange={handleChange}
                />
              </div>
            )}

            {(formData.paymentMethod === "CARD" ||
              formData.paymentMethod === "BANK_TRANSFER") && (
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  placeholder="External transaction reference"
                  value={formData.transactionId}
                  onChange={handleChange}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Donor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isAnonymous" className="font-normal cursor-pointer">
                Anonymous donation
              </Label>
            </div>

            {!isAnonymous && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donorName">Donor Name</Label>
                  <Input
                    id="donorName"
                    name="donorName"
                    placeholder="Full name"
                    value={formData.donorName}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Or link to existing member below
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donorEmail">Donor Email</Label>
                  <Input
                    id="donorEmail"
                    name="donorEmail"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.donorEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Link to Member</p>
              <p className="text-sm text-muted-foreground">
                Search and select an existing church member to link this donation
                to their giving history.
              </p>
              <Input
                placeholder="Search members..."
                className="mt-2"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Member linking coming soon
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recurring Donation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Recurring Donation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isRecurring" className="font-normal cursor-pointer">
                This is a recurring donation
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurringFrequency">Frequency</Label>
                <select
                  id="recurringFrequency"
                  name="recurringFrequency"
                  value={formData.recurringFrequency}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {RECURRING_FREQUENCIES.map((freq) => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="notes"
              placeholder="Add any notes about this donation..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/donations">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={loading}>
            Record Donation
          </Button>
        </div>
      </form>
    </div>
  );
}
