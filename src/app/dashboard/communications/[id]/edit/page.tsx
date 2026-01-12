"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, MessageSquare, Send, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Communication {
  id: string;
  type: string;
  subject: string;
  content: string;
  status: string;
  scheduledFor: string | null;
}

export default function EditCommunicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalStatus, setOriginalStatus] = useState("");
  const [formData, setFormData] = useState({
    type: "EMAIL",
    subject: "",
    content: "",
    scheduledFor: "",
  });

  useEffect(() => {
    const fetchCommunication = async () => {
      try {
        const response = await fetch(`/api/communications/${id}`);
        if (!response.ok) throw new Error("Failed to fetch communication");
        const communication: Communication = await response.json();

        setOriginalStatus(communication.status);
        setFormData({
          type: communication.type || "EMAIL",
          subject: communication.subject || "",
          content: communication.content || "",
          scheduledFor: communication.scheduledFor
            ? new Date(communication.scheduledFor).toISOString().slice(0, 16)
            : "",
        });
      } catch (error) {
        toast.error("Failed to load communication");
        router.push("/dashboard/communications");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunication();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/communications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update communication");
      }

      toast.success("Communication updated successfully!");
      router.push(`/dashboard/communications/${id}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update";
      toast.error(message);
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

  // Can't edit sent communications
  if (originalStatus === "SENT") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/communications/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Communication</h1>
            <p className="text-muted-foreground">This communication has already been sent</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Cannot Edit Sent Messages</h3>
            <p className="text-muted-foreground mb-4">
              This communication has already been sent and cannot be modified.
            </p>
            <Link href={`/dashboard/communications/${id}`}>
              <Button>View Communication</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/communications/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Communication</h1>
          <p className="text-muted-foreground">Update your message</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="PUSH">Push Notification</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Enter subject line"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter your message content"
                    rows={10}
                    required
                  />
                  {formData.type === "SMS" && (
                    <p className="text-xs text-muted-foreground">
                      {formData.content.length}/160 characters
                      {formData.content.length > 160 &&
                        ` (${Math.ceil(formData.content.length / 160)} segments)`}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Schedule For (optional)
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduledFor: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to save as draft
                  </p>
                </div>
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
                    onClick={() => router.push(`/dashboard/communications/${id}`)}
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
