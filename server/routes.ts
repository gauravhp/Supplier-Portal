import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SearchQuery } from "@shared/schema";
import { z } from "zod";
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { CoreMessage } from "ai";

// Define the Groq provider instance (replace with your actual API key)
// Make sure to set the GROQ_API_KEY environment variable
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Define the tool schema for searching suppliers using Zod
const searchSuppliersToolSchema = z.object({
  type: z.enum(["highestRisk", "industry", "riskCategory", "all"]).describe("The type of search to perform."),
  limit: z.number().optional().describe("Maximum number of suppliers to return (for highestRisk)."),
  industry: z.string().optional().describe("Filter suppliers by industry."),
  riskCategory: z.string().optional().describe("Filter suppliers by risk category."),
});

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

  // API endpoint for AI chat using Groq and Vercel AI SDK
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { messages }: { messages: CoreMessage[] } = req.body;
      console.log("messages", messages);  
      const prompt = messages[messages.length - 1].content;
      console.log("prompt", prompt);

      const result = streamText({
        model: groq('llama3-8b-8192'),
        maxTokens: 2000,
        prompt,
        system: "You are a helpful assistant designed to help users query supplier risk data. When asked about suppliers, use the searchSuppliers tool to find relevant information before answering. You do not answer any questions that are not related to supplier risk data.",
        tools: {
          searchSuppliers: {
            description: 'Search for suppliers based on criteria like highest risk, industry, or risk category.',
            parameters: searchSuppliersToolSchema,
            execute: async (args: z.infer<typeof searchSuppliersToolSchema>) => {
              try {
                const suppliers = await storage.searchSuppliers(args as SearchQuery);
                if (suppliers.length === 0) {
                  return "No suppliers found matching the criteria.";
                }
                const topResults = suppliers.slice(0, 3).map(s => s.name).join(', ');
                return `Found ${suppliers.length} suppliers. Top results: ${topResults}`;
              } catch (toolError: any) {
                console.error("Error during searchSuppliers tool execution:", toolError.message);
                return `Error executing supplier search: ${toolError.message}`;
              }
            },
          },
        },
      });

      const response = result.toDataStreamResponse();
      const logResponse = response.clone();
      console.log("logResponse", logResponse);

      // Process the response to extract the tool result
      const textContent = await logResponse.text();
      const parsedContent = textContent
        .split('\n')
        .filter(line => line.startsWith('a:')) // Filter for tool results
        .map(line => JSON.parse(line.slice(2))); // Parse JSON after 'a:'
      
      if (parsedContent.length > 0) {
        const toolResult = parsedContent[0].result;
        console.log("Extracted tool result:", toolResult);
        return res.json({ result: toolResult });
      }

      // If no tool result found, stream the response as before
      result.pipeDataStreamToResponse(res);
    } catch (error: any) {
      console.error("Chat API error:", error.message);
      if (!res.headersSent) {
        res.status(500).json({ 
          message: "Failed to process chat request", 
          error: error.message || "Unknown error during streaming" 
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
