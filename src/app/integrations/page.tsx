import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Church, ArrowRight, Zap, Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations - ChurchFlow",
  description: "Connect ChurchFlow with the tools you already use. Seamless integrations with popular apps and services.",
};

const integrations = [
  {
    name: "QuickBooks",
    category: "Accounting",
    description: "Sync donations and financial data automatically with QuickBooks for seamless bookkeeping.",
    logo: "https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Mailchimp",
    category: "Email Marketing",
    description: "Keep your Mailchimp lists in sync with your ChurchFlow member database automatically.",
    logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Google Calendar",
    category: "Calendar",
    description: "Sync church events with Google Calendar for easy access across all devices.",
    logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Stripe",
    category: "Payments",
    description: "Accept secure online donations with industry-leading payment processing.",
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Zoom",
    category: "Video Conferencing",
    description: "Schedule and manage virtual meetings and Bible studies directly from ChurchFlow.",
    logo: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Slack",
    category: "Team Communication",
    description: "Get notifications and updates in Slack for your church staff and volunteer teams.",
    logo: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Planning Center",
    category: "Church Management",
    description: "Import data from Planning Center to make your migration seamless.",
    logo: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "YouTube",
    category: "Live Streaming",
    description: "Embed live streams and automatically archive sermons from YouTube.",
    logo: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Facebook",
    category: "Social Media",
    description: "Stream services and share events directly to your Facebook page.",
    logo: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Zapier",
    category: "Automation",
    description: "Connect ChurchFlow to 5,000+ apps with Zapier automation workflows.",
    logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Twilio",
    category: "SMS",
    description: "Send text messages to members and volunteers through Twilio integration.",
    logo: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=100&h=100&fit=crop",
    status: "available",
  },
  {
    name: "Microsoft 365",
    category: "Productivity",
    description: "Sync calendars and contacts with Microsoft 365 for seamless productivity.",
    logo: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=100&h=100&fit=crop",
    status: "coming-soon",
  },
];

export default function IntegrationsPage() {
  const available = integrations.filter(i => i.status === "available");
  const comingSoon = integrations.filter(i => i.status === "coming-soon");

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
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary">
              Contact
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
              <Zap className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Connect Your Favorite Tools
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            ChurchFlow integrates seamlessly with the apps and services you already use. 
            Automate workflows, sync data, and save time.
          </p>
        </div>
      </section>

      {/* Available Integrations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Available Integrations</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {available.map((integration) => (
              <div
                key={integration.name}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <span className="text-xl font-bold text-primary">{integration.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{integration.name}</h3>
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xs text-primary">{integration.category}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{integration.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      {comingSoon.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Coming Soon</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {comingSoon.map((integration) => (
                <div
                  key={integration.name}
                  className="rounded-xl border bg-card p-6 opacity-75"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">{integration.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{integration.name}</h3>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">Coming Soon</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{integration.category}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{integration.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* API Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Build Custom Integrations</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Need something custom? Our REST API gives you full access to ChurchFlow data 
            so you can build exactly what your church needs.
          </p>
          <Link href="/api">
            <Button size="lg">
              View API Documentation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
