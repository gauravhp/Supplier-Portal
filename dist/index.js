var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default;
var init_vite_config = __esm({
  async "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
      plugins: [
        react(),
        runtimeErrorOverlay(),
        ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
          await import("@replit/vite-plugin-cartographer").then(
            (m) => m.cartographer()
          )
        ] : []
      ],
      resolve: {
        alias: {
          "@": path.resolve(import.meta.dirname, "client", "src"),
          "@shared": path.resolve(import.meta.dirname, "shared"),
          "@assets": path.resolve(import.meta.dirname, "attached_assets")
        }
      },
      root: path.resolve(import.meta.dirname, "client"),
      build: {
        outDir: path.resolve(import.meta.dirname, "public"),
        emptyOutDir: true
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  async "server/vite.ts"() {
    "use strict";
    await init_vite_config();
    viteLogger = createLogger();
  }
});

// server/index.ts
import dotenv from "dotenv";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  suppliers;
  riskCategories;
  currentSupplierId;
  currentRiskCategoryId;
  constructor() {
    this.suppliers = /* @__PURE__ */ new Map();
    this.riskCategories = /* @__PURE__ */ new Map();
    this.currentSupplierId = 1;
    this.currentRiskCategoryId = 1;
  }
  async initialize() {
    const suppliersData = [
      {
        name: "MediTech Solutions",
        riskScore: 8.5,
        industry: "Healthcare",
        location: "Boston, USA",
        categories: ["Data Security", "Regulatory"]
      },
      {
        name: "Global Logistics Co.",
        riskScore: 5.3,
        industry: "Transportation",
        location: "Singapore",
        categories: ["Supply Chain", "Environmental"]
      },
      {
        name: "TechNova Inc.",
        riskScore: 9.1,
        industry: "Technology",
        location: "San Francisco, USA",
        categories: ["Financial Compliance", "Data Security", "Legal"]
      },
      {
        name: "EcoFarm Produce",
        riskScore: 3.2,
        industry: "Agriculture",
        location: "Melbourne, Australia",
        categories: ["Environmental", "Supply Chain"]
      },
      {
        name: "ChemCorp Industries",
        riskScore: 7.8,
        industry: "Manufacturing",
        location: "Hamburg, Germany",
        categories: ["Environmental", "Operational"]
      },
      {
        name: "FinSecure Partners",
        riskScore: 6.7,
        industry: "Financial Services",
        location: "London, UK",
        categories: ["Financial Compliance", "Data Security"]
      },
      {
        name: "MicroElectronics Ltd",
        riskScore: 4.9,
        industry: "Electronics",
        location: "Taipei, Taiwan",
        categories: ["Supply Chain", "Regulatory"]
      },
      {
        name: "PharmaGen Research",
        riskScore: 7.2,
        industry: "Healthcare",
        location: "Basel, Switzerland",
        categories: ["Regulatory", "Legal", "Data Security"]
      },
      {
        name: "AutoParts Alliance",
        riskScore: 5.8,
        industry: "Automotive",
        location: "Detroit, USA",
        categories: ["Operational", "Supply Chain"]
      },
      {
        name: "EnergySystems Global",
        riskScore: 6.4,
        industry: "Energy",
        location: "Houston, USA",
        categories: ["Environmental", "Regulatory", "Operational"]
      }
    ];
    for (const supplierData of suppliersData) {
      await this.createSupplier(
        {
          name: supplierData.name,
          riskScore: supplierData.riskScore,
          industry: supplierData.industry,
          location: supplierData.location
        },
        supplierData.categories
      );
    }
  }
  async getSuppliers() {
    const result = [];
    for (const supplier of this.suppliers.values()) {
      const supplierRiskCategories = this.riskCategories.get(supplier.id) || [];
      result.push({
        ...supplier,
        riskCategories: supplierRiskCategories.map((rc) => rc.category)
      });
    }
    return result;
  }
  async getSupplierById(id) {
    const supplier = this.suppliers.get(id);
    if (!supplier) return void 0;
    const supplierRiskCategories = this.riskCategories.get(id) || [];
    return {
      ...supplier,
      riskCategories: supplierRiskCategories.map((rc) => rc.category)
    };
  }
  async searchSuppliers(query) {
    let result = await this.getSuppliers();
    if (query.type === "highestRisk") {
      result.sort((a, b) => b.riskScore - a.riskScore);
      if (query.limit) {
        result = result.slice(0, query.limit);
      }
    } else if (query.type === "industry" && query.industry) {
      result = result.filter(
        (s) => s.industry.toLowerCase() === query.industry?.toLowerCase()
      );
    } else if (query.type === "riskCategory" && query.riskCategory) {
      result = result.filter(
        (s) => s.riskCategories.some(
          (cat) => cat.toLowerCase() === query.riskCategory?.toLowerCase()
        )
      );
    }
    return result;
  }
  async createSupplier(supplier, categories) {
    const id = this.currentSupplierId++;
    const newSupplier = { ...supplier, id };
    this.suppliers.set(id, newSupplier);
    const supplierCategories = [];
    for (const category of categories) {
      const categoryId = this.currentRiskCategoryId++;
      const newCategory = {
        id: categoryId,
        supplierId: id,
        category
      };
      supplierCategories.push(newCategory);
    }
    this.riskCategories.set(id, supplierCategories);
    return {
      ...newSupplier,
      riskCategories: categories
    };
  }
};
var storage = new MemStorage();

// server/routes.ts
import { z } from "zod";
import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
var groq = createGroq({
  apiKey: process.env.GROQ_API_KEY
});
var searchSuppliersToolSchema = z.object({
  type: z.enum(["highestRisk", "industry", "riskCategory", "all"]).describe("The type of search to perform."),
  limit: z.number().optional().describe("Maximum number of suppliers to return (for highestRisk)."),
  industry: z.string().optional().describe("Filter suppliers by industry."),
  riskCategory: z.string().optional().describe("Filter suppliers by risk category.")
});
async function registerRoutes(app2) {
  await storage.initialize();
  app2.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
  app2.get("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid supplier ID" });
      }
      const supplier = await storage.getSupplierById(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });
  app2.post("/api/suppliers/search", async (req, res) => {
    try {
      const searchQuerySchema = z.object({
        type: z.enum(["highestRisk", "industry", "riskCategory", "all"]),
        limit: z.number().optional(),
        industry: z.string().optional(),
        riskCategory: z.string().optional()
      });
      const validationResult = searchQuerySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid search query",
          errors: validationResult.error.errors
        });
      }
      const searchQuery = validationResult.data;
      const results = await storage.searchSuppliers(searchQuery);
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search suppliers" });
    }
  });
  app2.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      console.log("messages", messages);
      const lastMessageContent = messages[messages.length - 1].content;
      const prompt = typeof lastMessageContent === "string" ? lastMessageContent : JSON.stringify(lastMessageContent);
      console.log("prompt", prompt);
      const result = streamText({
        model: groq("llama3-8b-8192"),
        maxTokens: 2e3,
        prompt,
        system: "You are a helpful assistant designed to help users query supplier risk data. When asked about suppliers, use the searchSuppliers tool to find relevant information before answering. You do not answer any questions that are not related to supplier risk data.",
        tools: {
          searchSuppliers: {
            description: "Search for suppliers based on criteria like highest risk, industry, or risk category.",
            parameters: searchSuppliersToolSchema,
            execute: async (args) => {
              try {
                const suppliers = await storage.searchSuppliers(args);
                if (suppliers.length === 0) {
                  return "No suppliers found matching the criteria.";
                }
                const formattedResults = suppliers.map((s) => `- ${s.name}`).join("\n");
                return `Found ${suppliers.length} suppliers:
${formattedResults}`;
              } catch (toolError) {
                console.error("Error during searchSuppliers tool execution:", toolError.message);
                return `Error executing supplier search: ${toolError.message}`;
              }
            }
          }
        }
      });
      const response = result.toDataStreamResponse();
      const logResponse = response.clone();
      console.log("logResponse", logResponse);
      const textContent = await logResponse.text();
      const parsedContent = textContent.split("\n").filter((line) => line.startsWith("a:")).map((line) => JSON.parse(line.slice(2)));
      if (parsedContent.length > 0) {
        const toolResult = parsedContent[0].result;
        console.log("Extracted tool result:", toolResult);
        return res.json({ result: toolResult });
      }
      result.pipeDataStreamToResponse(res);
    } catch (error) {
      console.error("Chat API error:", error.message);
      if (!res.headersSent) {
        res.status(500).json({
          message: "Failed to process chat request",
          error: error.message || "Unknown error during streaming"
        });
      }
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/logger.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// server/index.ts
dotenv.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("Unhandled error:", err);
  });
  if (process.env.NODE_ENV === "development") {
    const { setupVite: setupVite2 } = await init_vite().then(() => vite_exports);
    await setupVite2(app, server);
    log("Vite dev server middleware enabled.");
  } else {
    const { serveStatic: serveStatic2 } = await init_vite().then(() => vite_exports);
    serveStatic2(app);
    log("Serving static files from public directory.");
  }
  const port = 5010;
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
