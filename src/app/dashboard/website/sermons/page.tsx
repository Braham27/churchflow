"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  PlayCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  User,
  Video,
  Upload,
} from "lucide-react";

// Mock data
const mockSermons = [
  {
    id: "1",
    title: "Walking in Faith",
    speaker: "Pastor John Smith",
    date: "2024-01-21",
    duration: "45:30",
    series: "Faith Foundations",
    status: "PUBLISHED",
    views: 234,
    hasVideo: true,
    hasAudio: true,
  },
  {
    id: "2",
    title: "The Power of Prayer",
    speaker: "Pastor John Smith",
    date: "2024-01-14",
    duration: "42:15",
    series: "Faith Foundations",
    status: "PUBLISHED",
    views: 189,
    hasVideo: true,
    hasAudio: true,
  },
  {
    id: "3",
    title: "Finding Hope in Hard Times",
    speaker: "Pastor Sarah Johnson",
    date: "2024-01-07",
    duration: "38:45",
    series: "Hope Series",
    status: "DRAFT",
    views: 0,
    hasVideo: false,
    hasAudio: true,
  },
];

export default function SermonsManagementPage() {
  const [search, setSearch] = useState("");
  const [sermons] = useState(mockSermons);

  const filteredSermons = sermons.filter(
    (sermon) =>
      sermon.title.toLowerCase().includes(search.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(search.toLowerCase()) ||
      sermon.series.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sermon Management</h1>
          <p className="text-muted-foreground">
            Upload and manage sermon recordings
          </p>
        </div>
        <Link href="/dashboard/website/sermons/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Sermon
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{sermons.length}</div>
            <p className="text-sm text-muted-foreground">Total Sermons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sermons.filter((s) => s.status === "PUBLISHED").length}
            </div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {sermons.reduce((acc, s) => acc + s.views, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {new Set(sermons.map((s) => s.series)).size}
            </div>
            <p className="text-sm text-muted-foreground">Series</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sermons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Series</option>
              <option value="faith">Faith Foundations</option>
              <option value="hope">Hope Series</option>
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Sermons List */}
      <div className="space-y-4">
        {filteredSermons.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No sermons found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by uploading your first sermon.
              </p>
              <Link href="/dashboard/website/sermons/new">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Add Sermon
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredSermons.map((sermon) => (
            <Card key={sermon.id} className="overflow-hidden">
              <div className="flex">
                {/* Thumbnail */}
                <div className="w-48 aspect-video bg-gray-200 flex-shrink-0 flex items-center justify-center relative">
                  <PlayCircle className="h-12 w-12 text-gray-400" />
                  {sermon.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {sermon.duration}
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            sermon.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {sermon.status}
                        </span>
                        <span className="text-sm text-primary">
                          {sermon.series}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{sermon.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {sermon.speaker}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(sermon.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {sermon.views} views
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {sermon.hasVideo && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Video
                          </span>
                        )}
                        {sermon.hasAudio && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            Audio
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
