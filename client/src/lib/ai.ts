import { nanoid } from "nanoid";
import { create } from "zustand";
import type { SupplierWithRiskCategories, SearchQuery } from "@shared/schema";
import { apiRequest } from "./queryClient";

export type Message = {
  id: string;
  role: "user" | "assistant" | "system" | "function";
  content: string;
  createdAt?: Date;
};

export type AIState = {
  messages: Message[];
  currentSuppliers: SupplierWithRiskCategories[];
  isProcessing: boolean;
  error: string | null;
  addMessage: (message: Omit<Message, "id" | "createdAt">) => void;
  setCurrentSuppliers: (suppliers: SupplierWithRiskCategories[]) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  handleUserMessage: (content: string) => Promise<void>;
};

export type SearchSuppliersArgs = {
  queryType: "highestRisk" | "industry" | "riskCategory" | "all";
  limit?: number;
  industryName?: string;
  riskCategoryName?: string;
};

// Initialize AI store with Zustand
export const useAIStore = create<AIState>((set, get) => ({
  messages: [
    {
      id: nanoid(),
      role: "system",
      content: "You are a supplier risk management assistant. You can help users find and analyze suppliers based on their risk profiles, industries, and risk categories."
    },
    {
      id: nanoid(),
      role: "assistant",
      content: "Welcome to the Supplier Risk Search Tool! You can ask me questions about our suppliers like:\n\n- \"What are the top 3 suppliers with the highest risk scores?\"\n- \"Show me all suppliers in the healthcare industry\"\n- \"Which suppliers have financial compliance risks?\""
    }
  ],
  currentSuppliers: [],
  isProcessing: false,
  error: null,
  
  // Action to add a message to the state
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: nanoid(), createdAt: new Date() }]
  })),
  
  // Action to set current suppliers
  setCurrentSuppliers: (suppliers) => set({ currentSuppliers: suppliers }),
  
  // Action to set processing state
  setProcessing: (isProcessing) => set({ isProcessing }),
  
  // Action to set error
  setError: (error) => set({ error }),
  
  // Action to handle user message and process AI response
  handleUserMessage: async (content) => {
    const state = get();
    
    // Add user message
    state.addMessage({ role: "user", content });
    
    // Set processing state
    state.setProcessing(true);
    
    try {
      // Analyze the user message to determine what query to run
      const queryType = determineQueryType(content);
      
      // Run the supplier search function based on the determined query
      const suppliers = await searchSuppliers(queryType);
      
      // Update the AI state with the search results
      state.setCurrentSuppliers(suppliers);
      
      // Generate a response based on the query results
      const response = generateResponse(queryType, suppliers);
      
      // Add the assistant's response to the messages
      state.addMessage({ role: "assistant", content: response });
      
    } catch (error) {
      console.error("Error in AI processing:", error);
      state.setError("I encountered an error while processing your request. Please try again.");
      state.addMessage({ 
        role: "assistant", 
        content: "I encountered an error while processing your request. Please try again." 
      });
    } finally {
      // Reset processing state
      state.setProcessing(false);
    }
  }
}));

// Function to search suppliers
async function searchSuppliers(args: SearchSuppliersArgs): Promise<SupplierWithRiskCategories[]> {
  try {
    const searchQuery: SearchQuery = {
      type: args.queryType,
      limit: args.limit,
      industry: args.industryName,
      riskCategory: args.riskCategoryName
    };
    
    const response = await apiRequest('POST', '/api/suppliers/search', searchQuery);
    const suppliers: SupplierWithRiskCategories[] = await response.json();
    return suppliers;
  } catch (error) {
    console.error("Error searching suppliers:", error);
    throw error;
  }
}

// Helper function to determine the query type from the user message
function determineQueryType(userMessage: string): SearchSuppliersArgs {
  const message = userMessage.toLowerCase();
  
  // Check for highest risk query
  if (message.includes('highest risk') || (message.includes('top') && message.includes('risk'))) {
    // Extract the limit if specified (e.g., "top 3")
    const limitMatch = message.match(/top\s+(\d+)/i);
    const limit = limitMatch ? parseInt(limitMatch[1]) : 3;
    
    return {
      queryType: "highestRisk",
      limit
    };
  }
  
  // Check for industry query
  const industries = [
    'healthcare', 'transportation', 'technology', 'agriculture', 
    'manufacturing', 'financial services', 'electronics', 
    'automotive', 'energy'
  ];
  
  for (const industry of industries) {
    if (message.includes(industry.toLowerCase())) {
      return {
        queryType: "industry",
        industryName: industry
      };
    }
  }
  
  // Check for risk category query
  const riskCategories = [
    'financial compliance', 'data security', 'regulatory',
    'environmental', 'operational', 'legal', 'supply chain'
  ];
  
  for (const category of riskCategories) {
    if (message.includes(category.toLowerCase())) {
      return {
        queryType: "riskCategory",
        riskCategoryName: category
      };
    }
  }
  
  // Default to all suppliers
  return {
    queryType: "all"
  };
}

// Helper function to generate a response based on the query type and results
function generateResponse(
  query: SearchSuppliersArgs, 
  suppliers: SupplierWithRiskCategories[]
): string {
  if (suppliers.length === 0) {
    return "I couldn't find any suppliers matching your criteria. Would you like to try a different search?";
  }
  
  let response = "";
  
  if (query.queryType === "highestRisk") {
    response = `Based on my search, here are the top ${query.limit || suppliers.length} suppliers with the highest risk scores:\n\n`;
    
    suppliers.forEach((supplier, index) => {
      response += `${index + 1}. ${supplier.name} (Risk Score: ${supplier.riskScore})\n`;
      response += `   Industry: ${supplier.industry} | Location: ${supplier.location}\n`;
      response += `   Risk Categories: ${supplier.riskCategories.join(', ')}\n\n`;
    });
    
    response += "These suppliers require close monitoring due to their high risk profiles. Would you like more detailed information about any of these suppliers or would you like to see suppliers with specific risk categories?";
  } 
  else if (query.queryType === "industry") {
    response = `Here are all suppliers in the ${query.industryName} industry:\n\n`;
    
    suppliers.forEach((supplier, index) => {
      response += `${index + 1}. ${supplier.name} (Risk Score: ${supplier.riskScore})\n`;
      response += `   Location: ${supplier.location}\n`;
      response += `   Risk Categories: ${supplier.riskCategories.join(', ')}\n\n`;
    });
    
    response += "Would you like to know which of these suppliers have the highest risk scores or specific risk categories?";
  } 
  else if (query.queryType === "riskCategory") {
    response = `Here are suppliers with ${query.riskCategoryName} risks:\n\n`;
    
    suppliers.forEach((supplier, index) => {
      response += `${index + 1}. ${supplier.name} (Risk Score: ${supplier.riskScore})\n`;
      response += `   Industry: ${supplier.industry} | Location: ${supplier.location}\n`;
      response += `   All Risk Categories: ${supplier.riskCategories.join(', ')}\n\n`;
    });
    
    response += "These suppliers have been flagged for the specified risk category. Would you like to sort them by risk score or see other risk categories?";
  } 
  else {
    response = "Here are the suppliers in our database:\n\n";
    
    suppliers.forEach((supplier, index) => {
      response += `${index + 1}. ${supplier.name} (Risk Score: ${supplier.riskScore})\n`;
      response += `   Industry: ${supplier.industry} | Location: ${supplier.location}\n`;
      response += `   Risk Categories: ${supplier.riskCategories.join(', ')}\n\n`;
    });
    
    response += "Is there anything specific about these suppliers you'd like to know more about?";
  }
  
  return response;
}
