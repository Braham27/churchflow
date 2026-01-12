import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Church, Search, Book, MessageCircle, Video, FileText, ArrowRight, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center - ChurchFlow",
  description: "Get help with ChurchFlow. Browse our knowledge base, tutorials, and support resources.",
};

const categories = [
  {
    icon: Book,
    title: "Getting Started",
    description: "Learn the basics of setting up your church account.",
    articles: [
      "Creating your account",
      "Inviting team members",
      "Importing member data",
      "Setting up your first event",
    ],
  },
  {
    icon: FileText,
    title: "Member Management",
    description: "Everything about managing your member database.",
    articles: [
      "Adding and editing members",
      "Managing families",
      "Custom fields and tags",
      "Member import/export",
    ],
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Step-by-step video guides for common tasks.",
    articles: [
      "Platform overview",
      "Setting up online giving",
      "Creating your church website",
      "Volunteer scheduling basics",
    ],
  },
  {
    icon: MessageCircle,
    title: "Communication",
    description: "Learn how to connect with your congregation.",
    articles: [
      "Sending bulk emails",
      "SMS messaging setup",
      "Email templates",
      "AI content assistant",
    ],
  },
];

const popularArticles = [
  { title: "How to import members from a CSV file", views: 1234 },
  { title: "Setting up recurring donations", views: 987 },
  { title: "Creating and managing events", views: 876 },
  { title: "Child check-in system setup", views: 654 },
  { title: "Connecting your custom domain", views: 543 },
  { title: "Understanding user roles and permissions", views: 432 },
];

export default function HelpPage() {
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
            <Link href="/help" className="text-sm font-medium text-primary">
              Help
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

      {/* Hero with Search */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            How can we help you?
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Search our knowledge base or browse categories below.
          </p>
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for articles, tutorials, and more..."
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.title} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <category.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article}>
                      <Link href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
                        {article}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Popular Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article) => (
              <Link
                key={article.title}
                href="#"
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors"
              >
                <span className="font-medium">{article.title}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <Button size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact Support
              </Button>
            </Link>
            <Link href="/webinars">
              <Button size="lg" variant="outline">
                <Video className="mr-2 h-5 w-5" />
                Watch Webinars
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
