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
  Users,
  Calendar,
  MapPin,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";

interface Volunteer {
  id: string;
  status: string;
  availableDays: string[];
  notes: string | null;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    profileImage: string | null;
  };
  roles: {
    role: {
      id: string;
      name: string;
      department: string;
    };
  }[];
}

export default function AllVolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter]);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "500");
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`/api/volunteers?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setVolunteers(data.volunteers || []);
      }
    } catch (error) {
      console.error("Failed to fetch volunteers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter((volunteer) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    const fullName = `${volunteer.member.firstName} ${volunteer.member.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      volunteer.member.email.toLowerCase().includes(searchLower) ||
      volunteer.roles.some((r) =>
        r.role.name.toLowerCase().includes(searchLower)
      )
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "ON_LEAVE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/volunteers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">All Volunteers</h1>
            <p className="text-muted-foreground">
              Complete volunteer directory
            </p>
          </div>
        </div>
        <Link href="/dashboard/volunteers/new">
          <Button>
            <UserCheck className="mr-2 h-4 w-4" />
            Add Volunteer
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Showing {filteredVolunteers.length} volunteers
          </span>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">
            {volunteers.filter((v) => v.status === "ACTIVE").length} Active
          </span>
          <span className="text-yellow-600">
            {volunteers.filter((v) => v.status === "PENDING").length} Pending
          </span>
        </div>
      </div>

      {/* Volunteers Grid */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading volunteers...
        </div>
      ) : filteredVolunteers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVolunteers.map((volunteer) => (
            <Card key={volunteer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary font-semibold">
                    {volunteer.member.firstName[0]}
                    {volunteer.member.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {volunteer.member.firstName} {volunteer.member.lastName}
                      </h3>
                      <Badge
                        variant="outline"
                        className={getStatusColor(volunteer.status)}
                      >
                        {volunteer.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{volunteer.member.email}</span>
                      </div>
                      {volunteer.member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          <span>{volunteer.member.phone}</span>
                        </div>
                      )}
                    </div>

                    {volunteer.roles.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {volunteer.roles.slice(0, 2).map((vr) => (
                          <Badge key={vr.role.id} variant="secondary" className="text-xs">
                            {vr.role.name}
                          </Badge>
                        ))}
                        {volunteer.roles.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{volunteer.roles.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {volunteer.availableDays.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{volunteer.availableDays.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex justify-end">
                  <Link href={`/dashboard/volunteers/${volunteer.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">No volunteers found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
