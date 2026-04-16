import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";

import docsRoutes from "./routes/docs";
import createRoutes from "./routes/create";
import previewRoutes from "./routes/preview";
import publicApiRoutes from "./routes/publicApi";

export interface StartJsonHeroOptions {
  port?: number;
}

export function startJsonHero(options?: StartJsonHeroOptions) {
  const app = express();
  const PORT = options?.port ?? (process.env.PORT ? parseInt(process.env.PORT) : 13001);

  // Parse JSON and URL-encoded bodies
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.text());

  // API routes
  app.use("/api/docs", docsRoutes);
  app.use("/api/create", createRoutes);
  app.use("/api/preview", previewRoutes);
  app.use("/api/public/create", publicApiRoutes);

  // Serve frontend static files: when SERVE_FRONTEND=1 (npm start) or embedded in production (Electron)
  if (process.env.SERVE_FRONTEND === "1" || process.env.NODE_ENV === "production") {
    const spaPath = path.join(__dirname, "../public/spa");
    app.use(express.static(spaPath));
    // SPA fallback: serve index.html for all non-API routes
    app.get("*", (req, res) => {
      if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(spaPath, "index.html"));
      } else {
        res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: `API endpoint ${req.path} not found` },
        });
      }
    });
  }

  // Global error handler (must be last middleware)
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`[backend] Server running on http://localhost:${PORT}`);
    console.log(
      `[backend] Environment: ${process.env.NODE_ENV || "development"}`
    );
  });

  return { app, server, port: PORT };
}

// Auto-start in standalone mode (npm start / npm run dev)
// When NODE_ENV=production, the caller (e.g. Electron) starts the server explicitly
if (process.env.NODE_ENV !== "production") {
  startJsonHero();
}
