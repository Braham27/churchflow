"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Users, UserPlus } from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
}

const groupCategories = [
  "Small Group",
  "Bible Study",
  "Youth",
  "Children",
  "Men's Ministry",
  "Women's Ministry",
  "Young Adults",
  "Seniors",
  "Music & Worship",
  "Prayer",
  "Outreach",
  "Support Group",
  "Other",
];

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Small Group",
    meetingSchedule: "",
    meetingLocation: "",
    leaderId: "",
    maxMembers: "",
    isOpen: true,
  });

  useEffect(() => {
    // Fetch members for leader selection
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members?limit=500");
        if (response.ok) {
          const data = await response.json();
          setMembers(data.members || []);
        }
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create group");
      }

      toast.success("Group created successfully!");
      router.push("/dashboard/groups");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create group"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/groups">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Group</h1>
          <p className="text-muted-foreground">
            Add a new small group, ministry, or team
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Group Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Young Adults Bible Study"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the group..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  {groupCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="leaderId">Group Leader</Label>
                <select
                  id="leaderId"
                  name="leaderId"
                  value={formData.leaderId}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  <option value="">Select a leader...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Meeting Info */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Meeting Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="meetingSchedule">Meeting Schedule</Label>
                  <Input
                    id="meetingSchedule"
                    name="meetingSchedule"
                    value={formData.meetingSchedule}
                    onChange={handleChange}
                    placeholder="e.g., Wednesdays at 7:00 PM"
                  />
                </div>

                <div>
                  <Label htmlFor="meetingLocation">Meeting Location</Label>
                  <Input
                    id="meetingLocation"
                    name="meetingLocation"
                    value={formData.meetingLocation}
                    onChange={handleChange}
                    placeholder="e.g., Room 201 or Zoom"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Group Settings</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="maxMembers">Maximum Members</Label>
                  <Input
                    id="maxMembers"
                    name="maxMembers"
                    type="number"
                    min="0"
                    value={formData.maxMembers}
                    onChange={handleChange}
                    placeholder="Leave empty for unlimited"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave empty for no limit
                  </p>
                </div>

                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isOpen"
                      checked={formData.isOpen}
                      onChange={handleChange}
                      className="rounded border-gray-300"
                    />
                    <span>Open for new members</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/dashboard/groups">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Group
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
