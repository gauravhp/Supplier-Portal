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

// Initialize AI store with Zustand
export const useAIStore = create<AIState>((set, get) => ({
  messages: [
    {
      id: nanoid(),
      role: "system",
      content: "You are a supplier risk management assistant. You can help users find and analyze suppliers based on their risk profiles, industries, and risk categories."
    },
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
    const newUserMessage: Message = { 
      role: "user", 
      content, 
      id: nanoid(), 
      createdAt: new Date() 
    };
    // Optimistically update messages
    set((prevState) => ({ messages: [...prevState.messages, newUserMessage] }));

    // Set processing state
    state.setProcessing(true);
    state.setError(null); // Clear previous errors
    
    try {
      // Prepare messages to send to the backend API
      // Ensure the latest user message is included along with previous history
      const previousMessages = state.messages.map(({ role, content }) => ({ role, content }));
      // Make sure newUserMessage is included
      const messagesToSend = [...previousMessages, { role: newUserMessage.role, content: newUserMessage.content }];

      // Call the backend API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesToSend }), // Send message history
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error: ${response.status} ${errorBody || response.statusText}`);
      }
      
      if (!response.body) {
        throw new Error("Response body is null");
      }

      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = "";
      let assistantMessageId = nanoid();
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantResponse += chunk;

        // Add/update assistant message in the store
        if (firstChunk) {
           set((prevState) => ({
            messages: [
              ...prevState.messages,
              { role: "assistant", content: assistantResponse, id: assistantMessageId, createdAt: new Date() }
            ]
          }));
          firstChunk = false;
        } else {
           set((prevState) => ({
            messages: prevState.messages.map(msg => 
              msg.id === assistantMessageId ? { ...msg, content: assistantResponse } : msg
            )
          }));
        }
      }
      
      // Optional: Clear current suppliers or update based on API response if needed
      // state.setCurrentSuppliers([]); 
      
    } catch (error: any) {
      console.error("Error in AI processing:", error);
      const errorMessage = error.message || "I encountered an error while processing your request. Please try again.";
      state.setError(errorMessage);
      // Add specific error message from backend if available
      state.addMessage({ 
        role: "assistant", 
        content: errorMessage
      });
    } finally {
      // Reset processing state
      state.setProcessing(false);
    }
  }
}));
