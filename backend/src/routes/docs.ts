import { Router, Request, Response } from "express";
import {
  getDocument,
  deleteDocument,
  updateDocument,
} from "../services/jsonDoc";
import safeFetch from "../utilities/safeFetch";
import { getRandomUserAgent } from "../utilities/getRandomUserAgent";

const router = Router();

// GET /api/docs/:id - Get document with parsed JSON
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const path = req.query.path as string | undefined;
  const minimal = req.query.minimal === "true";

  const doc = await getDocument(id);

  if (!doc) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Document ${id} not found` },
    });
    return;
  }

  if (doc.type === "url") {
    console.log(`Fetching ${doc.url}...`);

    const jsonResponse = await safeFetch(doc.url, {
      headers: { "User-Agent": getRandomUserAgent() },
    });

    if (!jsonResponse.ok) {
      const errorText = await jsonResponse.text();
      res.status(jsonResponse.status).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: `Failed to fetch ${doc.url}. HTTP status: ${jsonResponse.status} (${errorText})`,
        },
      });
      return;
    }

    const json = await jsonResponse.json();
    res.json({ success: true, data: { doc, json, path: normalizePath(path), minimal } });
  } else {
    res.json({
      success: true,
      data: {
        doc,
        json: JSON.parse(doc.contents),
        path: normalizePath(path),
        minimal,
      },
    });
  }
});

// DELETE /api/docs/:id - Delete document
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const document = await getDocument(id);

  if (!document) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: "Document not found" },
    });
    return;
  }

  if (document.readOnly) {
    res.status(403).json({
      success: false,
      error: { code: "READ_ONLY", message: "Document is read-only" },
    });
    return;
  }

  await deleteDocument(id);

  res.json({ success: true, data: { redirect: "/" } });
});

// GET /api/docs/:id/raw - Get raw JSON content
router.get("/:id/raw", async (req: Request, res: Response) => {
  const { id } = req.params;

  const doc = await getDocument(id);

  if (!doc) {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `Document ${id} not found` },
    });
    return;
  }

  if (doc.type === "url") {
    const jsonResponse = await safeFetch(doc.url, {
      headers: { "User-Agent": getRandomUserAgent() },
    });

    if (!jsonResponse.ok) {
      const errorText = await jsonResponse.text();
      res.status(jsonResponse.status).json({
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: `Failed to fetch ${doc.url}. HTTP status: ${jsonResponse.status} (${errorText})`,
        },
      });
      return;
    }

    const json = await jsonResponse.json();
    res.json(json);
  } else {
    res.json(JSON.parse(doc.contents));
  }
});

// POST /api/docs/:id/update - Update document title
router.post("/:id/update", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    res.status(400).json({
      success: false,
      error: { code: "BAD_REQUEST", message: "expected title" },
    });
    return;
  }

  try {
    const document = await updateDocument(id, title);

    if (!document) {
      res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "No document with that slug" },
      });
      return;
    }

    res.json({ success: true, data: document });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message },
    });
  }
});

function normalizePath(path: string | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("$.")) return path;
  return `$.${path}`;
}

export default router;
