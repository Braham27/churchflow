"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  Home,
  Calendar,
  Users,
  HandHeart,
  Info,
  GripVertical,
} from "lucide-react";

// Mock data for pages
const mockPages = [
  {
    id: "home",
    title: "Home",
    slug: "/",
    template: "home",
    status: "PUBLISHED",
    lastModified: "2024-01-20",
    isSystem: true,
    icon: Home,
  },
  {
    id: "about",
    title: "About Us",
    slug: "/about",
    template: "content",
    status: "PUBLISHED",
    lastModified: "2024-01-15",
    isSystem: true,
    icon: Info,
  },
  {
    id: "events",
    title: "Events",
    slug: "/events",
    template: "events",
    status: "PUBLISHED",
    lastModified: "2024-01-18",
    isSystem: true,
    icon: Calendar,
  },
  {
    id: "give",
    title: "Give",
    slug: "/give",
    template: "giving",
    status: "PUBLISHED",
    lastModified: "2024-01-10",
    isSystem: true,
    icon: HandHeart,
  },
  {
    id: "contact",
    title: "Contact",
    slug: "/contact",
    template: "contact",
    status: "PUBLISHED",
    lastModified: "2024-01-12",
    isSystem: true,
    icon: Users,
  },
  {
    id: "sermons",
    title: "Sermons",
    slug: "/sermons",
    template: "sermons",
    status: "PUBLISHED",
    lastModified: "2024-01-19",
    isSystem: false,
    icon: FileText,
  },
  {
    id: "ministries",
    title: "Ministries",
    slug: "/ministries",
    template: "content",
    status: "DRAFT",
    lastModified: "2024-01-05",
    isSystem: false,
    icon: FileText,
  },
];

export default function WebsitePagesPage() {
  const [search, setSearch] = useState("");
  const [pages] = useState(mockPages);

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(search.toLowerCase()) ||
      page.slug.toLowerCase().includes(search.toLowerCase())
  );

  const systemPages = filteredPages.filter((p) => p.isSystem);
  const customPages = filteredPages.filter((p) => !p.isSystem);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Website Pages</h1>
          <p className="text-muted-foreground">
            Manage your church website pages
          </p>
        </div>
        <Link href="/dashboard/website/pages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* System Pages */}
      <div>
        <h2 className="text-lg font-semibold mb-4">System Pages</h2>
        <Card>
          <div className="divide-y">
            {systemPages.map((page) => {
              const Icon = page.icon;
              return (
                <div
                  key={page.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{page.title}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          page.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {page.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{page.slug}</p>
                  </div>
                  <div className="text-sm text-muted-foreground hidden sm:block">
                    Modified{" "}
                    {new Date(page.lastModified).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <a
                        href={`/c/demo${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Custom Pages */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Custom Pages</h2>
        {customPages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No custom pages</h3>
              <p className="text-muted-foreground mb-4">
                Create custom pages for additional content.
              </p>
              <Link href="/dashboard/website/pages/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y">
              {customPages.map((page) => {
                const Icon = page.icon;
                return (
                  <div
                    key={page.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{page.title}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            page.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {page.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {page.slug}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground hidden sm:block">
                      Modified{" "}
                      {new Date(page.lastModified).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={`/c/demo${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Navigation Menu */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Navigation Menu</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              Drag and drop to reorder menu items
            </p>
            <div className="space-y-2">
              {["Home", "About", "Sermons", "Events", "Give", "Contact"].map(
                (item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <span className="font-medium">{item}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      /{item.toLowerCase()}
                    </span>
                  </div>
                )
              )}
            </div>
            <Button variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
