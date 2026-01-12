import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Church,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Clock,
  Users,
  Heart,
} from "lucide-react";

async function getChurch(slug: string) {
  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      pages: {
        where: { isPublished: true, isHomePage: true },
        take: 1,
      },
    },
  });

  return church;
}

async function getUpcomingEvents(churchId: string) {
  return prisma.event.findMany({
    where: {
      churchId,
      isPublic: true,
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
    take: 3,
  });
}

export default async function ChurchPublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const church = await getChurch(params.slug);

  if (!church) {
    notFound();
  }

  const events = await getUpcomingEvents(church.id);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {church.logo ? (
                <img
                  src={church.logo}
                  alt={church.name}
                  className="h-10 w-10 rounded"
                />
              ) : (
                <Church className="h-10 w-10" />
              )}
              <span className="text-xl font-bold">{church.name}</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href={`/c/${params.slug}`} className="hover:underline">
                Home
              </Link>
              <Link href={`/c/${params.slug}/about`} className="hover:underline">
                About
              </Link>
              <Link href={`/c/${params.slug}/events`} className="hover:underline">
                Events
              </Link>
              <Link href={`/c/${params.slug}/sermons`} className="hover:underline">
                Sermons
              </Link>
              <Link href={`/c/${params.slug}/give`}>
                <Button variant="secondary" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  Give
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to {church.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {church.description || "A community of faith and fellowship"}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/c/${params.slug}/about`}>
              <Button size="lg">Learn More</Button>
            </Link>
            <Link href={`/c/${params.slug}/visit`}>
              <Button size="lg" variant="outline">
                Plan Your Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Location Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Location</h3>
                    {church.address && <p>{church.address}</p>}
                    {church.city && church.state && (
                      <p>
                        {church.city}, {church.state} {church.postalCode}
                      </p>
                    )}
                    <Button variant="link" className="p-0 mt-2">
                      Get Directions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Contact</h3>
                    {church.phone && <p>{church.phone}</p>}
                    {church.email && <p>{church.email}</p>}
                    {church.website && (
                      <a
                        href={church.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {church.website}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Times Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg text-primary">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Service Times</h3>
                    <p>Sunday: 9:00 AM & 11:00 AM</p>
                    <p>Wednesday: 7:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">
              Upcoming Events
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-2xl font-bold text-primary">
                          {new Date(event.startDate).getDate()}
                        </p>
                        <p className="text-sm text-muted-foreground uppercase">
                          {new Date(event.startDate).toLocaleString("default", {
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {event.location && ` • ${event.location}`}
                        </p>
                        {event.description && (
                          <p className="text-sm mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={`/c/${params.slug}/events`}>
                <Button variant="outline">View All Events</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            We&apos;d love to have you visit us this Sunday. Everyone is welcome!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/c/${params.slug}/visit`}>
              <Button size="lg" variant="secondary">
                Plan Your Visit
              </Button>
            </Link>
            <Link href={`/c/${params.slug}/connect`}>
              <Button size="lg" variant="outline">
                Get Connected
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {church.logo ? (
                  <img
                    src={church.logo}
                    alt={church.name}
                    className="h-8 w-8 rounded"
                  />
                ) : (
                  <Church className="h-8 w-8 text-primary" />
                )}
                <span className="font-bold">{church.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {church.city && church.state && `${church.city}, ${church.state}`}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={`/c/${params.slug}/about`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/c/${params.slug}/events`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Events
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/c/${params.slug}/sermons`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Sermons
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/c/${params.slug}/groups`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Small Groups
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href={`/c/${params.slug}/visit`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Plan Your Visit
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/c/${params.slug}/give`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Give Online
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/c/${params.slug}/contact`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <address className="not-italic text-sm text-muted-foreground space-y-1">
                {church.address && <p>{church.address}</p>}
                {church.city && church.state && (
                  <p>
                    {church.city}, {church.state} {church.postalCode}
                  </p>
                )}
                {church.phone && <p>{church.phone}</p>}
                {church.email && <p>{church.email}</p>}
              </address>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} {church.name}. All rights reserved.
            </p>
            <p className="mt-2">
              Powered by{" "}
              <Link href="/" className="text-primary hover:underline">
                ChurchFlow
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
