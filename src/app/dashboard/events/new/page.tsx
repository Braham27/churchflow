"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, QrCode, Globe, Video } from "lucide-react";
import { toast } from "sonner";

const eventCategories = [
  { value: "SERVICE", label: "Worship Service" },
  { value: "WORSHIP", label: "Worship Night" },
  { value: "PRAYER", label: "Prayer Meeting" },
  { value: "BIBLE_STUDY", label: "Bible Study" },
  { value: "YOUTH", label: "Youth Event" },
  { value: "CHILDREN", label: "Children's Event" },
  { value: "OUTREACH", label: "Outreach" },
  { value: "FELLOWSHIP", label: "Fellowship" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "CONCERT", label: "Concert" },
  { value: "FUNDRAISER", label: "Fundraiser" },
  { value: "MEETING", label: "Meeting" },
  { value: "TRAINING", label: "Training" },
  { value: "OTHER", label: "Other" },
];

export default function NewEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "SERVICE",
    location: "",
    address: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    allDay: false,
    isRecurring: false,
    recurrenceRule: "",
    requiresRegistration: false,
    maxAttendees: "",
    isPublic: true,
    publishToWebsite: false,
    enableCheckIn: true,
    isLiveStream: false,
    streamUrl: "",
    streamPlatform: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
      const endDateTime = formData.endDate
        ? new Date(`${formData.endDate}T${formData.endTime || "23:59"}`)
        : new Date(`${formData.startDate}T${formData.endTime || "23:59"}`);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create event");
      }

      toast.success("Event created successfully!");
      router.push("/dashboard/events");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="text-muted-foreground">Schedule a new event for your church</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>Basic information about the event</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Sunday Worship Service"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {eventCategories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Main Sanctuary"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address if different from church"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the event..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
            <CardDescription>When will this event take place?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="allDay"
                name="allDay"
                checked={formData.allDay}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="allDay" className="font-normal">
                All day event
              </Label>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isRecurring" className="font-normal">
                This is a recurring event
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Registration & Check-in */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Registration & Check-in
            </CardTitle>
            <CardDescription>Configure attendance tracking options</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableCheckIn"
                name="enableCheckIn"
                checked={formData.enableCheckIn}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="enableCheckIn" className="font-normal">
                Enable QR code check-in
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresRegistration"
                name="requiresRegistration"
                checked={formData.requiresRegistration}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="requiresRegistration" className="font-normal">
                Require registration
              </Label>
            </div>
            {formData.requiresRegistration && (
              <div className="space-y-2">
                <Label htmlFor="maxAttendees">Maximum Attendees</Label>
                <Input
                  id="maxAttendees"
                  name="maxAttendees"
                  type="number"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Visibility
            </CardTitle>
            <CardDescription>Control who can see this event</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isPublic" className="font-normal">
                Public event (visible to all)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="publishToWebsite"
                name="publishToWebsite"
                checked={formData.publishToWebsite}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="publishToWebsite" className="font-normal">
                Publish to church website
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Live Stream */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Live Streaming
            </CardTitle>
            <CardDescription>Configure live stream integration</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="isLiveStream"
                name="isLiveStream"
                checked={formData.isLiveStream}
                onChange={handleChange}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="isLiveStream" className="font-normal">
                This event will be live streamed
              </Label>
            </div>
            {formData.isLiveStream && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="streamPlatform">Platform</Label>
                  <select
                    id="streamPlatform"
                    name="streamPlatform"
                    value={formData.streamPlatform}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select platform</option>
                    <option value="youtube">YouTube Live</option>
                    <option value="facebook">Facebook Live</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streamUrl">Stream URL</Label>
                  <Input
                    id="streamUrl"
                    name="streamUrl"
                    value={formData.streamUrl}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/dashboard/events">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={loading}>
            <Save className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
}
