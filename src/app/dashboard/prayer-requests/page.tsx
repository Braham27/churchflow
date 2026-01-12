"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Heart, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Users, 
  Filter,
  Search,
  MessageCircle,
} from "lucide-react";

interface PrayerRequest {
  id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  isAnonymous: boolean;
  status: "PENDING" | "PRAYING" | "ANSWERED";
  prayerCount: number;
  createdAt: string;
  member?: {
    firstName: string;
    lastName: string;
  };
}

type Status = "PENDING" | "PRAYING" | "ANSWERED" | "ALL";

export default function PrayerRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<Status>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    isPrivate: false,
    isAnonymous: false,
  });

  useEffect(() => {
    fetchPrayerRequests();
  }, [statusFilter]);

  async function fetchPrayerRequests() {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }
      
      const response = await fetch(`/api/prayer-requests?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch prayer requests");
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching prayer requests:", error);
      toast.error("Failed to load prayer requests");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
      });

      if (!response.ok) throw new Error("Failed to create prayer request");

      toast.success("Prayer request submitted");
      setNewRequest({ title: "", description: "", isPrivate: false, isAnonymous: false });
      setShowNewForm(false);
      fetchPrayerRequests();
    } catch (error) {
      console.error("Error creating prayer request:", error);
      toast.error("Failed to submit prayer request");
    }
  }

  async function handlePray(requestId: string) {
    try {
      const response = await fetch(`/api/prayer-requests/${requestId}/pray`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to record prayer");

      toast.success("Thank you for praying!");
      fetchPrayerRequests();
    } catch (error) {
      console.error("Error recording prayer:", error);
      toast.error("Failed to record prayer");
    }
  }

  async function handleMarkAnswered(requestId: string) {
    try {
      const response = await fetch(`/api/prayer-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ANSWERED" }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast.success("Marked as answered - Praise God!");
      fetchPrayerRequests();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  }

  const filteredRequests = requests.filter((request) =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: PrayerRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "PRAYING":
        return <Badge className="bg-blue-500"><Heart className="h-3 w-3 mr-1" /> Praying</Badge>;
      case "ANSWERED":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Answered</Badge>;
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    praying: requests.filter((r) => r.status === "PRAYING").length,
    answered: requests.filter((r) => r.status === "ANSWERED").length,
    totalPrayers: requests.reduce((sum, r) => sum + r.prayerCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prayer Requests</h1>
          <p className="text-muted-foreground">
            Share prayer needs and pray for one another
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Being Prayed For</CardTitle>
            <Heart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.praying}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answered</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.answered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prayers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrayers}</div>
          </CardContent>
        </Card>
      </div>

      {/* New Request Form */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Submit a Prayer Request</CardTitle>
            <CardDescription>
              Share your prayer need with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief title for your request"
                  value={newRequest.title}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Share details about your prayer need..."
                  value={newRequest.description}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequest.isPrivate}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, isPrivate: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm flex items-center">
                    <Lock className="h-4 w-4 mr-1" />
                    Private (only visible to leadership)
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRequest.isAnonymous}
                    onChange={(e) =>
                      setNewRequest({ ...newRequest, isAnonymous: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Anonymous
                  </span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status)}
            className="w-[180px]"
          >
            <option value="ALL">All Requests</option>
            <option value="PENDING">Pending</option>
            <option value="PRAYING">Being Prayed For</option>
            <option value="ANSWERED">Answered</option>
          </Select>
        </div>
      </div>

      {/* Prayer Requests List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading prayer requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Prayer Requests</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No requests match your search"
                : "Be the first to submit a prayer request"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  {request.isAnonymous
                    ? "Anonymous"
                    : request.member
                    ? `${request.member.firstName} ${request.member.lastName}`
                    : "Unknown"}
                  {" · "}
                  {new Date(request.createdAt).toLocaleDateString()}
                  {request.isPrivate && (
                    <span className="ml-2 text-amber-500">
                      <Lock className="h-3 w-3 inline" /> Private
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {request.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    <Heart className="h-4 w-4 inline mr-1" />
                    {request.prayerCount} {request.prayerCount === 1 ? "prayer" : "prayers"}
                  </span>
                  <div className="space-x-2">
                    {request.status !== "ANSWERED" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePray(request.id)}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          Pray
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAnswered(request.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Answered
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
