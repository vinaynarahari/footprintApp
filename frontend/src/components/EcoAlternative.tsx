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

  const getAlternativeForCategory = (merchant: string, category: string, amount: number) => {
    // Specific company suggestions based on merchant and category
    const suggestions: Record<string, any> = {
      'TRANSPORTATION': {
        name: amount <= 10 ? 'Local Bike Share' : 'Public Transit',
        description: amount <= 10 ? 
          'Switch to bike sharing services like Lime or local bike rentals' : 
          'Use public transportation or carpooling services',
        emissions_reduction: '80-90%',
        price_range: amount <= 10 ? '$1 - $5' : '$2 - $8',
        impact: 'excellent'
      },
      'FOOD_AND_DRINK': {
        name: 'Local Sustainable Options',
        description: 'Try Sweetgreen, Just Salad, or local farm-to-table restaurants. Many offer reusable bowls and source locally.',
        emissions_reduction: '40-60%',
        price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: 'good'
      },
      'PERSONAL_CARE': {
        name: 'Eco-Friendly Fitness',
        description: 'Consider Terra Fitness (solar-powered), Green Gym (human-powered equipment), or outdoor fitness groups',
        emissions_reduction: '50-70%',
        price_range: `$${(amount * 0.7).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: 'good'
      },
      'ENTERTAINMENT': {
        name: 'Local Entertainment',
        description: 'Check out local theaters, community events, or outdoor venues that use renewable energy',
        emissions_reduction: '30-40%',
        price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: 'moderate'
      }
    };

    // Special handling for specific merchants
    const merchantSpecificSuggestions: Record<string, any> = {
      'Abercrombie & Fitch': {
        name: 'Sustainable Fashion Alternatives',
        description: 'Try Patagonia, Tentree (plants 10 trees per item), Reformation, or ThredUp (secondhand). These brands use recycled materials and sustainable practices.',
        emissions_reduction: '60-80%',
        price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: 'excellent'
      },
      'Planet Fitness': {
        name: 'Green Fitness Options',
        description: 'Consider Terra Fitness (uses solar power), outdoor fitness groups, or local gyms with energy-efficient equipment',
        emissions_reduction: '40-60%',
        price_range: `$${(amount * 0.9).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: 'good'
      },
      'Uber': {
        name: 'Green Transportation',
        description: 'Try Uber Green (electric vehicles), public transit, or bike sharing for shorter trips',
        emissions_reduction: '70-90%',
        price_range: amount <= 15 ? '$2 - $5' : `$${(amount * 0.6).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: 'excellent'
      },
      'Chipotle': {
        name: 'Sustainable Food Options',
        description: 'Try Sweetgreen, Just Salad (reusable bowls), or local vegetarian restaurants with locally-sourced ingredients',
        emissions_reduction: '30-50%',
        price_range: `$${(amount * 0.9).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: 'moderate'
      }
    };

    // Check for merchant-specific suggestions first
    const merchantMatch = Object.entries(merchantSpecificSuggestions)
      .find(([key]) => merchant.toLowerCase().includes(key.toLowerCase()));
    
    if (merchantMatch) {
      return merchantMatch[1];
    }

    // Fall back to category-based suggestions
    return suggestions[category] || {
      name: 'General Eco Alternative',
      description: 'Look for local, sustainable alternatives with lower carbon footprint. Check for B Corp certified businesses in your area.',
      emissions_reduction: '30-40%',
      price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
      impact: 'moderate'
    };
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'excellent':
        return 'bg-green-50 border-green-100 text-green-800';
      case 'good':
        return 'bg-lime-50 border-lime-100 text-lime-800';
      case 'moderate':
        return 'bg-yellow-50 border-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-800';
    }
  };

  const getLeafColor = (impact: string) => {
    switch (impact) {
      case 'excellent':
        return 'text-green-600 hover:text-green-700';
      case 'good':
        return 'text-lime-600 hover:text-lime-700';
      case 'moderate':
        return 'text-yellow-600 hover:text-yellow-700';
      default:
        return 'text-gray-600 hover:text-gray-700';
    }
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    if (!alternative && !isExpanded) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAlternative(getAlternativeForCategory(transaction.merchant, transaction.category, transaction.amount));
        setIsLoading(false);
      }, 500);
    }
  };

  // Lower threshold to 3kg CO₂
  if (transaction.emissions_kg < 3) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={`p-1 rounded-full hover:bg-opacity-20 transition-colors ${alternative ? getLeafColor(alternative.impact) : 'text-gray-600'}`}
        title="View eco-friendly alternatives"
      >
        <Leaf className="w-5 h-5" />
      </button>

      {isExpanded && (
        <div className="absolute z-10 right-0 mt-2 w-80 rounded-lg shadow-xl border">
          <div className={`p-4 rounded-lg ${alternative ? getImpactColor(alternative.impact) : 'bg-gray-50 border-gray-100'}`}>
            {isLoading ? (
              <div className="text-sm text-gray-500">Finding alternatives...</div>
            ) : alternative ? (
              <div className="space-y-3">
                <h3 className="font-semibold">{alternative.name}</h3>
                <p className="text-sm text-gray-600">{alternative.description}</p>
                <div className="text-sm">
                  <div className="flex justify-between items-center">
                    <span>Emissions Reduction:</span>
                    <span className="font-medium">{alternative.emissions_reduction}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-gray-600">
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