import { useState, useRef, useEffect } from "react";
import { useAIStore } from "@/lib/ai";
import ChatMessage from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon, Mic } from "lucide-react";

export default function ChatInterface() {
  const [inputValue, setInputValue] = useState("");
  const { 
    messages, 
    isProcessing,
    handleUserMessage 
  } = useAIStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus the input field when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const message = inputValue.trim();
    if (!message || isProcessing) return;
    
    setInputValue("");
    await handleUserMessage(message);
  };

  // Helper function to extract result from message content
  const extractResult = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return parsed.result || content;
    } catch {
      return content;
    }
  };

  return (
    <div className="w-full md:w-1/2 flex flex-col bg-gray-50">
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4" 
        id="chat-messages"
      >
        {messages.filter(m => m.role !== "system").map((message) => (
          <ChatMessage 
            key={message.id} 
            message={{ ...message, content: extractResult(message.content) }} 
          />
        ))}
        
        {/* Show processing state */}
        {isProcessing && (
          <div className="flex items-start max-w-3xl">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1 bg-gray-200 text-gray-700 rounded-lg px-4 py-2 shadow-sm">
              <p className="text-sm">Analyzing your query...</p>
              <p className="text-xs text-gray-500 mt-1">Processing request</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <form 
          onSubmit={handleSubmit}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about supplier risks..."
              className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isProcessing}
            />
            <button 
              type="button" 
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              onClick={() => {}}
              disabled={isProcessing}
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            disabled={isProcessing}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Using custom tool calling to search supplier risk data
        </p>
      </div>
    </div>
  );
}
