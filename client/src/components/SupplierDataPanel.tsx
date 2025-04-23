import { useQuery } from "@tanstack/react-query";
import { SupplierWithRiskCategories } from "@shared/schema";
import SupplierCard from "./SupplierCard";
import { Skeleton } from "@/components/ui/skeleton";

interface SupplierDataPanelProps {
  currentSuppliers: SupplierWithRiskCategories[];
}

export default function SupplierDataPanel({ currentSuppliers }: SupplierDataPanelProps) {
  const { data: suppliers, isLoading, error } = useQuery({
    queryKey: ['/api/suppliers'],
    staleTime: 60000 // 1 minute
  });

  // Determine which suppliers to display
  const displaySuppliers = currentSuppliers.length > 0 ? currentSuppliers : suppliers || [];

  return (
    <div className="w-full md:w-1/2 p-4 bg-white md:border-r border-gray-200 overflow-y-auto max-h-[calc(100vh-64px)]">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-800">Supplier Database</h2>
        <p className="text-sm text-gray-500">
          {currentSuppliers.length > 0 
            ? `Showing ${currentSuppliers.length} filtered supplier(s)` 
            : 'Showing all suppliers with risk profiles'}
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="mt-2 sm:mt-0">
                  <Skeleton className="h-6 w-20 inline-block mr-1" />
                  <Skeleton className="h-6 w-24 inline-block" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          <p>Error loading suppliers. Please try again.</p>
        </div>
      ) : displaySuppliers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-500">No suppliers found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displaySuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      )}
    </div>
  );
}
