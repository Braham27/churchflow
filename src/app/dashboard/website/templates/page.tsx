import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Eye,
  Check,
  Layout,
} from "lucide-react";

const templates = [
  {
    id: "grace",
    name: "Grace",
    category: "Modern",
    description: "A clean, modern template perfect for contemporary churches",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop",
    isActive: true,
    features: ["Sermon archive", "Event calendar", "Online giving"],
  },
  {
    id: "hope",
    name: "Hope",
    category: "Traditional",
    description: "Classic design with elegant typography and imagery",
    image: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=600&h=400&fit=crop",
    isActive: false,
    features: ["Ministries showcase", "Staff directory", "Contact forms"],
  },
  {
    id: "light",
    name: "Light",
    category: "Minimal",
    description: "Minimalist design that puts your content front and center",
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=600&h=400&fit=crop",
    isActive: false,
    features: ["Video backgrounds", "Full-width sections", "Social integration"],
  },
  {
    id: "community",
    name: "Community",
    category: "Modern",
    description: "Focus on fellowship and community engagement",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=600&h=400&fit=crop",
    isActive: false,
    features: ["Groups directory", "Event RSVP", "Member portal"],
  },
  {
    id: "faith",
    name: "Faith",
    category: "Traditional",
    description: "Rich imagery and traditional church aesthetics",
    image: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600&h=400&fit=crop",
    isActive: false,
    features: ["Sermon series", "Bulletin board", "Prayer requests"],
  },
  {
    id: "rise",
    name: "Rise",
    category: "Bold",
    description: "Bold, vibrant design for growing churches",
    image: "https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=600&h=400&fit=crop",
    isActive: false,
    features: ["Live streaming", "Podcast integration", "App promotion"],
  },
];

export default async function WebsiteTemplatesPage() {
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
          <h1 className="text-3xl font-bold">Website Templates</h1>
          <p className="text-muted-foreground">
            Choose from professionally designed templates
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">All</Button>
          <Button variant="ghost" size="sm">Modern</Button>
          <Button variant="ghost" size="sm">Traditional</Button>
          <Button variant="ghost" size="sm">Minimal</Button>
          <Button variant="ghost" size="sm">Bold</Button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              template.isActive ? "ring-2 ring-primary" : ""
            }`}
          >
            {/* Preview Image */}
            <div className="relative h-48 bg-muted">
              <Image
                src={template.image}
                alt={template.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {template.isActive && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <Badge variant="secondary">{template.category}</Badge>
              </div>
            </div>

            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {template.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant={template.isActive ? "secondary" : "default"}
                  className="flex-1"
                  disabled={template.isActive}
                >
                  <Layout className="h-4 w-4 mr-2" />
                  {template.isActive ? "Current Template" : "Use Template"}
                </Button>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
