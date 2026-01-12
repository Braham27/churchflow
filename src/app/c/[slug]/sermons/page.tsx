import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, Calendar, Clock, ChevronRight } from "lucide-react";

async function getChurch(slug: string) {
  return prisma.church.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      logo: true,
    },
  });
}

// Mock sermon data - in production this would come from the database
const mockSermons = [
  {
    id: "1",
    title: "Walking in Faith",
    speaker: "Pastor John Smith",
    date: new Date("2024-01-21"),
    duration: "45 min",
    thumbnail: null,
    videoUrl: "#",
    series: "Faith Foundations",
  },
  {
    id: "2",
    title: "The Power of Prayer",
    speaker: "Pastor John Smith",
    date: new Date("2024-01-14"),
    duration: "42 min",
    thumbnail: null,
    videoUrl: "#",
    series: "Faith Foundations",
  },
  {
    id: "3",
    title: "Finding Hope in Hard Times",
    speaker: "Pastor Sarah Johnson",
    date: new Date("2024-01-07"),
    duration: "38 min",
    thumbnail: null,
    videoUrl: "#",
    series: "Hope Series",
  },
  {
    id: "4",
    title: "Living with Purpose",
    speaker: "Pastor John Smith",
    date: new Date("2023-12-31"),
    duration: "40 min",
    thumbnail: null,
    videoUrl: "#",
    series: "New Year, New Life",
  },
  {
    id: "5",
    title: "The Gift of Grace",
    speaker: "Pastor Sarah Johnson",
    date: new Date("2023-12-24"),
    duration: "35 min",
    thumbnail: null,
    videoUrl: "#",
    series: "Christmas",
  },
  {
    id: "6",
    title: "Joy to the World",
    speaker: "Pastor John Smith",
    date: new Date("2023-12-17"),
    duration: "44 min",
    thumbnail: null,
    videoUrl: "#",
    series: "Christmas",
  },
];

export default async function SermonsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const church = await getChurch(slug);

  if (!church) {
    notFound();
  }

  // Group sermons by series
  const sermonsBySeries = mockSermons.reduce(
    (acc, sermon) => {
      if (!acc[sermon.series]) {
        acc[sermon.series] = [];
      }
      acc[sermon.series].push(sermon);
      return acc;
    },
    {} as Record<string, typeof mockSermons>
  );

  const featuredSermon = mockSermons[0];

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
                href={`/c/${slug}/sermons`}
                className="text-sm font-medium text-primary"
              >
                Sermons
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
                className="text-sm hover:text-primary transition-colors"
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
          <h1 className="text-4xl font-bold mb-4">Sermons</h1>
          <p className="text-xl opacity-90">
            Watch or listen to messages from our church
          </p>
        </div>
      </section>

      {/* Featured Sermon */}
      {featuredSermon && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Latest Message</h2>
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <PlayCircle className="h-12 w-12 text-white" />
                  </button>
                </div>
              </div>
              <div>
                <span className="text-sm text-primary font-medium">
                  {featuredSermon.series}
                </span>
                <h3 className="text-3xl font-bold mt-2 mb-4">
                  {featuredSermon.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-4">
                  {featuredSermon.speaker}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {featuredSermon.date.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredSermon.duration}
                  </span>
                </div>
                <Button size="lg">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Now
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sermon Series */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Browse by Series</h2>

          <div className="space-y-12">
            {Object.entries(sermonsBySeries).map(([series, sermons]) => (
              <div key={series}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{series}</h3>
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sermons.map((sermon) => (
                    <Card
                      key={sermon.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <div className="aspect-video bg-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {sermon.duration}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-1 line-clamp-2">
                          {sermon.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {sermon.speaker}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {sermon.date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Message</h2>
          <p className="text-lg opacity-90 mb-8">
            Subscribe to our YouTube channel or podcast to get notified when new
            sermons are available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Subscribe on YouTube
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Listen on Podcast
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">{church.name}</h3>
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
