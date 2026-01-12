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
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  Users,
  Keyboard,
} from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  startDate: string;
  checkInCode: string | null;
  _count: { attendances: number };
}

export default function ManualCheckInPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [search, setSearch] = useState("");
  const [memberIdOrCode, setMemberIdOrCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<
    { name: string; time: string; isChild: boolean }[]
  >([]);

  useEffect(() => {
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/events?today=true");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
        if (data.events?.length === 1) {
          setSelectedEvent(data.events[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) {
      toast.error("Please select an event first");
      return;
    }

    if (!memberIdOrCode.trim()) {
      toast.error("Please enter a member ID or security code");
      return;
    }

    setCheckingIn(true);

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          memberIdOrCode: memberIdOrCode.trim(),
          method: "MANUAL",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Check-in failed");
      }

      const result = await response.json();

      toast.success(`${result.memberName} checked in successfully!`);

      setRecentCheckins((prev) => [
        {
          name: result.memberName,
          time: new Date().toLocaleTimeString(),
          isChild: result.isChild || false,
        },
        ...prev.slice(0, 9),
      ]);

      setMemberIdOrCode("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Check-in failed"
      );
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/checkin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Manual Check-In</h1>
          <p className="text-muted-foreground">
            Check in members using ID or security code
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Check-in Form */}
        <div className="space-y-6">
          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Loading events...
                </div>
              ) : events.length > 0 ? (
                <div className="space-y-2">
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        selectedEvent?.id === event.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.startDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {event._count.attendances} checked in
                          </Badge>
                          {selectedEvent?.id === event.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No events scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Enter ID or Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualCheckIn} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Member ID, phone, or child security code"
                    value={memberIdOrCode}
                    onChange={(e) => setMemberIdOrCode(e.target.value)}
                    className="text-lg h-12"
                    autoFocus
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter phone number, member ID, or 4-digit security code for
                    children
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={!selectedEvent || checkingIn}
                >
                  {checkingIn ? (
                    "Checking in..."
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-5 w-5" />
                      Check In
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Search Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {search.length > 2 && (
                <div className="mt-4 text-center text-muted-foreground">
                  Search functionality coming soon...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Check-ins */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCheckins.length > 0 ? (
              <div className="space-y-3">
                {recentCheckins.map((checkin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">{checkin.name}</p>
                        {checkin.isChild && (
                          <Badge variant="secondary" className="text-xs">
                            Child
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {checkin.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No check-ins yet</p>
                <p className="text-sm">Check-ins will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
