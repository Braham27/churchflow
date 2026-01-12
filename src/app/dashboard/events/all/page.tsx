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
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  Filter,
  Edit,
  Eye,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  category: string;
  isPublic: boolean;
  _count: {
    attendances: number;
    registrations: number;
  };
}

export default function AllEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("upcoming");

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, dateFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (categoryFilter) params.set("category", categoryFilter);
      if (dateFilter === "upcoming") params.set("upcoming", "true");
      if (dateFilter === "past") params.set("past", "true");

      const response = await fetch(`/api/events?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower) ||
      event.category.toLowerCase().includes(searchLower)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      SERVICE: "bg-blue-100 text-blue-800",
      BIBLE_STUDY: "bg-purple-100 text-purple-800",
      YOUTH: "bg-green-100 text-green-800",
      CHILDREN: "bg-yellow-100 text-yellow-800",
      OUTREACH: "bg-orange-100 text-orange-800",
      PRAYER: "bg-pink-100 text-pink-800",
      SOCIAL: "bg-indigo-100 text-indigo-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.OTHER;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/events">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">All Events</h1>
            <p className="text-muted-foreground">
              Browse and manage all church events
            </p>
          </div>
        </div>
        <Link href="/dashboard/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
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
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="all">All</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">All Categories</option>
              <option value="SERVICE">Service</option>
              <option value="BIBLE_STUDY">Bible Study</option>
              <option value="YOUTH">Youth</option>
              <option value="CHILDREN">Children</option>
              <option value="OUTREACH">Outreach</option>
              <option value="PRAYER">Prayer</option>
              <option value="SOCIAL">Social</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading events...
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="divide-y">
              {filteredEvents.map((event) => {
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                const isPast = endDate < new Date();

                return (
                  <div
                    key={event.id}
                    className={`flex items-center justify-between p-4 hover:bg-muted/30 ${
                      isPast ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-2xl font-bold text-primary">
                          {startDate.getDate()}
                        </p>
                        <p className="text-sm text-muted-foreground uppercase">
                          {startDate.toLocaleString("default", {
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge
                            variant="outline"
                            className={getCategoryColor(event.category)}
                          >
                            {event.category.replace("_", " ")}
                          </Badge>
                          {!event.isPublic && (
                            <Badge variant="secondary">Private</Badge>
                          )}
                          {isPast && <Badge variant="outline">Past</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {startDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event._count.attendances} attended
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/events/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/events/${event.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
