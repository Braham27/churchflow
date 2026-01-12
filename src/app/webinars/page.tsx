import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Calendar, Clock, Video, ArrowRight, PlayCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webinars - ChurchFlow",
  description: "Free webinars to help you get the most out of ChurchFlow and grow your ministry.",
};

const upcomingWebinars = [
  {
    title: "Getting Started with ChurchFlow",
    description: "A comprehensive introduction to the platform for new users. Learn how to set up your church and get your team onboarded.",
    date: "January 20, 2026",
    time: "2:00 PM EST",
    duration: "60 minutes",
    host: "Emily Thompson",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
  },
  {
    title: "Maximizing Online Giving",
    description: "Strategies and best practices for increasing digital donations at your church.",
    date: "January 27, 2026",
    time: "1:00 PM EST",
    duration: "45 minutes",
    host: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=400&fit=crop",
  },
  {
    title: "Building Your Church Website",
    description: "Learn how to create a beautiful, effective church website using our drag-and-drop builder.",
    date: "February 3, 2026",
    time: "2:00 PM EST",
    duration: "75 minutes",
    host: "David Williams",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
  },
];

const pastWebinars = [
  {
    title: "Volunteer Management Masterclass",
    description: "Everything you need to know about recruiting, scheduling, and retaining volunteers.",
    date: "January 6, 2026",
    duration: "60 minutes",
    views: 1234,
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop",
  },
  {
    title: "Event Planning for Churches",
    description: "From small groups to large conferences, learn to plan events that engage your community.",
    date: "December 16, 2025",
    duration: "45 minutes",
    views: 987,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop",
  },
  {
    title: "Year-End Giving Strategies",
    description: "Maximize end-of-year donations with proven communication and technology strategies.",
    date: "November 25, 2025",
    duration: "50 minutes",
    views: 2345,
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=400&fit=crop",
  },
  {
    title: "Child Check-In Best Practices",
    description: "Keep kids safe while making check-in smooth for families and volunteers.",
    date: "November 11, 2025",
    duration: "40 minutes",
    views: 876,
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=400&fit=crop",
  },
];

export default function WebinarsPage() {
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
            <Link href="/webinars" className="text-sm font-medium text-primary">
              Webinars
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
              <Video className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Free Webinars
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn from our experts with free live webinars and on-demand recordings. 
            Get practical tips to make the most of ChurchFlow and grow your ministry.
          </p>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Upcoming Webinars</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {upcomingWebinars.map((webinar) => (
              <Card key={webinar.title} className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={webinar.image}
                    alt={webinar.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="text-white text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-semibold">{webinar.date}</p>
                      <p>{webinar.time}</p>
                    </div>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{webinar.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{webinar.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {webinar.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {webinar.duration}
                    </div>
                  </div>
                  <p className="mt-2">Hosted by {webinar.host}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    Register Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Past Webinars */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Watch On-Demand</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastWebinars.map((webinar) => (
              <Card key={webinar.title} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative h-36">
                  <Image
                    src={webinar.image}
                    alt={webinar.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    <PlayCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-base line-clamp-2">{webinar.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>{webinar.duration}</span>
                    <span>{webinar.views.toLocaleString()} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Host a Private Training?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Premium and Enterprise customers get access to private training sessions 
            for their team. Contact us to learn more.
          </p>
          <Link href="/contact">
            <Button size="lg">
              Contact Sales
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
