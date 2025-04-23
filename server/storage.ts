import { suppliers, riskCategories, type Supplier, type InsertSupplier, type RiskCategory, type InsertRiskCategory, type SupplierWithRiskCategories, type SearchQuery } from "@shared/schema";

export interface IStorage {
  getSuppliers(): Promise<SupplierWithRiskCategories[]>;
  getSupplierById(id: number): Promise<SupplierWithRiskCategories | undefined>;
  searchSuppliers(query: SearchQuery): Promise<SupplierWithRiskCategories[]>;
  createSupplier(supplier: InsertSupplier, categories: string[]): Promise<SupplierWithRiskCategories>;
  initialize(): Promise<void>;
}

export class MemStorage implements IStorage {
  private suppliers: Map<number, Supplier>;
  private riskCategories: Map<number, RiskCategory[]>;
  private currentSupplierId: number;
  private currentRiskCategoryId: number;

  constructor() {
    this.suppliers = new Map();
    this.riskCategories = new Map();
    this.currentSupplierId = 1;
    this.currentRiskCategoryId = 1;
  }

  async initialize(): Promise<void> {
    // Initial fictional supplier data
    const suppliersData: { 
      name: string; 
      riskScore: number; 
      industry: string; 
      location: string; 
      categories: string[];
    }[] = [
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

    // Create each supplier and its risk categories
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

  async getSuppliers(): Promise<SupplierWithRiskCategories[]> {
    const result: SupplierWithRiskCategories[] = [];
    
    for (const supplier of this.suppliers.values()) {
      const supplierRiskCategories = this.riskCategories.get(supplier.id) || [];
      result.push({
        ...supplier,
        riskCategories: supplierRiskCategories.map(rc => rc.category)
      });
    }
    
    return result;
  }

  async getSupplierById(id: number): Promise<SupplierWithRiskCategories | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const supplierRiskCategories = this.riskCategories.get(id) || [];
    
    return {
      ...supplier,
      riskCategories: supplierRiskCategories.map(rc => rc.category)
    };
  }

  async searchSuppliers(query: SearchQuery): Promise<SupplierWithRiskCategories[]> {
    let result = await this.getSuppliers();
    
    // Apply filters based on query type
    if (query.type === "highestRisk") {
      // Sort by risk score descending and limit results
      result.sort((a, b) => b.riskScore - a.riskScore);
      if (query.limit) {
        result = result.slice(0, query.limit);
      }
    } else if (query.type === "industry" && query.industry) {
      // Filter by industry
      result = result.filter(s => 
        s.industry.toLowerCase() === query.industry?.toLowerCase()
      );
    } else if (query.type === "riskCategory" && query.riskCategory) {
      // Filter by risk category
      result = result.filter(s => 
        s.riskCategories.some(
          cat => cat.toLowerCase() === query.riskCategory?.toLowerCase()
        )
      );
    }
    
    return result;
  }

  async createSupplier(supplier: InsertSupplier, categories: string[]): Promise<SupplierWithRiskCategories> {
    const id = this.currentSupplierId++;
    const newSupplier: Supplier = { ...supplier, id };
    this.suppliers.set(id, newSupplier);
    
    // Create risk categories for this supplier
    const supplierCategories: RiskCategory[] = [];
    
    for (const category of categories) {
      const categoryId = this.currentRiskCategoryId++;
      const newCategory: RiskCategory = {
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
}

export const storage = new MemStorage();
