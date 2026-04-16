import { Router, Request, Response } from "express";
import { createFromRawJson, CreateJsonOptions } from "../services/jsonDoc";

const router = Router();

// Handle CORS preflight
router.options("/", (req: Request, res: Response) => {
  res
    .setHeader("Access-Control-Allow-Methods", "POST")
    .setHeader("Access-Control-Allow-Headers", "Content-Type")
    .setHeader("Access-Control-Max-Age", "86400")
    .sendStatus(204);
});

// POST /api/public/create - Public CORS-enabled API for creating JSON documents
router.post("/", async (req: Request, res: Response) => {
  const { title, content, ttl, readOnly } = req.body;

  if (!title || !content) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "Missing title or content" },
    });
    return;
  }

  if (typeof title !== "string") {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "title must be a string" },
    });
    return;
  }
  if (content === null || content === undefined) {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "content cannot be null" },
    });
    return;
  }

  const options: CreateJsonOptions = {};

  if (typeof ttl === "number") {
    if (ttl < 60) {
      res.status(400).json({
        success: false,
        error: { code: "BAD_REQUEST", message: "ttl must be at least 60 seconds" },
      });
      return;
    }
    options.ttl = ttl;
  }

  if (typeof readOnly === "boolean") {
    options.readOnly = readOnly;
  }

  const doc = await createFromRawJson(
    title,
    JSON.stringify(content),
    options
  );

  res.json({ success: true, data: { id: doc.id, title, location: `/j/${doc.id}` } });
});

export default router;
