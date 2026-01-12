import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Code, ArrowRight, Book, Key, Terminal, Webhook, Database, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation - ChurchFlow",
  description: "Integrate with ChurchFlow using our REST API. Build custom integrations and automate workflows.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/members",
    description: "List all members",
  },
  {
    method: "POST",
    path: "/api/v1/members",
    description: "Create a new member",
  },
  {
    method: "GET",
    path: "/api/v1/events",
    description: "List all events",
  },
  {
    method: "POST",
    path: "/api/v1/donations",
    description: "Record a donation",
  },
  {
    method: "GET",
    path: "/api/v1/attendance",
    description: "Get attendance records",
  },
  {
    method: "POST",
    path: "/api/v1/communications",
    description: "Send a message",
  },
];

const features = [
  {
    icon: Key,
    title: "API Keys",
    description: "Generate and manage API keys from your dashboard. Each key can have specific scopes and permissions.",
  },
  {
    icon: Lock,
    title: "OAuth 2.0",
    description: "Secure authentication using industry-standard OAuth 2.0 for third-party integrations.",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Receive real-time notifications when events occur in your ChurchFlow account.",
  },
  {
    icon: Database,
    title: "Rate Limiting",
    description: "Generous rate limits with clear headers. Premium plans get higher limits.",
  },
];

export default function ApiPage() {
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
            <Link href="/api" className="text-sm font-medium text-primary">
              API
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
              <Code className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            ChurchFlow API
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Build powerful integrations with our RESTful API. Access member data, 
            manage events, process donations, and more programmatically.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg">
              <Book className="mr-2 h-5 w-5" />
              View Full Docs
            </Button>
            <Button size="lg" variant="outline">
              <Terminal className="mr-2 h-5 w-5" />
              Try in Playground
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Quick Start</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">1. Get your API Key</h3>
                <p className="text-muted-foreground mb-4">
                  Generate an API key from your dashboard under Settings → API Keys.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Make your first request</h3>
                <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`curl -X GET https://api.churchflow.com/v1/members \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Handle the response</h3>
                <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <pre>{`{
  "data": [
    {
      "id": "mem_123abc",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "membershipStatus": "MEMBER"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "perPage": 20
  }
}`}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">API Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Popular Endpoints</h2>
            <div className="space-y-3">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.path}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
                >
                  <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${
                    endpoint.method === "GET" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="font-mono text-sm flex-1">{endpoint.path}</code>
                  <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button>
                View All Endpoints
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Official SDKs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We provide official SDKs for popular programming languages to make integration even easier.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline">JavaScript/TypeScript</Button>
            <Button variant="outline">Python</Button>
            <Button variant="outline">PHP</Button>
            <Button variant="outline">Ruby</Button>
            <Button variant="outline">Go</Button>
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
