"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Video,
  Youtube,
  Facebook,
  PlayCircle,
  Settings,
  Eye,
} from "lucide-react";

export default function LiveStreamPage() {
  const [activeTab, setActiveTab] = useState<"settings" | "preview">("settings");
  const [formData, setFormData] = useState({
    enabled: true,
    platform: "youtube",
    youtubeChannelId: "",
    youtubeVideoId: "",
    facebookPageId: "",
    facebookVideoId: "",
    customEmbedUrl: "",
    title: "Live Worship Service",
    description: "Join us for our live worship service every Sunday at 10:00 AM",
    showChat: true,
    autoplay: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Live stream settings saved");
  };

  const getEmbedUrl = () => {
    switch (formData.platform) {
      case "youtube":
        if (formData.youtubeVideoId) {
          return `https://www.youtube.com/embed/${formData.youtubeVideoId}${
            formData.autoplay ? "?autoplay=1" : ""
          }`;
        }
        if (formData.youtubeChannelId) {
          return `https://www.youtube.com/embed/live_stream?channel=${formData.youtubeChannelId}${
            formData.autoplay ? "&autoplay=1" : ""
          }`;
        }
        return null;
      case "facebook":
        if (formData.facebookVideoId) {
          return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/watch/?v=${formData.facebookVideoId}&show_text=false`;
        }
        return null;
      case "custom":
        return formData.customEmbedUrl || null;
      default:
        return null;
    }
  };

  const embedUrl = getEmbedUrl();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/website">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Live Streaming</h1>
            <p className="text-muted-foreground">
              Configure live stream integration for your website
            </p>
          </div>
        </div>
        <Button onClick={handleSubmit}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="inline-block mr-2 h-4 w-4" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "preview"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="inline-block mr-2 h-4 w-4" />
          Preview
        </button>
      </div>

      {activeTab === "settings" ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enable/Disable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Live Stream Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, enabled: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300"
                />
                <div>
                  <span className="font-medium">Enable Live Streaming</span>
                  <p className="text-sm text-muted-foreground">
                    Show live stream player on your public website
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.platform === "youtube"
                      ? "border-red-500 bg-red-50"
                      : "hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value="youtube"
                    checked={formData.platform === "youtube"}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="sr-only"
                  />
                  <Youtube className="h-8 w-8 text-red-600" />
                  <span className="font-medium">YouTube</span>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.platform === "facebook"
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value="facebook"
                    checked={formData.platform === "facebook"}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="sr-only"
                  />
                  <Facebook className="h-8 w-8 text-blue-600" />
                  <span className="font-medium">Facebook</span>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.platform === "custom"
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="platform"
                    value="custom"
                    checked={formData.platform === "custom"}
                    onChange={(e) =>
                      setFormData({ ...formData, platform: e.target.value })
                    }
                    className="sr-only"
                  />
                  <PlayCircle className="h-8 w-8 text-primary" />
                  <span className="font-medium">Custom</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Platform-specific settings */}
          {formData.platform === "youtube" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-red-600" />
                  YouTube Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtubeChannelId">Channel ID</Label>
                  <Input
                    id="youtubeChannelId"
                    value={formData.youtubeChannelId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        youtubeChannelId: e.target.value,
                      })
                    }
                    placeholder="UCxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    For automatic live stream detection. Find your channel ID in
                    YouTube Studio → Settings → Channel → Advanced settings.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtubeVideoId">
                    Or Specific Video/Stream ID
                  </Label>
                  <Input
                    id="youtubeVideoId"
                    value={formData.youtubeVideoId}
                    onChange={(e) =>
                      setFormData({ ...formData, youtubeVideoId: e.target.value })
                    }
                    placeholder="dQw4w9WgXcQ"
                  />
                  <p className="text-xs text-muted-foreground">
                    The video ID from the YouTube URL (e.g.,
                    youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.platform === "facebook" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Facebook Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookPageId">Page ID</Label>
                  <Input
                    id="facebookPageId"
                    value={formData.facebookPageId}
                    onChange={(e) =>
                      setFormData({ ...formData, facebookPageId: e.target.value })
                    }
                    placeholder="YourChurchPage"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookVideoId">Video ID</Label>
                  <Input
                    id="facebookVideoId"
                    value={formData.facebookVideoId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        facebookVideoId: e.target.value,
                      })
                    }
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-muted-foreground">
                    The video ID from the Facebook video URL
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {formData.platform === "custom" && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Embed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customEmbedUrl">Embed URL</Label>
                  <Input
                    id="customEmbedUrl"
                    value={formData.customEmbedUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, customEmbedUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Direct URL to embed (supports iframe-compatible streaming
                    services)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Live Worship Service"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Join us for our live worship service..."
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showChat}
                    onChange={(e) =>
                      setFormData({ ...formData, showChat: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Show live chat (if available)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoplay}
                    onChange={(e) =>
                      setFormData({ ...formData, autoplay: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Autoplay when page loads</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        /* Preview Tab */
        <Card>
          <CardHeader>
            <CardTitle>Live Stream Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h2 className="text-xl font-bold">{formData.title}</h2>
              <p className="text-muted-foreground">{formData.description}</p>

              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <PlayCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No stream configured</p>
                      <p className="text-sm opacity-70">
                        Add your stream details in the settings tab
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!formData.enabled && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Live streaming is currently disabled. Enable it in the
                    settings to show on your public website.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
