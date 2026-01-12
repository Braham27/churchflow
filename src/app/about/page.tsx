import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Church, ArrowRight, Heart, Users, Target, Lightbulb } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - ChurchFlow",
  description: "Learn about ChurchFlow's mission to empower churches with modern technology for better ministry.",
};

const values = [
  {
    icon: Heart,
    title: "Ministry First",
    description: "We believe technology should serve the church, not the other way around. Every feature we build is designed to free up time for what matters most—ministry.",
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "Churches are communities. Our platform helps strengthen those bonds by making it easier to connect, communicate, and care for every member.",
  },
  {
    icon: Target,
    title: "Purpose Driven",
    description: "We're not just building software—we're helping churches fulfill their mission. Your success in ministry is our success.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Innovation",
    description: "The world is changing, and churches need modern tools. We're constantly improving and adding features to meet evolving needs.",
  },
];

const team = [
  {
    name: "Michael Roberts",
    role: "Founder & CEO",
    bio: "Former pastor with 15 years of ministry experience. Founded ChurchFlow to solve problems he faced firsthand.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Sarah Chen",
    role: "Chief Technology Officer",
    bio: "Former tech lead at a Fortune 500 company. Passionate about using technology to serve faith communities.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "David Williams",
    role: "Head of Product",
    bio: "Product manager who grew up in a pastor's family. Understands the unique needs of church administration.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Emily Thompson",
    role: "Customer Success Lead",
    bio: "Former church administrator with a heart for helping ministry teams succeed with technology.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
  },
];

const stats = [
  { value: "1,000+", label: "Churches" },
  { value: "500K+", label: "Members Managed" },
  { value: "$50M+", label: "Donations Processed" },
  { value: "99.9%", label: "Uptime" },
];

export default function AboutPage() {
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
            <Link href="/about" className="text-sm font-medium text-primary">
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
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Empowering Churches with Technology
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              We&apos;re a team of developers, designers, and ministry leaders united by a 
              common mission: helping churches thrive through better technology. We understand 
              the unique challenges churches face because we&apos;ve been there ourselves.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p>
                Churches today face a unique set of challenges. Between managing members, 
                coordinating volunteers, tracking donations, planning events, and maintaining 
                communication—there&apos;s a lot to juggle. Too often, these administrative burdens 
                distract from the core mission: ministering to people.
              </p>
              <p>
                ChurchFlow was born from a simple idea: what if there was one platform that 
                could handle all of these needs? A system built specifically for churches, by 
                people who understand ministry?
              </p>
              <p>
                Our mission is to provide churches with modern, intuitive tools that simplify 
                administration and amplify ministry impact. We believe every church—regardless 
                of size or budget—deserves access to professional-grade management tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="bg-card rounded-xl border p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Meet Our Team</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              We&apos;re a diverse team with backgrounds in ministry, technology, and design—
              all passionate about serving churches.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary">{member.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Join Our Growing Community
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Experience the difference ChurchFlow can make for your ministry.
          </p>
          <div className="mt-10">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Start Free Trial
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
