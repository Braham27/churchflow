"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
  Shield,
} from "lucide-react";

const notificationCategories = [
  {
    id: "members",
    title: "Members",
    icon: Users,
    settings: [
      { id: "new_member", label: "New member registrations", email: true, push: true },
      { id: "member_update", label: "Member profile updates", email: false, push: false },
      { id: "member_birthday", label: "Member birthdays", email: true, push: true },
      { id: "member_anniversary", label: "Membership anniversaries", email: false, push: true },
    ],
  },
  {
    id: "donations",
    title: "Donations",
    icon: DollarSign,
    settings: [
      { id: "new_donation", label: "New donation received", email: true, push: true },
      { id: "recurring_donation", label: "Recurring donation processed", email: true, push: false },
      { id: "failed_donation", label: "Failed donation attempts", email: true, push: true },
      { id: "donation_goal", label: "Donation goal progress", email: false, push: true },
    ],
  },
  {
    id: "events",
    title: "Events",
    icon: Calendar,
    settings: [
      { id: "event_registration", label: "New event registrations", email: true, push: true },
      { id: "event_reminder", label: "Upcoming event reminders", email: true, push: true },
      { id: "event_cancellation", label: "Event cancellations", email: true, push: true },
      { id: "event_full", label: "Event capacity reached", email: true, push: false },
    ],
  },
  {
    id: "communications",
    title: "Communications",
    icon: MessageSquare,
    settings: [
      { id: "message_reply", label: "Message replies", email: true, push: true },
      { id: "contact_form", label: "Contact form submissions", email: true, push: true },
      { id: "prayer_request", label: "New prayer requests", email: true, push: false },
      { id: "newsletter_signup", label: "Newsletter signups", email: false, push: false },
    ],
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    settings: [
      { id: "login_alert", label: "New login alerts", email: true, push: true },
      { id: "password_change", label: "Password changes", email: true, push: true },
      { id: "team_member_added", label: "Team member added", email: true, push: false },
      { id: "api_key_created", label: "API key created", email: true, push: true },
    ],
  },
];

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Notification Settings</h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications
          </p>
        </div>
        <Button>Save Changes</Button>
      </div>

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">admin@churchname.org</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="email-toggle" className="sr-only">Enable email</Label>
              <input type="checkbox" id="email-toggle" defaultChecked className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Browser and mobile app</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="push-toggle" className="sr-only">Enable push</Label>
              <input type="checkbox" id="push-toggle" defaultChecked className="h-4 w-4" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Premium feature</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Upgrade</Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      {notificationCategories.map((category) => {
        const Icon = category.icon;
        return (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <span>Notification</span>
                  <span className="text-center">Email</span>
                  <span className="text-center">Push</span>
                </div>
                {category.settings.map((setting) => (
                  <div key={setting.id} className="grid grid-cols-3 gap-4 items-center">
                    <span className="text-sm">{setting.label}</span>
                    <div className="flex justify-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={setting.email} 
                        className="h-4 w-4"
                        aria-label={`${setting.label} email notification`}
                      />
                    </div>
                    <div className="flex justify-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={setting.push} 
                        className="h-4 w-4"
                        aria-label={`${setting.label} push notification`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause notifications during specific times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input type="checkbox" id="quiet-hours" className="h-4 w-4" />
            <Label htmlFor="quiet-hours">Enable quiet hours</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>10:00 PM</option>
                <option>11:00 PM</option>
                <option>12:00 AM</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>6:00 AM</option>
                <option>7:00 AM</option>
                <option>8:00 AM</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Critical security alerts will still be delivered during quiet hours</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
