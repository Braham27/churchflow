import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  UserCheck, 
  Globe,
  Play,
  QrCode,
  ArrowRight,
  Check,
  Church,
  Shield,
  Smartphone,
  BarChart,
  Palette,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features - ChurchFlow",
  description: "Discover all the powerful features ChurchFlow offers to help manage and grow your church community.",
};

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Maintain detailed profiles for individuals and families with contact info, demographics, and membership history. Updates are instantly reflected for all authorized users.",
    benefits: [
      "Centralized member database",
      "Family relationship tracking",
      "Membership status management",
      "Custom fields support",
      "Import/export capabilities",
    ],
  },
  {
    icon: Calendar,
    title: "Event Scheduling",
    description: "Plan and manage all church events from one central calendar. Create recurring events, enable online registration, and send automatic reminders.",
    benefits: [
      "Master church calendar",
      "Online event registration",
      "Room & resource booking",
      "Automated reminders",
      "Ministry-specific calendars",
    ],
  },
  {
    icon: CreditCard,
    title: "Online Giving & Finance",
    description: "Provide multiple convenient ways for members to give. Support credit/debit cards, bank transfers, text-to-give, and recurring donations.",
    benefits: [
      "Multiple payment methods",
      "Recurring donations",
      "Fund designation",
      "Automatic receipts",
      "Giving statements",
    ],
  },
  {
    icon: UserCheck,
    title: "Volunteer Management",
    description: "Recruit, organize, and coordinate volunteers effectively. Track availability, schedule shifts, and send reminders automatically.",
    benefits: [
      "Volunteer database",
      "Skill & availability tracking",
      "Shift scheduling",
      "Swap & confirm system",
      "Volunteer appreciation tools",
    ],
  },
  {
    icon: MessageSquare,
    title: "Communication Tools",
    description: "Connect with your congregation through email, SMS, and push notifications. Use AI-powered content assistance for faster message creation.",
    benefits: [
      "Bulk email & SMS",
      "Push notifications",
      "Message templates",
      "AI content assistance",
      "Targeted group messaging",
    ],
  },
  {
    icon: Globe,
    title: "Website Builder",
    description: "Create a beautiful, mobile-friendly church website with our drag-and-drop builder. No coding required. Choose from church-focused templates.",
    benefits: [
      "Drag & drop editor",
      "Church-focused templates",
      "Mobile responsive",
      "Custom domains",
      "SEO optimized",
    ],
  },
  {
    icon: Play,
    title: "Live Streaming",
    description: "Integrate with YouTube and Facebook Live to stream services directly on your website. Include live chat and interactive features.",
    benefits: [
      "YouTube/Facebook integration",
      "Embedded video player",
      "Live chat support",
      "Sermon archives",
      "Viewer analytics",
    ],
  },
  {
    icon: QrCode,
    title: "Smart Check-In",
    description: "Modern attendance tracking with self-service QR codes, kiosk mode for children's ministry, and security tags for pickup.",
    benefits: [
      "QR code check-in",
      "Kiosk mode",
      "Security tags",
      "Attendance reporting",
      "Follow-up automation",
    ],
  },
  {
    icon: BarChart,
    title: "Reports & Analytics",
    description: "Gain insights with comprehensive dashboards on attendance, giving trends, and engagement metrics to help make data-driven decisions.",
    benefits: [
      "Attendance trends",
      "Giving analytics",
      "Member engagement",
      "Custom reports",
      "Data export",
    ],
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Enterprise-grade security with role-based access control, encrypted data, and GDPR compliance to protect sensitive information.",
    benefits: [
      "Role-based access",
      "Data encryption",
      "Audit logs",
      "GDPR compliant",
      "Regular backups",
    ],
  },
  {
    icon: Smartphone,
    title: "Mobile App Ready",
    description: "Members can access the platform from any device. Update information, register for events, and give on-the-go.",
    benefits: [
      "Responsive design",
      "Member self-service",
      "Push notifications",
      "Offline support",
      "Cross-platform",
    ],
  },
  {
    icon: Zap,
    title: "Integrations",
    description: "Connect with the tools you already use. Sync with accounting software, email marketing platforms, and more.",
    benefits: [
      "Accounting sync",
      "Email marketing",
      "Calendar sync",
      "API access",
      "Zapier integration",
    ],
  },
];

export default function FeaturesPage() {
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
            <Link href="/features" className="text-sm font-medium text-primary">
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
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Everything Your Church Needs
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            From member management to online giving, ChurchFlow provides all the tools 
            you need to run your church efficiently. Modular design means you only pay 
            for what you use.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Transform Your Church?
          </h2>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of churches using ChurchFlow. Start your 30-day free trial today.
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
