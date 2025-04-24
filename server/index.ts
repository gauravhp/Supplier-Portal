import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { type Request, Response, NextFunction } from "express";
// Add imports for path and fs needed for serving static files in production
import path from 'path';
import fs from 'fs';
import { registerRoutes } from "./routes";
// Remove the direct import of setupVite and serveStatic from ./vite
import { log } from "./logger"; // Import log from the new logger file

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add console log to verify NODE_ENV in Netlify logs
console.log('Server starting with NODE_ENV:', process.env.NODE_ENV);

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
    // This ensures ./vite.ts and its dev dependencies are not bundled in production
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
    log("Vite dev server middleware enabled.");
  } else {
    // In production (when deployed to Render), the backend Web Service
    // only needs to serve the API. The frontend static files will be
    // handled by a separate Render Static Site service.
    log("Production mode: API server only. Static files served by Render Static Site.");
    // --- REMOVE START ---
    /*
    // Serve static files directly in production
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const publicPath = path.resolve(__dirname, "..", "public"); // Adjusted path relative to dist/index.js

    if (!fs.existsSync(publicPath)) {
      log(`Error: Could not find the build directory: ${publicPath}. Make sure the client is built.`);
      // Optionally, you might want to exit or handle this error more gracefully
      process.exit(1);
    } else {
       log(`Serving static files from: ${publicPath}`);
    }

    app.use(express.static(publicPath));

    // Fallback for SPA: serve index.html for any unknown paths
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(publicPath, "index.html"));
    });
    log("Serving static files from public directory.");
    */
    // --- REMOVE END ---
  }

  // ALWAYS serve the app on port 5010
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5010;
  server.listen({
    // Render provides the PORT environment variable for Web Services
    // Use it if available, otherwise default to 5010 for local production testing
    port: process.env.PORT || port,
    host: "0.0.0.0", // Important for Render
  }, () => {
    log(`serving on port ${process.env.PORT || port}`); // Log the actual port being used
  });
})();