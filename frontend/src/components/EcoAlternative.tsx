import React, { useState } from 'react';
import { Leaf } from 'lucide-react';

interface Transaction {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  emissions_kg: number;
}

interface EcoAlternativeProps {
  transaction: Transaction;
}

const EcoAlternative: React.FC<EcoAlternativeProps> = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [alternative, setAlternative] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAlternativeForCategory = (category: string, amount: number) => {
    // This is where we'd normally call the Gemini API
    // For now, returning hardcoded suggestions based on category
    const suggestions: Record<string, any> = {
      'TRANSPORTATION': {
        name: 'Public Transit or Bike Share',
        description: 'Switch to public transportation or bike sharing services for urban trips',
        emissions_reduction: '~80%',
        price_range: `$2 - $5`,
      },
      'FOOD_AND_DRINK': {
        name: 'Local Vegetarian Options',
        description: 'Try nearby vegetarian restaurants or plant-based alternatives',
        emissions_reduction: '~50%',
        price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
      },
      'PERSONAL_CARE': {
        name: 'Eco-Friendly Fitness',
        description: 'Consider outdoor exercises or gyms powered by renewable energy',
        emissions_reduction: '~60%',
        price_range: `$${(amount * 0.7).toFixed(2)} - $${amount.toFixed(2)}`,
      },
    };

    return suggestions[category] || {
      name: 'General Eco Alternative',
      description: 'Look for local, sustainable alternatives with lower carbon footprint',
      emissions_reduction: '~40%',
      price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
    };
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    if (!alternative && !isExpanded) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAlternative(getAlternativeForCategory(transaction.category, transaction.amount));
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className="p-1 rounded-full hover:bg-green-50 transition-colors"
        title="View eco-friendly alternatives"
      >
        <Leaf className="w-5 h-5 text-green-600" />
      </button>

      {isExpanded && (
        <div className="absolute z-10 right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-green-100">
          <div className="p-4">
            {isLoading ? (
              <div className="text-sm text-gray-500">Finding alternatives...</div>
            ) : alternative ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-green-800">{alternative.name}</h3>
                <p className="text-sm text-gray-600">{alternative.description}</p>
                <div className="text-sm">
                  <div className="flex justify-between items-center text-green-700">
                    <span>Emissions Reduction:</span>
                    <span>{alternative.emissions_reduction}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 mt-1">
                    <span>Price Range:</span>
                    <span>{alternative.price_range}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No alternatives found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoAlternative; 