"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Send,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";

const CHANNEL_OPTIONS = [
  { value: "EMAIL", label: "Email", icon: Mail, description: "Send an email newsletter" },
  { value: "SMS", label: "SMS", icon: MessageSquare, description: "Text message (charges may apply)" },
  { value: "PUSH", label: "Push Notification", icon: Send, description: "App notification" },
];

export default function NewCommunicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState(false);

  const [formData, setFormData] = useState({
    channel: searchParams.get("type")?.toUpperCase() || "EMAIL",
    subject: "",
    content: "",
    recipientType: searchParams.get("audience") || "all",
    groupId: "",
    scheduledFor: "",
    aiPrompt: "",
  });

  // Load template if specified
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [searchParams]);

  const fetchTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/communications/templates/${templateId}`);
      if (response.ok) {
        const template = await response.json();
        setFormData((prev) => ({
          ...prev,
          subject: template.subject || "",
          content: template.content || "",
        }));
      }
    } catch (error) {
      console.error("Failed to load template:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAIGenerate = async () => {
    if (!formData.aiPrompt.trim()) {
      toast.error("Please enter a prompt for the AI");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/communications/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: formData.aiPrompt,
          channel: formData.channel,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({
          ...prev,
          subject: result.subject || prev.subject,
          content: result.content || prev.content,
        }));
        toast.success("AI generated your message!");
      } else {
        toast.error("Failed to generate content");
      }
    } catch (error) {
      toast.error("AI generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error("Subject is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Message content is required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: isDraft ? "DRAFT" : scheduleMessage ? "SCHEDULED" : "SENDING",
          scheduledFor: scheduleMessage && formData.scheduledFor
            ? new Date(formData.scheduledFor).toISOString()
            : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      toast.success(
        isDraft
          ? "Message saved as draft"
          : scheduleMessage
          ? "Message scheduled successfully"
          : "Message sent successfully!"
      );
      router.push("/dashboard/communications");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/communications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Message</h1>
          <p className="text-muted-foreground">
            Compose and send a message to your congregation
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* Channel Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {CHANNEL_OPTIONS.map((channel) => {
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, channel: channel.value }))
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                      formData.channel === channel.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="font-medium">{channel.label}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {channel.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recipients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientType">Send To</Label>
              <select
                id="recipientType"
                name="recipientType"
                value={formData.recipientType}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Members</option>
                <option value="volunteers">All Volunteers</option>
                <option value="leaders">Group Leaders</option>
                <option value="group">Specific Group</option>
                <option value="custom">Custom Selection</option>
              </select>
            </div>

            {formData.recipientType === "group" && (
              <div className="space-y-2">
                <Label htmlFor="groupId">Select Group</Label>
                <select
                  id="groupId"
                  name="groupId"
                  value={formData.groupId}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Choose a group...</option>
                  {/* Groups loaded dynamically */}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Assistance */}
        <Card className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Sparkles className="h-5 w-5" />
              AI Writing Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiPrompt">Describe what you want to write</Label>
              <Textarea
                id="aiPrompt"
                name="aiPrompt"
                placeholder="e.g., A friendly reminder about Sunday's potluck after service, encouraging families to bring a dish to share"
                value={formData.aiPrompt}
                onChange={handleChange}
                rows={2}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAIGenerate}
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                "Generating..."
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Message Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Enter message subject..."
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message *</Label>
              <Textarea
                id="content"
                name="content"
                placeholder={
                  formData.channel === "SMS"
                    ? "Keep it short for SMS (160 characters recommended)"
                    : "Write your message here..."
                }
                value={formData.content}
                onChange={handleChange}
                rows={formData.channel === "SMS" ? 4 : 10}
                required
              />
              {formData.channel === "SMS" && (
                <p className="text-xs text-muted-foreground">
                  {formData.content.length} characters
                  {formData.content.length > 160 && (
                    <span className="text-yellow-600">
                      {" "}(may be split into multiple messages)
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Personalization Tags</p>
              <p className="text-xs text-muted-foreground">
                Use these in your message: {"{firstName}"}, {"{lastName}"}, {"{email}"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scheduleMessage"
                checked={scheduleMessage}
                onChange={(e) => setScheduleMessage(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="scheduleMessage" className="font-normal cursor-pointer">
                Schedule for later
              </Label>
            </div>

            {scheduleMessage && (
              <div className="space-y-2">
                <Label htmlFor="scheduledFor">Send Date & Time</Label>
                <Input
                  id="scheduledFor"
                  name="scheduledFor"
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  required={scheduleMessage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            Save as Draft
          </Button>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/communications">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading}>
              <Send className="mr-2 h-4 w-4" />
              {scheduleMessage ? "Schedule" : "Send Now"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
