"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, UserCheck, Calendar, Clock, Award } from "lucide-react";
import { toast } from "sonner";

interface Volunteer {
  id: string;
  memberId: string;
  roleId: string | null;
  status: string;
  skills: string[];
  availability: string[];
  notes: string | null;
  startDate: string | null;
  backgroundCheckDate: string | null;
  trainingCompleted: boolean;
}

export default function EditVolunteerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    status: "ACTIVE",
    skills: "",
    availability: [] as string[],
    notes: "",
    startDate: "",
    backgroundCheckDate: "",
    trainingCompleted: false,
  });

  const availabilityOptions = [
    { value: "sunday_morning", label: "Sunday Morning" },
    { value: "sunday_evening", label: "Sunday Evening" },
    { value: "wednesday", label: "Wednesday" },
    { value: "weekday", label: "Weekdays" },
    { value: "weekend", label: "Weekends" },
    { value: "special_events", label: "Special Events" },
  ];

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        const response = await fetch(`/api/volunteers/${id}`);
        if (!response.ok) throw new Error("Failed to fetch volunteer");
        const volunteer: Volunteer = await response.json();

        setFormData({
          status: volunteer.status || "ACTIVE",
          skills: volunteer.skills?.join(", ") || "",
          availability: volunteer.availability || [],
          notes: volunteer.notes || "",
          startDate: volunteer.startDate
            ? new Date(volunteer.startDate).toISOString().split("T")[0]
            : "",
          backgroundCheckDate: volunteer.backgroundCheckDate
            ? new Date(volunteer.backgroundCheckDate).toISOString().split("T")[0]
            : "",
          trainingCompleted: volunteer.trainingCompleted || false,
        });
      } catch (error) {
        toast.error("Failed to load volunteer");
        router.push("/dashboard/volunteers");
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [id, router]);

  const handleAvailabilityChange = (value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      availability: checked
        ? [...prev.availability, value]
        : prev.availability.filter((a) => a !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/volunteers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error("Failed to update volunteer");

      toast.success("Volunteer updated successfully!");
      router.push(`/dashboard/volunteers/${id}`);
    } catch (error) {
      toast.error("Failed to update volunteer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/volunteers/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Volunteer</h1>
          <p className="text-muted-foreground">Update volunteer information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Volunteer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ON_LEAVE">On Leave</option>
                    <option value="PENDING">Pending Approval</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Skills & Abilities
                  </label>
                  <Input
                    value={formData.skills}
                    onChange={(e) =>
                      setFormData({ ...formData, skills: e.target.value })
                    }
                    placeholder="e.g., Music, Teaching, Technology (comma-separated)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter skills separated by commas
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Additional notes about this volunteer"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {availabilityOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(option.value)}
                        onChange={(e) =>
                          handleAvailabilityChange(option.value, e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dates & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Background Check Date
                  </label>
                  <Input
                    type="date"
                    value={formData.backgroundCheckDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        backgroundCheckDate: e.target.value,
                      })
                    }
                  />
                </div>

                <label className="flex items-center gap-2 p-3 rounded-lg border">
                  <input
                    type="checkbox"
                    checked={formData.trainingCompleted}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trainingCompleted: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">
                    Training Completed
                  </span>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={saving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/dashboard/volunteers/${id}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
