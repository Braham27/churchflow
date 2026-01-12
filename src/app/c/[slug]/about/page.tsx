import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Users,
  Heart,
  BookOpen,
  ChevronRight,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

async function getChurch(slug: string) {
  return prisma.church.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      events: {
        where: {
          startDate: { gte: new Date() },
          isPublic: true,
        },
        orderBy: { startDate: "asc" },
        take: 3,
      },
    },
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function ChurchAboutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const church = await getChurch(resolvedParams.slug);

  if (!church) {
    notFound();
  }

  // Default primary color - could be stored in church.settings in the future
  const primaryColor = "#0ea5e9";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href={`/c/${church.slug}`} className="font-bold text-xl">
              {church.name}
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/c/${church.slug}`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href={`/c/${church.slug}/about`}
                className="text-sm font-medium text-primary"
              >
                About
              </Link>
              <Link
                href={`/c/${church.slug}/events`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Events
              </Link>
              <Link
                href={`/c/${church.slug}/give`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Give
              </Link>
              <Link
                href={`/c/${church.slug}/visit`}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Plan Your Visit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="py-20 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Learn more about our church family, our beliefs, and our mission
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Our Story */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground">
                  {church.name} is a vibrant community of believers dedicated to
                  loving God and loving people. We believe that church should be
                  a place where everyone feels welcome, valued, and empowered to
                  grow in their faith.
                </p>
                <p className="text-muted-foreground">
                  Our church was founded with a simple mission: to make
                  disciples who make disciples. We do this through dynamic
                  worship, relevant teaching, authentic community, and
                  compassionate outreach.
                </p>
                <p className="text-muted-foreground">
                  Whether you&apos;re exploring faith for the first time or
                  looking for a church to call home, we invite you to join us on
                  this journey.
                </p>
              </div>
            </section>

            {/* Our Beliefs */}
            <section>
              <h2 className="text-3xl font-bold mb-6">What We Believe</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-6">
                    <BookOpen className="h-8 w-8 mb-3" style={{ color: primaryColor }} />
                    <h3 className="font-semibold text-lg mb-2">The Bible</h3>
                    <p className="text-muted-foreground text-sm">
                      We believe the Bible is the inspired Word of God and is
                      our ultimate authority for faith and practice.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Heart className="h-8 w-8 mb-3" style={{ color: primaryColor }} />
                    <h3 className="font-semibold text-lg mb-2">Salvation</h3>
                    <p className="text-muted-foreground text-sm">
                      We believe that salvation is by grace through faith in
                      Jesus Christ alone.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 mb-3" style={{ color: primaryColor }} />
                    <h3 className="font-semibold text-lg mb-2">Community</h3>
                    <p className="text-muted-foreground text-sm">
                      We believe in the importance of Christian community and
                      doing life together.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Calendar className="h-8 w-8 mb-3" style={{ color: primaryColor }} />
                    <h3 className="font-semibold text-lg mb-2">Mission</h3>
                    <p className="text-muted-foreground text-sm">
                      We are called to share the love of Christ locally and
                      globally.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Leadership */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Our Leadership</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      PS
                    </div>
                    <h3 className="font-semibold text-lg">Pastor Smith</h3>
                    <p className="text-muted-foreground">Lead Pastor</p>
                    <p className="text-sm text-muted-foreground mt-3">
                      Pastor Smith has been leading our congregation for over 10
                      years with a heart for teaching and discipleship.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      MJ
                    </div>
                    <h3 className="font-semibold text-lg">Mary Johnson</h3>
                    <p className="text-muted-foreground">Worship Pastor</p>
                    <p className="text-sm text-muted-foreground mt-3">
                      Mary leads our worship ministry with passion and creates
                      an atmosphere where people can encounter God.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
                <div className="space-y-4">
                  {church.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                      <span className="text-sm">{church.address}</span>
                    </div>
                  )}
                  {church.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={`tel:${church.phone}`}
                        className="text-sm hover:underline"
                      >
                        {church.phone}
                      </a>
                    </div>
                  )}
                  {church.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a
                        href={`mailto:${church.email}`}
                        className="text-sm hover:underline"
                      >
                        {church.email}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Times */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Service Times</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Sunday Service</p>
                      <p className="text-sm text-muted-foreground">
                        9:00 AM & 11:00 AM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Wednesday Bible Study</p>
                      <p className="text-sm text-muted-foreground">7:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card style={{ backgroundColor: primaryColor }} className="text-white">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">Plan Your Visit</h3>
                <p className="text-sm opacity-90 mb-4">
                  We&apos;d love to meet you! Let us know you&apos;re coming.
                </p>
                <Link href={`/c/${church.slug}/visit`}>
                  <Button variant="secondary" className="w-full">
                    I&apos;m New
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-lg mb-2">{church.name}</p>
          {church.address && (
            <p className="text-sm text-muted-foreground">{church.address}</p>
          )}
          <p className="text-sm text-muted-foreground mt-4">
            © {new Date().getFullYear()} {church.name}. Powered by ChurchFlow.
          </p>
        </div>
      </footer>
    </div>
  );
}
