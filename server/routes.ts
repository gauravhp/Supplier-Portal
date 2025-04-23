import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SearchQuery } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize the supplier database with mock data
  await storage.initialize();

  // API endpoint to get all suppliers
  app.get("/api/suppliers", async (req: Request, res: Response) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  // API endpoint to get a supplier by ID
  app.get("/api/suppliers/:id", async (req: Request, res: Response) => {
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

  // API endpoint for searching suppliers
  app.post("/api/suppliers/search", async (req: Request, res: Response) => {
    try {
      const searchQuerySchema = z.object({
        type: z.enum(["highestRisk", "industry", "riskCategory", "all"]),
        limit: z.number().optional(),
        industry: z.string().optional(),
        riskCategory: z.string().optional(),
      });

      const validationResult = searchQuerySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid search query", 
          errors: validationResult.error.errors 
        });
      }

      const searchQuery: SearchQuery = validationResult.data;
      const results = await storage.searchSuppliers(searchQuery);
      
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search suppliers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
