"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  Image,
  Video,
  FileText,
  Trash2,
  Search,
  FolderPlus,
  Grid,
  List,
  Download,
  Eye,
} from "lucide-react";

// Mock media data - in production this would come from an API
const mockMedia = [
  {
    id: "1",
    name: "church-exterior.jpg",
    type: "image",
    size: 2456000,
    url: "/placeholder-church.jpg",
    uploadedAt: new Date("2024-01-15"),
    folder: "general",
  },
  {
    id: "2",
    name: "worship-service.mp4",
    type: "video",
    size: 125000000,
    url: "/placeholder-video.mp4",
    uploadedAt: new Date("2024-01-10"),
    folder: "videos",
  },
  {
    id: "3",
    name: "bulletin-2024-01.pdf",
    type: "document",
    size: 456000,
    url: "/placeholder-doc.pdf",
    uploadedAt: new Date("2024-01-08"),
    folder: "documents",
  },
  {
    id: "4",
    name: "pastor-headshot.jpg",
    type: "image",
    size: 1234000,
    url: "/placeholder-pastor.jpg",
    uploadedAt: new Date("2024-01-05"),
    folder: "people",
  },
];

export default function MediaLibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const folders = ["general", "videos", "documents", "people", "events"];

  const filteredMedia = mockMedia.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder
      ? item.folder === selectedFolder
      : true;
    return matchesSearch && matchesFolder;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5 text-blue-500" />;
      case "video":
        return <Video className="h-5 w-5 text-purple-500" />;
      case "document":
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleUpload = () => {
    toast.success("Upload functionality would open file picker here");
  };

  const handleDelete = (id: string) => {
    toast.success("File deleted");
  };

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
            <h1 className="text-2xl font-bold">Media Library</h1>
            <p className="text-muted-foreground">
              Manage images, videos, and documents for your website
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUpload}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar - Folders */}
        <Card className="w-64 flex-shrink-0 hidden lg:block">
          <CardHeader>
            <CardTitle className="text-sm">Folders</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                !selectedFolder
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              All Files
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                  selectedFolder === folder
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {folder}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm lg:hidden">
              <option value="">All Folders</option>
              {folders.map((folder) => (
                <option key={folder} value={folder}>
                  {folder}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Files Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <Card
                  key={item.id}
                  className="group cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    {/* Preview */}
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                      {item.type === "image" ? (
                        <Image className="h-12 w-12 text-muted-foreground" />
                      ) : item.type === "video" ? (
                        <Video className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="secondary">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.size)} •{" "}
                        {item.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                        Name
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                        Type
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                        Size
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                        Uploaded
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedia.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(item.type)}
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell capitalize">
                          {item.type}
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {formatFileSize(item.size)}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          {item.uploadedAt.toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {filteredMedia.length === 0 && (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Upload some files to get started"}
              </p>
              <Button onClick={handleUpload}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Files
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
