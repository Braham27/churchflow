"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Download,
  Filter,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Repeat,
} from "lucide-react";

interface Donation {
  id: string;
  amount: number;
  donatedAt: string;
  method: string;
  isRecurring: boolean;
  notes: string | null;
  member: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  fund: {
    name: string;
  } | null;
}

const getMethodIcon = (method: string) => {
  switch (method) {
    case "CARD":
      return CreditCard;
    case "CASH":
      return Banknote;
    case "CHECK":
      return Banknote;
    default:
      return DollarSign;
  }
};

export default function AllDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchDonations();
  }, [methodFilter, dateFrom, dateTo]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (methodFilter) params.set("method", methodFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const response = await fetch(`/api/donations?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setDonations(data.donations || []);
      }
    } catch (error) {
      console.error("Failed to fetch donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      donation.member?.firstName.toLowerCase().includes(searchLower) ||
      donation.member?.lastName.toLowerCase().includes(searchLower) ||
      donation.member?.email.toLowerCase().includes(searchLower) ||
      donation.fund?.name.toLowerCase().includes(searchLower)
    );
  });

  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0);

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
            <h1 className="text-3xl font-bold">All Donations</h1>
            <p className="text-muted-foreground">
              Complete donation history and records
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor name or fund..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">All Methods</option>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="CHECK">Check</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40"
              placeholder="To"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Showing {filteredDonations.length} donations
          </span>
        </div>
        <div className="text-lg font-semibold">
          Total: ${totalAmount.toLocaleString()}
        </div>
      </div>

      {/* Donations List */}
      <Card>
        <CardHeader>
          <CardTitle>Donation Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading donations...
            </div>
          ) : filteredDonations.length > 0 ? (
            <div className="divide-y">
              {filteredDonations.map((donation) => {
                const MethodIcon = getMethodIcon(donation.method);
                return (
                  <div
                    key={donation.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full">
                        <MethodIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {donation.member
                              ? `${donation.member.firstName} ${donation.member.lastName}`
                              : "Anonymous"}
                          </p>
                          {donation.isRecurring && (
                            <Badge variant="secondary" className="text-xs">
                              <Repeat className="h-3 w-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(donation.donatedAt).toLocaleDateString()}
                          {donation.fund && (
                            <>
                              <span>•</span>
                              <span className="px-2 py-0.5 rounded text-xs bg-muted">
                                {donation.fund.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        ${donation.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {donation.method.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No donations found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
