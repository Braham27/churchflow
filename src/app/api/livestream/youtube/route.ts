import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to get church ID for current user
async function getChurchId(userId: string): Promise<string | null> {
  const churchUser = await prisma.churchUser.findFirst({
    where: { userId },
    select: { churchId: true },
  });
  return churchUser?.churchId ?? null;
}

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    publishedAt: string;
    liveBroadcastContent: string;
  };
  liveStreamingDetails?: {
    actualStartTime?: string;
    actualEndTime?: string;
    scheduledStartTime?: string;
    concurrentViewers?: string;
  };
}

interface YouTubeApiResponse {
  items: YouTubeVideo[];
  nextPageToken?: string;
}

/**
 * GET /api/livestream/youtube
 * Get YouTube live streams and videos for the church
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Get church settings for YouTube channel
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { settings: true },
    });

    const settings = church?.settings as { youtubeChannelId?: string; youtubeApiKey?: string } | null;
    const channelId = settings?.youtubeChannelId;
    const apiKey = settings?.youtubeApiKey || process.env.YOUTUBE_API_KEY;

    if (!channelId || !apiKey) {
      return NextResponse.json(
        { error: "YouTube channel not configured" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // all, live, upcoming, completed

    // Build YouTube API URL
    let youtubeUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&type=video&maxResults=20`;

    if (type === "live") {
      youtubeUrl += "&eventType=live";
    } else if (type === "upcoming") {
      youtubeUrl += "&eventType=upcoming";
    } else if (type === "completed") {
      youtubeUrl += "&eventType=completed";
    }

    const response = await fetch(youtubeUrl);
    if (!response.ok) {
      throw new Error("YouTube API error");
    }

    const data: YouTubeApiResponse = await response.json();

    // Get additional details for live streams
    const videoIds = data.items.map((item) => item.id).join(",");
    if (videoIds) {
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=snippet,liveStreamingDetails`;
      const detailsResponse = await fetch(detailsUrl);
      if (detailsResponse.ok) {
        const detailsData: YouTubeApiResponse = await detailsResponse.json();
        // Merge details
        for (const video of data.items) {
          const details = detailsData.items.find((d) => d.id === video.id);
          if (details) {
            video.liveStreamingDetails = details.liveStreamingDetails;
          }
        }
      }
    }

    const videos = data.items.map((item) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url,
      publishedAt: item.snippet.publishedAt,
      isLive: item.snippet.liveBroadcastContent === "live",
      isUpcoming: item.snippet.liveBroadcastContent === "upcoming",
      liveDetails: item.liveStreamingDetails,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      embedUrl: `https://www.youtube.com/embed/${item.id}`,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube videos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/livestream/youtube
 * Create a new YouTube live broadcast (requires OAuth)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, scheduledStartTime, privacyStatus = "public" } = body;

    if (!title || !scheduledStartTime) {
      return NextResponse.json(
        { error: "Title and scheduled start time are required" },
        { status: 400 }
      );
    }

    // Get church settings for YouTube OAuth token
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { settings: true },
    });

    const settings = church?.settings as { youtubeAccessToken?: string } | null;
    const accessToken = settings?.youtubeAccessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "YouTube OAuth not configured. Please connect your YouTube account in settings." },
        { status: 400 }
      );
    }

    // Create broadcast
    const broadcastResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            title,
            description,
            scheduledStartTime,
          },
          status: {
            privacyStatus,
            selfDeclaredMadeForKids: false,
          },
          contentDetails: {
            enableAutoStart: true,
            enableAutoStop: true,
            recordFromStart: true,
            enableDvr: true,
          },
        }),
      }
    );

    if (!broadcastResponse.ok) {
      const error = await broadcastResponse.json();
      throw new Error(error.error?.message || "Failed to create broadcast");
    }

    const broadcast = await broadcastResponse.json();

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "YouTubeBroadcast",
        entityId: broadcast.id,
        details: { title, scheduledStartTime },
      },
    });

    return NextResponse.json(broadcast, { status: 201 });
  } catch (error) {
    console.error("Error creating YouTube broadcast:", error);
    return NextResponse.json(
      { error: "Failed to create YouTube broadcast" },
      { status: 500 }
    );
  }
}
