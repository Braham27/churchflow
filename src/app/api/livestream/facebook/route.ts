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

interface FacebookVideo {
  id: string;
  title?: string;
  description?: string;
  picture?: string;
  created_time: string;
  status?: {
    video_status: string;
  };
  live_status?: string;
  permalink_url?: string;
  embed_html?: string;
}

interface FacebookApiResponse {
  data: FacebookVideo[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

/**
 * GET /api/livestream/facebook
 * Get Facebook live videos for the church page
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

    // Get church settings for Facebook page
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { settings: true },
    });

    const settings = church?.settings as {
      facebookPageId?: string;
      facebookAccessToken?: string;
    } | null;
    
    const pageId = settings?.facebookPageId;
    const accessToken = settings?.facebookAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
      return NextResponse.json(
        { error: "Facebook page not configured" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // all, live, scheduled

    // Build Facebook API URL
    let facebookUrl = `https://graph.facebook.com/v18.0/${pageId}/live_videos?access_token=${accessToken}&fields=id,title,description,picture,created_time,status,live_status,permalink_url,embed_html`;

    if (type === "live") {
      facebookUrl += "&broadcast_status=LIVE";
    } else if (type === "scheduled") {
      facebookUrl += "&broadcast_status=SCHEDULED_UNPUBLISHED";
    }

    const response = await fetch(facebookUrl);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Facebook API error");
    }

    const data: FacebookApiResponse = await response.json();

    const videos = data.data.map((item) => ({
      id: item.id,
      title: item.title || "Untitled",
      description: item.description || "",
      thumbnail: item.picture,
      createdAt: item.created_time,
      isLive: item.live_status === "LIVE" || item.status?.video_status === "live",
      isScheduled: item.live_status === "SCHEDULED_UNPUBLISHED",
      url: item.permalink_url,
      embedHtml: item.embed_html,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error fetching Facebook videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch Facebook videos" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/livestream/facebook
 * Create a new Facebook live video
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
    const { title, description, plannedStartTime } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get church settings for Facebook
    const church = await prisma.church.findUnique({
      where: { id: churchId },
      select: { settings: true },
    });

    const settings = church?.settings as {
      facebookPageId?: string;
      facebookAccessToken?: string;
    } | null;
    
    const pageId = settings?.facebookPageId;
    const accessToken = settings?.facebookAccessToken;

    if (!pageId || !accessToken) {
      return NextResponse.json(
        { error: "Facebook page not configured. Please connect your Facebook page in settings." },
        { status: 400 }
      );
    }

    // Create live video
    const createUrl = `https://graph.facebook.com/v18.0/${pageId}/live_videos`;
    
    const formData = new URLSearchParams();
    formData.append("access_token", accessToken);
    formData.append("title", title);
    if (description) formData.append("description", description);
    if (plannedStartTime) {
      formData.append("planned_start_time", Math.floor(new Date(plannedStartTime).getTime() / 1000).toString());
      formData.append("status", "SCHEDULED_UNPUBLISHED");
    }

    const response = await fetch(createUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to create live video");
    }

    const liveVideo = await response.json();

    // Log activity
    await prisma.activityLog.create({
      data: {
        churchId,
        userId: session.user.id,
        action: "CREATE",
        entityType: "FacebookLive",
        entityId: liveVideo.id,
        details: { title, plannedStartTime },
      },
    });

    return NextResponse.json(liveVideo, { status: 201 });
  } catch (error) {
    console.error("Error creating Facebook live video:", error);
    return NextResponse.json(
      { error: "Failed to create Facebook live video" },
      { status: 500 }
    );
  }
}
