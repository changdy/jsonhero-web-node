import { Router, Request, Response } from "express";
import { getUriPreview } from "../services/uriPreview";

const router = Router();

// GET /api/preview/*url - Get URI preview
router.get("/*", async (req: Request, res: Response) => {
  try {
    const encoded = req.params[0];
    if (!encoded) {
      res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "Missing URL parameter" },
      });
      return;
    }

    const decoded = decodeURIComponent(encoded);

    const earlyReturn = earlyRespondIfHomepagePreviewUri(decoded);

    if (earlyReturn) {
      res
        .setHeader("Content-Type", "application/json; charset=utf-8")
        .setHeader("Cache-Control", "public, max-age=3600")
        .json({ success: true, data: earlyReturn });
      return;
    }

    const result = await getUriPreview(decoded);

    res
      .setHeader("Content-Type", "application/json; charset=utf-8")
      .setHeader("Cache-Control", "public, max-age=3600")
      .json({ success: true, data: result });
  } catch {
    res
      .status(500)
      .setHeader("Content-Type", "application/json; charset=utf-8")
      .setHeader("Cache-Control", "public, max-age=3600")
      .json({ success: false, error: { code: "PREVIEW_ERROR", message: "Unable to preview this URL" } });
  }
});

function earlyRespondIfHomepagePreviewUri(uri: string) {
  if (uri === "https://www.theonion.com/") {
    return {
      url: "https://www.theonion.com/",
      domain: "theonion.com",
      lastUpdated: "2022-08-09T08:04:27.002858Z",
      nextUpdate: "2022-08-10T08:04:24.888459Z",
      contentType: "html",
      mimeType: "text/html",
      size: 67994,
      redirected: false,
      title: "The Onion | America's Finest News Source.",
      description:
        "The Onion brings you all of the latest news, stories, photos, videos and more from America's finest news source. ",
      name: "THEONION.COM",
      trackersDetected: false,
      icon: {
        url: "https://cdn.peekalink.io/public/images/d9062cab-500b-4677-bd51-b08dae409d3b/b2dd179e-c3b3-4635-ba66-654835ada7b8.jpg",
        width: 200,
        height: 200,
      },
      image: {
        url: "https://cdn.peekalink.io/public/images/d9062cab-500b-4677-bd51-b08dae409d3b/b2dd179e-c3b3-4635-ba66-654835ada7b8.jpg",
        width: 200,
        height: 200,
      },
    };
  }

  if (uri === "https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
    return {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      domain: "youtube.com",
      lastUpdated: "2022-08-09T08:04:28.028029Z",
      nextUpdate: "2022-08-10T08:04:27.764732Z",
      contentType: "html",
      mimeType: "text/html",
      size: 499047,
      redirected: true,
      redirectionUrl: "https://www.youtube.com/watch?ucbcb=1&v=dQw4w9WgXcQ",
      redirectionCount: 2,
      redirectionTrail: [
        "https://consent.youtube.com/m?continue=https://www.youtube.com/watch?v=dQw4w9WgXcQ&gl=NL&hl=nl&m=0&pc=yt&src=1&uxe=23983172",
        "https://www.youtube.com/watch?ucbcb=1&v=dQw4w9WgXcQ",
      ],
      title: "Rick Astley - Never Gonna Give You Up (Video)",
      description:
        "Rick Astley's official music video for \"Never Gonna Give You Up\" \nListen to..",
      name: "RickAstleyVEVO",
      trackersDetected: true,
      icon: {
        url: "https://cdn.peekalink.io/public/images/66282716-f48d-40a9-933c-1d174f5a3180/a4696ad6-4a09-4ae0-b03d-2abb41323422.jpg",
        width: 48,
        height: 48,
      },
      image: {
        url: "https://cdn.peekalink.io/public/images/0e1781f8-75dd-4930-91f5-e5c6a93facfe/efd883f6-3194-45ca-893a-cdec077c7de9.jpe",
        width: 480,
        height: 360,
      },
    };
  }
}

export default router;
