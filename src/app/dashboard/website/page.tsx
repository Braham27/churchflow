import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Globe,
  FileText,
  Layout,
  Palette,
  Settings,
  Eye,
  ExternalLink,
  Image,
  Video,
} from "lucide-react";

async function getWebsiteData(churchId: string) {
  const [pages, mediaCount, church] = await Promise.all([
    prisma.webPage.findMany({
      where: { churchId },
      orderBy: [{ isHomepage: "desc" }, { title: "asc" }],
    }),
    prisma.mediaFile.count({
      where: { churchId },
    }),
    prisma.church.findUnique({
      where: { id: churchId },
      select: {
        name: true,
        slug: true,
        website: true,
        logo: true,
        primaryColor: true,
      },
    }),
  ]);

  return { pages, mediaCount, church };
}

async function getChurchData(userId: string) {
  return prisma.churchUser.findFirst({
    where: { userId },
    include: { church: { select: { id: true, slug: true } } },
  });
}

export default async function WebsitePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const churchData = await getChurchData(session.user.id);

  if (!churchData) {
    redirect("/onboarding");
  }

  const data = await getWebsiteData(churchData.churchId);
  const siteUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/c/${churchData.church.slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Website Builder</h1>
          <p className="text-muted-foreground">
            Create and manage your church website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={siteUrl} target="_blank">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview Site
            </Button>
          </Link>
          <Link href="/dashboard/website/pages/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Site Info Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-14 h-14 bg-primary rounded-lg text-primary-foreground">
              <Globe className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{data.church?.name}</h3>
              <code className="text-sm bg-muted px-2 py-1 rounded mt-1 block">
                {siteUrl}
              </code>
              <p className="text-sm text-muted-foreground mt-2">
                {data.pages.length} pages • {data.mediaCount} media files
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/website/settings">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Site Settings
              </Button>
            </Link>
            <Link href={siteUrl} target="_blank">
              <Button size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Site
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/website/pages">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Pages</p>
                <p className="text-sm text-muted-foreground">
                  {data.pages.length} pages
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/website/media">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-400">
                <Image className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Media Library</p>
                <p className="text-sm text-muted-foreground">
                  {data.mediaCount} files
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/website/theme">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-600 dark:text-purple-400">
                <Palette className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Theme & Branding</p>
                <p className="text-sm text-muted-foreground">
                  Customize design
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/website/templates">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg text-orange-600 dark:text-orange-400">
                <Layout className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold">Templates</p>
                <p className="text-sm text-muted-foreground">
                  Pre-built layouts
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Pages List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Website Pages</CardTitle>
          <Link href="/dashboard/website/pages/new">
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Page
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.pages.length > 0 ? (
            <div className="divide-y">
              {data.pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{page.title}</p>
                        {page.isHomepage && (
                          <Badge variant="secondary" className="text-xs">
                            Home
                          </Badge>
                        )}
                        {!page.isPublished && (
                          <Badge variant="outline" className="text-xs">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{page.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`${siteUrl}/${page.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/website/pages/${page.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">No pages yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your church website by creating your first page.
              </p>
              <Link href="/dashboard/website/pages/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Homepage
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Drag & Drop Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create beautiful pages with our intuitive drag-and-drop editor.
              No coding required!
            </p>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Text blocks, images, and videos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Event calendars and forms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Donation buttons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Live stream embeds</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Live Streaming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Embed your YouTube or Facebook live streams directly on your website.
            </p>
            <Link href="/dashboard/website/livestream">
              <Button variant="outline" className="w-full">
                Configure Live Stream
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
