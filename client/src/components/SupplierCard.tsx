import { SupplierWithRiskCategories } from "@shared/schema";

interface SupplierCardProps {
  supplier: SupplierWithRiskCategories;
}

export default function SupplierCard({ supplier }: SupplierCardProps) {
  // Function to determine risk score color class
  const getRiskScoreClass = (score: number) => {
    if (score >= 7.5) return "risk-score-high";
    if (score >= 5) return "risk-score-medium";
    return "risk-score-low";
  };

  // Function to determine risk category class
  const getCategoryClass = (category: string) => {
    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
    return `risk-category-${normalizedCategory}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-base font-medium text-gray-900">{supplier.name}</h3>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskScoreClass(supplier.riskScore)}`}>
              Risk: {supplier.riskScore}
            </span>
          </div>
        </div>
        <div className="mt-2 flex flex-col sm:flex-row sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">{supplier.industry}</p>
            <p className="text-sm text-gray-500">{supplier.location}</p>
          </div>
          <div className="mt-2 sm:mt-0">
            {supplier.riskCategories.map((category, index) => (
              <span 
                key={index} 
                className={`risk-category-badge ${getCategoryClass(category)}`}
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
