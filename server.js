// Must be called before any other imports that use web globals (fetch, Headers, etc.)
require("@remix-run/node").installGlobals();

const path = require("path");
const stream = require("stream");
const express = require("express");
const { AbortController, Request, Headers } = require("@remix-run/node");
const { createRequestHandler } = require("@remix-run/server-runtime");

const MODE = process.env.NODE_ENV ?? "development";
const BUILD_DIR = path.join(process.cwd(), "build");

const app = express();

// Serve static assets from public/build with long-lived cache headers
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Serve other static files
app.use(express.static("public", { maxAge: "1h" }));

app.all("*", (req, res, next) => {
  if (MODE !== "production") {
    for (const key in require.cache) {
      if (key.startsWith(BUILD_DIR)) delete require.cache[key];
    }
  }

  const build = require(BUILD_DIR);
  const handleRequest = createRequestHandler(build, {}, MODE);

  const abortController = new AbortController();
  res.on("close", () => abortController.abort());

  const origin = `${req.protocol}://${req.get("host")}`;
  const url = new URL(req.url, origin);

  // Build Remix-compatible Headers from Express request headers
  const remixHeaders = new Headers();
  for (const [key, values] of Object.entries(req.headers)) {
    if (values) {
      if (Array.isArray(values)) {
        for (const value of values) remixHeaders.append(key, value);
      } else {
        remixHeaders.set(key, values);
      }
    }
  }

  const init = {
    method: req.method,
    headers: remixHeaders,
    signal: abortController.signal,
    abortController,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.pipe(new stream.PassThrough({ highWaterMark: 16384 }));
  }

  const remixReq = new Request(url.href, init);

  handleRequest(remixReq, undefined)
    .then((response) => {
      res.statusMessage = response.statusText;
      res.status(response.status);

      for (const [key, values] of Object.entries(response.headers.raw())) {
        for (const value of values) res.append(key, value);
      }

      if (abortController.signal.aborted) {
        res.set("Connection", "close");
      }

      if (!response.body) {
        res.end();
      } else if (Buffer.isBuffer(response.body)) {
        res.end(response.body);
      } else if (typeof response.body.pipe === "function") {
        // Node.js Readable stream
        response.body.pipe(res);
      } else if (typeof response.body.getReader === "function") {
        // Web ReadableStream → convert to Node.js Readable and pipe
        stream.Readable.fromWeb(response.body).pipe(res);
      } else {
        res.end();
      }
    })
    .catch(next);
});

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`);
});
