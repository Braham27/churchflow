import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Sparkles, ArrowRight, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What's New - ChurchFlow",
  description: "See the latest updates, features, and improvements to ChurchFlow.",
};

const updates = [
  {
    date: "January 10, 2026",
    version: "2.5.0",
    title: "AI-Powered Message Assistant",
    description: "Create compelling emails and announcements in seconds with our new AI writing assistant. Just describe what you want to say, and let AI do the rest.",
    tags: ["New Feature", "AI"],
    highlights: [
      "Generate newsletters, event announcements, and thank-you messages",
      "Customize tone and style to match your church's voice",
      "Available in Communications and Email modules",
    ],
  },
  {
    date: "January 3, 2026",
    version: "2.4.5",
    title: "Enhanced Check-In Experience",
    description: "We've redesigned the check-in experience to be faster and more intuitive for families and volunteers.",
    tags: ["Improvement"],
    highlights: [
      "New streamlined family check-in flow",
      "Improved kiosk mode with larger touch targets",
      "Better label printing with QR codes",
    ],
  },
  {
    date: "December 20, 2025",
    version: "2.4.0",
    title: "Website Builder 2.0",
    description: "Our completely redesigned website builder with new templates, components, and customization options.",
    tags: ["Major Update"],
    highlights: [
      "15 new church-focused templates",
      "Drag-and-drop component library",
      "Built-in sermon and event widgets",
      "Improved mobile responsiveness",
    ],
  },
  {
    date: "December 10, 2025",
    version: "2.3.8",
    title: "Giving Insights Dashboard",
    description: "New analytics dashboard to understand giving patterns and trends in your congregation.",
    tags: ["New Feature"],
    highlights: [
      "Giving trends over time",
      "Donor retention metrics",
      "Campaign performance tracking",
      "Exportable reports",
    ],
  },
  {
    date: "November 28, 2025",
    version: "2.3.5",
    title: "Volunteer Schedule Improvements",
    description: "Several improvements to make volunteer scheduling easier and more flexible.",
    tags: ["Improvement"],
    highlights: [
      "Bulk schedule creation",
      "Availability conflict detection",
      "Self-service shift swaps with approval workflow",
    ],
  },
  {
    date: "November 15, 2025",
    version: "2.3.0",
    title: "Groups Management Module",
    description: "New module for managing small groups, Bible studies, and ministry teams.",
    tags: ["New Feature"],
    highlights: [
      "Group creation and membership management",
      "Group-specific communication",
      "Attendance tracking per group",
      "Leader assignment and permissions",
    ],
  },
];

export default function UpdatesPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Church className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">ChurchFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/updates" className="text-sm font-medium text-primary">
              Updates
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Start Free Trial</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            What&apos;s New in ChurchFlow
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re constantly improving ChurchFlow to help your church thrive. 
            Check out our latest updates and features.
          </p>
        </div>
      </section>

      {/* Updates Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8">
            {updates.map((update, index) => (
              <Card key={update.version} className={index === 0 ? "border-primary ring-1 ring-primary" : ""}>
                {index === 0 && (
                  <div className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-t-lg">
                    Latest Release
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    {update.date}
                    <span className="text-muted-foreground">•</span>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">v{update.version}</code>
                  </div>
                  <CardTitle className="text-xl">{update.title}</CardTitle>
                  <CardDescription>{update.description}</CardDescription>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {update.tags.map((tag) => (
                      <Badge key={tag} variant={tag === "New Feature" ? "default" : "secondary"}>
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {update.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Have a Feature Request?</h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            We&apos;re always listening to our customers. Let us know what features 
            would help your church the most.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button size="lg" variant="secondary">
                Submit Feedback
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Church className="h-6 w-6 text-primary" />
              <span className="font-bold">ChurchFlow</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/contact" className="hover:text-foreground">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ChurchFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
