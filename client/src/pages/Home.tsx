import { useAIStore } from "@/lib/ai";
import SupplierDataPanel from "@/components/SupplierDataPanel";
import ChatInterface from "@/components/ChatInterface";
import { Shield } from "lucide-react";

export default function Home() {
  const { currentSuppliers } = useAIStore();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-gray-800">Supplier Risk Search Tool</h1>
          </div>
          <div>
            <span className="text-sm text-gray-500">Powered by AI</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        <SupplierDataPanel currentSuppliers={currentSuppliers} />
        <ChatInterface />
      </main>
    </div>
  );
}
