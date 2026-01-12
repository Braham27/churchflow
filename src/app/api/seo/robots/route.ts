import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/seo/robots
 * Generate robots.txt content for a church website
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sitemapUrl = searchParams.get("sitemap");
  const host = searchParams.get("host") || "https://churchflow.app";

  const robotsTxt = `# Robots.txt for ChurchFlow Church Website
# Generated dynamically

User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /dashboard/
Disallow: /auth/
Disallow: /onboarding/

# Disallow private pages
Disallow: /settings/
Disallow: /profile/

# Allow specific public API endpoints
Allow: /api/seo/sitemap
Allow: /api/seo/structured-data

# Crawl-delay (optional, for polite crawling)
Crawl-delay: 1

# Sitemap location
Sitemap: ${sitemapUrl || `${host}/api/seo/sitemap`}

# Specific bot rules
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

# Block AI training bots (optional)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Google-Extended
Disallow: /
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
