import { Router, Request, Response } from "express";
import {
  createFromRawJson,
  createFromUrl,
  createFromUrlOrRawJson,
  CreateJsonOptions,
} from "../services/jsonDoc";

const router = Router();

// GET /api/create - Create document from query params (url or base64)
router.get("/", async (req: Request, res: Response) => {
  const jsonUrl = req.query.url as string | null;
  const base64EncodedJson = req.query.j as string | null;
  const ttl = req.query.ttl as string | null;
  const readOnly = req.query.readonly as string | null;
  const title = req.query.title as string | null;
  const injest = req.query.injest as string | null;

  if (!jsonUrl && !base64EncodedJson) {
    res.redirect("/");
    return;
  }

  const options: CreateJsonOptions = {};

  if (ttl) {
    if (!ttl.match(/^\d+$/)) {
      res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "ttl must be a number" },
      });
      return;
    }
    options.ttl = parseInt(ttl, 10);
    if (options.ttl < 60) {
      res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "ttl must be at least 60 seconds" },
      });
      return;
    }
  }

  if (readOnly) {
    options.readOnly = readOnly === "true";
  }

  if (injest) {
    options.injest = injest === "true";
  }

  if (jsonUrl) {
    try {
      const jsonURL = new URL(jsonUrl);
      const doc = await createFromUrl(jsonURL, title ?? jsonURL.href, options);

      res.json({ success: true, data: { id: doc.id, redirect: `/j/${doc.id}` } });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create from URL";
      res.status(400).json({
        success: false,
        error: { code: "CREATE_FAILED", message },
      });
      return;
    }
  }

  if (base64EncodedJson) {
    try {
      const doc = await createFromRawJson(
        title ?? "Untitled",
        atob(base64EncodedJson),
        options
      );

      res.json({ success: true, data: { id: doc.id, redirect: `/j/${doc.id}` } });
      return;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create from base64 data";
      res.status(400).json({
        success: false,
        error: { code: "CREATE_FAILED", message },
      });
      return;
    }
  }
});

// POST /api/create/file - Create document from uploaded file
router.post("/file", async (req: Request, res: Response) => {
  const { filename, rawJson } = req.body;

  const errors: { filename?: boolean; rawJson?: boolean } = {};

  if (!filename) errors.filename = true;
  if (!rawJson) errors.rawJson = true;

  if (Object.keys(errors).length) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Missing required fields", details: errors },
    });
    return;
  }

  try {
    const doc = await createFromRawJson(filename, rawJson);

    res.json({ success: true, data: { id: doc.id, redirect: `/j/${doc.id}` } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid JSON";
    res.status(400).json({
      success: false,
      error: { code: "INVALID_JSON", message: `Failed to parse JSON: ${message}` },
    });
  }
});

// POST /api/create/url - Create document from URL or raw JSON text
router.post("/url", async (req: Request, res: Response) => {
  const { jsonUrl, title } = req.body;

  if (!jsonUrl) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "jsonUrl is required" },
    });
    return;
  }

  try {
    const doc = await createFromUrlOrRawJson(jsonUrl, title);

    if (!doc) {
      res.status(500).json({
        success: false,
        error: { code: "CREATE_FAILED", message: "Could not create document" },
      });
      return;
    }

    res.json({ success: true, data: { id: doc.id, redirect: `/j/${doc.id}` } });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: { code: "CREATE_FAILED", message },
    });
  }
});

export default router;
