import { pgTable, text, serial, integer, boolean, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  riskScore: real("risk_score").notNull(),
  industry: text("industry").notNull(),
  location: text("location").notNull(),
});

export const riskCategories = pgTable("risk_categories", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull().references(() => suppliers.id),
  category: text("category").notNull(),
});

export const insertSupplierSchema = createInsertSchema(suppliers);
export const insertRiskCategorySchema = createInsertSchema(riskCategories);

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertRiskCategory = z.infer<typeof insertRiskCategorySchema>;
export type RiskCategory = typeof riskCategories.$inferSelect;

export type SupplierWithRiskCategories = Supplier & {
  riskCategories: string[];
};

export type SearchQuery = {
  type: "highestRisk" | "industry" | "riskCategory" | "all";
  limit?: number;
  industry?: string;
  riskCategory?: string;
};
