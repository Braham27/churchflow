"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Layout,
  Type,
  Image,
  Video,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  GripVertical,
  Plus,
  Trash2,
  Save,
  Eye,
  Settings,
} from "lucide-react";

type BlockType =
  | "heading"
  | "text"
  | "image"
  | "video"
  | "events"
  | "donation"
  | "staff"
  | "map"
  | "hero"
  | "columns";

interface ContentBlock {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
}

const blockTypes = [
  {
    type: "hero" as BlockType,
    label: "Hero Section",
    icon: Layout,
    description: "Large banner with title and image",
  },
  {
    type: "heading" as BlockType,
    label: "Heading",
    icon: Type,
    description: "Section title or subtitle",
  },
  {
    type: "text" as BlockType,
    label: "Text Block",
    icon: FileText,
    description: "Paragraph or rich text content",
  },
  {
    type: "image" as BlockType,
    label: "Image",
    icon: Image,
    description: "Single image with caption",
  },
  {
    type: "video" as BlockType,
    label: "Video Embed",
    icon: Video,
    description: "YouTube or Vimeo video",
  },
  {
    type: "events" as BlockType,
    label: "Events List",
    icon: Calendar,
    description: "Upcoming events from your calendar",
  },
  {
    type: "donation" as BlockType,
    label: "Donation Button",
    icon: DollarSign,
    description: "Give/donate call to action",
  },
  {
    type: "staff" as BlockType,
    label: "Staff Directory",
    icon: Users,
    description: "Team members grid",
  },
  {
    type: "map" as BlockType,
    label: "Location Map",
    icon: MapPin,
    description: "Google Maps embed",
  },
  {
    type: "columns" as BlockType,
    label: "Columns",
    icon: Layout,
    description: "Multi-column layout",
  },
];

export default function NewPageForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isHomePage, setIsHomePage] = useState(false);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [showBlockPicker, setShowBlockPicker] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      content: getDefaultContent(type),
    };
    setBlocks([...blocks, newBlock]);
    setShowBlockPicker(false);
  };

  const getDefaultContent = (type: BlockType): Record<string, unknown> => {
    switch (type) {
      case "hero":
        return {
          title: "Welcome to Our Church",
          subtitle: "Join us for worship",
          buttonText: "Learn More",
          buttonLink: "#",
          backgroundImage: "",
        };
      case "heading":
        return { text: "Section Title", level: "h2" };
      case "text":
        return {
          html: "<p>Enter your content here...</p>",
        };
      case "image":
        return { url: "", alt: "", caption: "" };
      case "video":
        return { url: "", autoplay: false };
      case "events":
        return { limit: 3, showPast: false };
      case "donation":
        return {
          title: "Support Our Ministry",
          buttonText: "Give Now",
          fundId: "",
        };
      case "staff":
        return { showAll: true, limit: 6 };
      case "map":
        return { address: "", zoom: 15 };
      case "columns":
        return { columns: 2, content: [[], []] };
      default:
        return {};
    }
  };

  const updateBlock = (id: string, content: Record<string, unknown>) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    );
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((block) => block.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [
      newBlocks[newIndex],
      newBlocks[index],
    ];
    setBlocks(newBlocks);
  };

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a page title");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/website/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          metaDescription,
          isHomePage,
          isPublished: publish,
          content: JSON.stringify(blocks),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create page");
      }

      toast.success(publish ? "Page published!" : "Page saved as draft");
      router.push("/dashboard/website");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create page"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderBlockEditor = (block: ContentBlock) => {
    switch (block.type) {
      case "hero":
        return (
          <div className="space-y-3">
            <Input
              placeholder="Hero Title"
              value={(block.content.title as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, { ...block.content, title: e.target.value })
              }
            />
            <Input
              placeholder="Subtitle"
              value={(block.content.subtitle as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, {
                  ...block.content,
                  subtitle: e.target.value,
                })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Button Text"
                value={(block.content.buttonText as string) || ""}
                onChange={(e) =>
                  updateBlock(block.id, {
                    ...block.content,
                    buttonText: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Button Link"
                value={(block.content.buttonLink as string) || ""}
                onChange={(e) =>
                  updateBlock(block.id, {
                    ...block.content,
                    buttonLink: e.target.value,
                  })
                }
              />
            </div>
            <Input
              placeholder="Background Image URL"
              value={(block.content.backgroundImage as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, {
                  ...block.content,
                  backgroundImage: e.target.value,
                })
              }
            />
          </div>
        );

      case "heading":
        return (
          <div className="space-y-3">
            <Input
              placeholder="Heading Text"
              value={(block.content.text as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, { ...block.content, text: e.target.value })
              }
            />
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3"
              value={(block.content.level as string) || "h2"}
              onChange={(e) =>
                updateBlock(block.id, { ...block.content, level: e.target.value })
              }
            >
              <option value="h1">Heading 1 (Large)</option>
              <option value="h2">Heading 2 (Medium)</option>
              <option value="h3">Heading 3 (Small)</option>
            </select>
          </div>
        );

      case "text":
        return (
          <Textarea
            placeholder="Enter your text content..."
            rows={4}
            value={(block.content.html as string) || ""}
            onChange={(e) =>
              updateBlock(block.id, { ...block.content, html: e.target.value })
            }
          />
        );

      case "image":
        return (
          <div className="space-y-3">
            <Input
              placeholder="Image URL"
              value={(block.content.url as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, { ...block.content, url: e.target.value })
              }
            />
            <Input
              placeholder="Alt Text"
              value={(block.content.alt as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, { ...block.content, alt: e.target.value })
              }
            />
            <Input
              placeholder="Caption (optional)"
              value={(block.content.caption as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, {
                  ...block.content,
                  caption: e.target.value,
                })
              }
            />
          </div>
        );

      case "video":
        return (
          <div className="space-y-3">
            <Input
              placeholder="YouTube or Vimeo URL"
              value={(block.content.url as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, { ...block.content, url: e.target.value })
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(block.content.autoplay as boolean) || false}
                onChange={(e) =>
                  updateBlock(block.id, {
                    ...block.content,
                    autoplay: e.target.checked,
                  })
                }
              />
              Autoplay video
            </label>
          </div>
        );

      case "events":
        return (
          <div className="space-y-3">
            <div>
              <Label>Number of events to show</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={(block.content.limit as number) || 3}
                onChange={(e) =>
                  updateBlock(block.id, {
                    ...block.content,
                    limit: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(block.content.showPast as boolean) || false}
                onChange={(e) =>
                  updateBlock(block.id, {
                    ...block.content,
                    showPast: e.target.checked,
                  })
                }
              />
              Include past events
            </label>
          </div>
        );

      case "donation":
        return (
          <div className="space-y-3">
            <Input
              placeholder="Section Title"
              value={(block.content.title as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, { ...block.content, title: e.target.value })
              }
            />
            <Input
              placeholder="Button Text"
              value={(block.content.buttonText as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, {
                  ...block.content,
                  buttonText: e.target.value,
                })
              }
            />
          </div>
        );

      case "map":
        return (
          <div className="space-y-3">
            <Input
              placeholder="Church Address"
              value={(block.content.address as string) || ""}
              onChange={(e) =>
                updateBlock(block.id, {
                  ...block.content,
                  address: e.target.value,
                })
              }
            />
            <div>
              <Label>Zoom Level</Label>
              <Input
                type="number"
                min={10}
                max={20}
                value={(block.content.zoom as number) || 15}
                onChange={(e) =>
                  updateBlock(block.id, {
                    ...block.content,
                    zoom: parseInt(e.target.value),
                  })
                }
              />
            </div>
          </div>
        );

      default:
        return (
          <p className="text-muted-foreground text-sm">
            Block configuration coming soon...
          </p>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/website">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Create New Page</h1>
          <p className="text-muted-foreground">
            Build your page with drag-and-drop blocks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={(e) => handleSubmit(e, true)} disabled={loading}>
            <Eye className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Page Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Page Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., About Us"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground mr-1">/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="about-us"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={3}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isHomePage}
                  onChange={(e) => setIsHomePage(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Set as Homepage</span>
              </label>
            </CardContent>
          </Card>

          {/* Block Types */}
          <Card>
            <CardHeader>
              <CardTitle>Content Blocks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blockTypes.map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addBlock(blockType.type)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <blockType.icon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{blockType.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {blockType.description}
                    </p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Page Content Builder */}
        <div className="lg:col-span-2">
          <Card className="min-h-[600px]">
            <CardHeader>
              <CardTitle>Page Content</CardTitle>
            </CardHeader>
            <CardContent>
              {blocks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <Layout className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">Start Building</h3>
                  <p className="text-muted-foreground mb-4">
                    Add content blocks from the panel on the left
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => addBlock("hero")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hero Section
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {blocks.map((block, index) => {
                    const blockConfig = blockTypes.find(
                      (b) => b.type === block.type
                    );
                    const BlockIcon = blockConfig?.icon || FileText;

                    return (
                      <div
                        key={block.id}
                        className="border rounded-lg p-4 bg-muted/20"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                          <BlockIcon className="h-5 w-5 text-primary" />
                          <span className="font-medium flex-1">
                            {blockConfig?.label || "Block"}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveBlock(block.id, "up")}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveBlock(block.id, "down")}
                              disabled={index === blocks.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBlock(block.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {renderBlockEditor(block)}
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowBlockPicker(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Block
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
