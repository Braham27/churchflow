import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  ArrowLeft,
  Send,
} from "lucide-react";

async function getChurch(slug: string) {
  return prisma.church.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      postalCode: true,
      phone: true,
      email: true,
      website: true,
      timezone: true,
      logo: true,
    },
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const church = await getChurch(slug);

  if (!church) {
    notFound();
  }

  const fullAddress = [church.address, church.city, church.state, church.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/c/${slug}`} className="flex items-center gap-3">
              {church.logo ? (
                <img
                  src={church.logo}
                  alt={church.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                  {church.name[0]}
                </div>
              )}
              <span className="font-bold text-lg">{church.name}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={`/c/${slug}/about`}
                className="text-sm hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                href={`/c/${slug}/events`}
                className="text-sm hover:text-primary transition-colors"
              >
                Events
              </Link>
              <Link
                href={`/c/${slug}/give`}
                className="text-sm hover:text-primary transition-colors"
              >
                Give
              </Link>
              <Link
                href={`/c/${slug}/contact`}
                className="text-sm font-medium text-primary"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl opacity-90">
            We&apos;d love to hear from you. Reach out anytime!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input placeholder="John" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input placeholder="Doe" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone (optional)</label>
                    <Input type="tel" placeholder="(555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select a topic</option>
                      <option value="general">General Inquiry</option>
                      <option value="visit">Planning a Visit</option>
                      <option value="prayer">Prayer Request</option>
                      <option value="membership">Membership</option>
                      <option value="volunteer">Volunteer Opportunities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="How can we help you?"
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fullAddress && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">{fullAddress}</p>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(
                            fullAddress
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Get Directions →
                        </a>
                      </div>
                    </div>
                  )}

                  {church.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Phone</p>
                        <a
                          href={`tel:${church.phone}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {church.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {church.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href={`mailto:${church.email}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          {church.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {church.website && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Website</p>
                        <a
                          href={church.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          {church.website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Thursday</span>
                      <span className="text-muted-foreground">
                        9:00 AM - 5:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Friday</span>
                      <span className="text-muted-foreground">
                        9:00 AM - 12:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="text-muted-foreground">Closed</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="text-muted-foreground">
                        Services Only
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              {fullAddress && (
                <Card>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Map would be displayed here
                        </p>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(
                            fullAddress
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View on Google Maps
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2">{church.name}</h3>
          {fullAddress && (
            <p className="text-gray-400 mb-4">{fullAddress}</p>
          )}
          <div className="flex justify-center gap-4 mb-6">
            <Link href={`/c/${slug}`} className="text-gray-400 hover:text-white">
              Home
            </Link>
            <Link
              href={`/c/${slug}/about`}
              className="text-gray-400 hover:text-white"
            >
              About
            </Link>
            <Link
              href={`/c/${slug}/events`}
              className="text-gray-400 hover:text-white"
            >
              Events
            </Link>
            <Link
              href={`/c/${slug}/give`}
              className="text-gray-400 hover:text-white"
            >
              Give
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {church.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
