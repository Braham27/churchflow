import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Palette,
  Check,
  Eye,
} from "lucide-react";

const themes = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and contemporary design with bold typography",
    colors: ["#3B82F6", "#1E40AF", "#DBEAFE"],
    isActive: true,
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional and elegant church aesthetic",
    colors: ["#7C3AED", "#4C1D95", "#EDE9FE"],
    isActive: false,
  },
  {
    id: "warm",
    name: "Warm",
    description: "Inviting earth tones for a welcoming feel",
    colors: ["#D97706", "#92400E", "#FEF3C7"],
    isActive: false,
  },
  {
    id: "nature",
    name: "Nature",
    description: "Fresh green palette inspired by growth",
    colors: ["#059669", "#047857", "#D1FAE5"],
    isActive: false,
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Sleek dark theme for modern audiences",
    colors: ["#1F2937", "#111827", "#F3F4F6"],
    isActive: false,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple black and white for maximum clarity",
    colors: ["#000000", "#374151", "#F9FAFB"],
    isActive: false,
  },
];

export default async function WebsiteThemePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

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
          <h1 className="text-3xl font-bold">Website Theme</h1>
          <p className="text-muted-foreground">
            Choose a theme that matches your church&apos;s style
          </p>
        </div>
        <Link href="/dashboard/website/settings">
          <Button variant="outline">
            <Palette className="h-4 w-4 mr-2" />
            Customize Colors
          </Button>
        </Link>
      </div>

      {/* Themes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <Card 
            key={theme.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              theme.isActive ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{theme.name}</CardTitle>
                {theme.isActive && (
                  <Badge variant="secondary">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
              <CardDescription>{theme.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Preview */}
              <div className="h-24 rounded-lg overflow-hidden border">
                <div 
                  className="h-1/2 flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: theme.colors[0] }}
                >
                  Header
                </div>
                <div 
                  className="h-1/2 flex items-center justify-center text-sm"
                  style={{ backgroundColor: theme.colors[2], color: theme.colors[1] }}
                >
                  Content Area
                </div>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center gap-2">
                {theme.colors.map((color, index) => (
                  <div
                    key={index}
                    className="h-8 w-8 rounded-full border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant={theme.isActive ? "secondary" : "default"}
                  className="flex-1"
                  disabled={theme.isActive}
                >
                  {theme.isActive ? "Current Theme" : "Apply Theme"}
                </Button>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Theme */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Create Custom Theme</CardTitle>
          <CardDescription>
            Design your own theme with custom colors and fonts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <Palette className="h-4 w-4 mr-2" />
            Create Custom Theme
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
