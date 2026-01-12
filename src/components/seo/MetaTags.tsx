"use client";

import Head from "next/head";

interface MetaTagsProps {
  title: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogType?: "website" | "article" | "event" | "video.other";
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: "summary" | "summary_large_image" | "player";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: object | object[];
}

/**
 * SEO Meta Tags Component
 * Provides comprehensive meta tags for search engine optimization
 */
export function MetaTags({
  title,
  description,
  keywords,
  canonicalUrl,
  ogType = "website",
  ogImage,
  ogImageAlt,
  twitterCard = "summary_large_image",
  author,
  publishedTime,
  modifiedTime,
  section,
  noIndex = false,
  noFollow = false,
  structuredData,
}: MetaTagsProps) {
  const robotsContent = [
    noIndex ? "noindex" : "index",
    noFollow ? "nofollow" : "follow",
  ].join(", ");

  const structuredDataArray = Array.isArray(structuredData)
    ? structuredData
    : structuredData
    ? [structuredData]
    : [];

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      {section && <meta property="article:section" content={section} />}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {ogImageAlt && <meta name="twitter:image:alt" content={ogImageAlt} />}

      {/* Structured Data / JSON-LD */}
      {structuredDataArray.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  );
}

/**
 * Generate meta tags for a church page
 */
export function generateChurchMetaTags(church: {
  name: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  slug?: string | null;
}) {
  const baseUrl = church.website || `https://churchflow.app/c/${church.slug}`;

  return {
    title: `${church.name} | ChurchFlow`,
    description:
      church.description ||
      `Welcome to ${church.name}. Join us for worship, community, and spiritual growth.`,
    ogImage: church.logo || "/images/og-default.jpg",
    canonicalUrl: baseUrl,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ReligiousOrganization",
      name: church.name,
      description: church.description,
      url: baseUrl,
      logo: church.logo,
    },
  };
}

/**
 * Generate meta tags for an event page
 */
export function generateEventMetaTags(event: {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  startDate: Date;
  endDate?: Date | null;
  location?: string | null;
  churchName: string;
  eventUrl: string;
}) {
  return {
    title: `${event.title} | ${event.churchName}`,
    description:
      event.description ||
      `Join us for ${event.title} at ${event.churchName}`,
    ogType: "event" as const,
    ogImage: event.imageUrl || "/images/event-default.jpg",
    canonicalUrl: event.eventUrl,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString(),
      location: event.location
        ? {
            "@type": "Place",
            name: event.location,
          }
        : undefined,
      organizer: {
        "@type": "Organization",
        name: event.churchName,
      },
    },
  };
}

/**
 * Generate meta tags for a sermon page
 */
export function generateSermonMetaTags(sermon: {
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  speaker?: string | null;
  date: Date;
  churchName: string;
  sermonUrl: string;
  videoUrl?: string | null;
}) {
  return {
    title: `${sermon.title} | ${sermon.churchName} Sermons`,
    description:
      sermon.description ||
      `Watch "${sermon.title}" by ${sermon.speaker} from ${sermon.churchName}`,
    ogType: "video.other" as const,
    ogImage: sermon.thumbnailUrl || "/images/sermon-default.jpg",
    canonicalUrl: sermon.sermonUrl,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: sermon.title,
      description: sermon.description,
      thumbnailUrl: sermon.thumbnailUrl,
      uploadDate: sermon.date.toISOString(),
      contentUrl: sermon.videoUrl,
      author: sermon.speaker
        ? {
            "@type": "Person",
            name: sermon.speaker,
          }
        : undefined,
    },
  };
}

export default MetaTags;
