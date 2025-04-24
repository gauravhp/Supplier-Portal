import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// Remove the direct import of setupVite and serveStatic from ./vite
// import { setupVite, serveStatic, log } from "./vite";
import { log } from "./logger"; // Import log from the new logger file

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // It's generally better practice to log the error on the server
    // instead of re-throwing it after sending a response.
    console.error("Unhandled error:", err);
    // throw err; // Avoid throwing after response sent
  });

  // Conditionally setup Vite or serve static files based on NODE_ENV
  if (process.env.NODE_ENV === "development") {
    // Dynamically import setupVite only in development
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
    log("Vite dev server middleware enabled.");
  } else {
    // Dynamically import serveStatic only in production
    const { serveStatic } = await import("./vite");
    serveStatic(app);
    log("Serving static files from public directory.");
  }

  // ALWAYS serve the app on port 5010
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5010;
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();