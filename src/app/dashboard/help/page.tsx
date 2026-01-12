import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HelpCircle,
  Book,
  MessageCircle,
  Video,
  Mail,
  ExternalLink,
  Search,
  FileQuestion,
  Lightbulb,
  LifeBuoy,
} from "lucide-react";

const helpTopics = [
  {
    title: "Getting Started",
    description: "Learn the basics of ChurchFlow",
    icon: Lightbulb,
    articles: [
      "Setting up your church profile",
      "Adding your first members",
      "Creating events",
      "Setting up online giving",
    ],
  },
  {
    title: "Members & Families",
    description: "Managing your congregation",
    icon: Book,
    articles: [
      "Adding and editing members",
      "Creating family units",
      "Member status and types",
      "Importing members from CSV",
    ],
  },
  {
    title: "Events & Check-In",
    description: "Event management and attendance",
    icon: FileQuestion,
    articles: [
      "Creating recurring events",
      "Using QR code check-in",
      "Child check-in security",
      "Attendance reports",
    ],
  },
  {
    title: "Donations & Giving",
    description: "Financial management",
    icon: Book,
    articles: [
      "Setting up Stripe payments",
      "Creating donation funds",
      "Recurring donations",
      "Year-end giving statements",
    ],
  },
];

const quickLinks = [
  {
    title: "Documentation",
    description: "Comprehensive guides and tutorials",
    icon: Book,
    href: "https://docs.churchflow.com",
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    icon: Video,
    href: "https://youtube.com/churchflow",
  },
  {
    title: "Community Forum",
    description: "Connect with other churches",
    icon: MessageCircle,
    href: "https://community.churchflow.com",
  },
  {
    title: "Contact Support",
    description: "Get help from our team",
    icon: Mail,
    href: "mailto:support@churchflow.com",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h1 className="text-3xl font-bold mb-2">How can we help?</h1>
        <p className="text-muted-foreground">
          Find answers to common questions or contact our support team
        </p>
      </div>

      {/* Search */}
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-background text-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <link.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <h3 className="font-semibold mb-1">{link.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {link.description}
                </p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* Help Topics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Browse by Topic</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {helpTopics.map((topic) => (
            <Card key={topic.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <topic.icon className="h-5 w-5 text-primary" />
                  {topic.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {topic.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.articles.map((article) => (
                    <li key={article}>
                      <a
                        href="#"
                        className="text-sm text-primary hover:underline flex items-center gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {article}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <LifeBuoy className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Need More Help?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Our support team is here to help you get the most out of ChurchFlow.
            Reach out and we&apos;ll respond within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:support@churchflow.com">
              <Button size="lg">
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </Button>
            </a>
            <Button variant="outline" size="lg">
              <MessageCircle className="mr-2 h-5 w-5" />
              Live Chat
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">How do I import my existing members?</h4>
            <p className="text-sm text-muted-foreground">
              Go to Settings &gt; Import Data and upload a CSV file with your
              member information. We support imports from most church management
              systems.
            </p>
          </div>
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">Can I customize the check-in labels?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Navigate to Settings &gt; Check-In to customize your check-in
              labels, including child security codes and parent pickup tags.
            </p>
          </div>
          <div className="border-b pb-4">
            <h4 className="font-medium mb-2">How do I set up online giving?</h4>
            <p className="text-sm text-muted-foreground">
              Go to Settings &gt; Billing &gt; Payment Processing to connect your
              Stripe account and start accepting online donations.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Can multiple users access our account?</h4>
            <p className="text-sm text-muted-foreground">
              Yes! Go to Settings &gt; Team to add users and set their permission
              levels. You can have different roles like Admin, Staff, and
              Volunteer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
