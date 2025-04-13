import React, { useState, useEffect } from 'react';
import { Leaf, ThumbsUp, AlertTriangle } from 'lucide-react';

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

interface Alternative {
  name: string;
  description: string;
  emissions_reduction: string;
  price_range: string;
  impact: 'positive' | 'negative';
  specific_recommendations: string[];
  current_impact: string;
}

const EcoAlternative: React.FC<EcoAlternativeProps> = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [alternative, setAlternative] = useState<Alternative | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-load the alternative when component mounts
  useEffect(() => {
    setAlternative(getAlternativeForCategory(transaction.category, transaction.amount, transaction.emissions_kg, transaction.merchant));
  }, [transaction]);

  const getMerchantSpecificRecommendations = (merchant: string, category: string): string[] => {
    const merchantLower = merchant.toLowerCase();
    
    // Fast Food Chains
    if (merchantLower.includes('mcdonalds') || merchantLower.includes('mcdonald')) {
      return [
        'Try their plant-based options like the McPlant burger',
        'Skip the single-use plastic straws and lids',
        'Bring your own reusable cup for drinks',
        'Consider ordering through their app to reduce paper waste',
        'Opt for water instead of soda to reduce sugar and packaging waste'
      ];
    }
    if (merchantLower.includes('starbucks')) {
      return [
        'Bring your own reusable cup for a discount',
        'Try their plant-based milk options',
        'Skip the plastic lid and straw',
        'Use their reusable cup program',
        'Order through their app to reduce paper waste'
      ];
    }
    if (merchantLower.includes('chipotle')) {
      return [
        'Choose their plant-based protein options',
        'Bring your own reusable container',
        'Skip the plastic utensils and napkins',
        'Try their local and organic ingredients',
        'Use their digital ordering to reduce paper waste'
      ];
    }

    // E-commerce
    if (merchantLower.includes('amazon')) {
      return [
        'Use Amazon Day Delivery to consolidate shipments',
        'Look for products with "Climate Pledge Friendly" badge',
        'Choose minimal packaging options when available',
        'Consider buying used items through Amazon Renewed',
        'Use Amazon\'s recycling program for electronics'
      ];
    }
    if (merchantLower.includes('target')) {
      return [
        'Use their reusable bag program',
        'Look for products with Target\'s "Made to Matter" sustainability line',
        'Choose products with minimal packaging',
        'Use their recycling stations for electronics and plastic bags',
        'Consider their in-store pickup to reduce shipping emissions'
      ];
    }

    // Transportation
    if (merchantLower.includes('uber') || merchantLower.includes('lyft')) {
      return [
        'Try Uber Green or Lyft Green for electric vehicle rides',
        'Use shared rides when possible',
        'Consider public transit for shorter trips',
        'Use bike-share programs for short distances',
        'Plan trips during off-peak hours to reduce congestion'
      ];
    }
    if (merchantLower.includes('airbnb')) {
      return [
        'Look for "Eco-Friendly" listings',
        'Choose accommodations with energy-efficient appliances',
        'Support hosts with sustainable practices',
        'Use public transportation during your stay',
        'Conserve water and energy during your visit'
      ];
    }

    // Grocery
    if (merchantLower.includes('whole foods') || merchantLower.includes('trader joe')) {
      return [
        'Bring your own reusable bags',
        'Choose local and seasonal produce',
        'Use their bulk section to reduce packaging',
        'Look for organic and fair-trade products',
        'Try their plant-based alternatives'
      ];
    }

    // Default recommendations based on category
    if (category === 'FOOD_AND_DRINK') {
      return [
        'Look for local and seasonal menu items',
        'Bring your own reusable containers',
        'Choose plant-based options when available',
        'Support restaurants with sustainable sourcing',
        'Skip single-use plastics and utensils'
      ];
    }
    if (category === 'SHOPPING') {
      return [
        'Look for second-hand alternatives',
        'Choose products with minimal packaging',
        'Support local businesses when possible',
        'Consider the product\'s lifecycle impact',
        'Look for sustainable certifications'
      ];
    }
    if (category === 'TRANSPORTATION') {
      return [
        'Use public transportation when possible',
        'Consider carpooling or ridesharing',
        'Try walking or biking for short distances',
        'Look for electric vehicle options',
        'Plan trips to minimize distance'
      ];
    }

    return [
      'Research local sustainable alternatives',
      'Look for businesses with environmental certifications',
      'Choose products with eco-friendly packaging',
      'Support companies with carbon reduction goals',
      'Consider digital or low-impact alternatives'
    ];
  };

  const getAlternativeForCategory = (category: string, amount: number, emissions_kg: number, merchant: string): Alternative => {
    const merchantSpecificRecommendations = getMerchantSpecificRecommendations(merchant, category);
    
    // Enhanced suggestions with specific recommendations and impact assessment
    const suggestions: Record<string, Alternative> = {
      'TRANSPORTATION': {
        name: emissions_kg > 10 ? 'High-Impact Transportation Alternative' : 'Eco-Friendly Transit Options',
        description: 'Switch to more sustainable transportation methods',
        emissions_reduction: emissions_kg > 10 ? '~80%' : '~40%',
        price_range: `$2 - $5`,
        impact: emissions_kg > 10 ? 'negative' : 'positive',
        specific_recommendations: merchantSpecificRecommendations,
        current_impact: emissions_kg > 10 ? 
          'Your current transportation choice has a high carbon footprint' : 
          'Your transportation emissions are moderate'
      },
      'FOOD_AND_DRINK': {
        name: amount > 50 ? 'High-Impact Dining Alternative' : 'Sustainable Dining Choices',
        description: 'Choose more sustainable dining options',
        emissions_reduction: '~50%',
        price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: 'positive', // Local dining is generally positive
        specific_recommendations: merchantSpecificRecommendations,
        current_impact: 'Your dining choice supports local businesses and sustainable practices'
      },
      'SHOPPING': {
        name: 'Sustainable Shopping Alternatives',
        description: 'Make eco-conscious shopping decisions',
        emissions_reduction: '~40%',
        price_range: `$${(amount * 0.7).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: emissions_kg > 7 ? 'negative' : 'positive',
        specific_recommendations: merchantSpecificRecommendations,
        current_impact: emissions_kg > 7 ? 
          'These purchases have a high environmental impact' : 
          'Your shopping choices are relatively eco-friendly'
      },
      'PERSONAL_CARE': {
        name: 'Eco-Friendly Personal Care',
        description: 'Choose sustainable wellness options',
        emissions_reduction: '~60%',
        price_range: `$${(amount * 0.7).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: emissions_kg > 3 ? 'negative' : 'positive',
        specific_recommendations: merchantSpecificRecommendations,
        current_impact: emissions_kg > 3 ? 
          'Your current choice has room for improvement' : 
          'Your personal care choices are environmentally conscious'
      }
    };

    // Enhanced default suggestion
    return suggestions[category] || {
      name: 'Eco-Friendly Alternative',
      description: 'Consider more sustainable options',
      emissions_reduction: '~30%',
      price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
      impact: emissions_kg > 5 ? 'negative' : 'positive',
      specific_recommendations: merchantSpecificRecommendations,
      current_impact: emissions_kg > 5 ? 
        'This purchase has a significant environmental impact' : 
        'Your choice is relatively eco-friendly'
    };
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={`p-1 rounded-full transition-colors ${
          alternative?.impact === 'negative' 
            ? 'hover:bg-red-50' 
            : 'hover:bg-green-50'
        }`}
        title="View eco-friendly alternatives"
      >
        {alternative ? (
          alternative.impact === 'negative' ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <ThumbsUp className="w-5 h-5 text-green-600" />
          )
        ) : (
          <Leaf className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {isExpanded && (
        <div className={`absolute z-10 right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border ${
          alternative?.impact === 'negative' 
            ? 'border-red-100' 
            : 'border-green-100'
        }`}>
          <div className="p-4">
            {isLoading ? (
              <div className="text-sm text-gray-500">Finding alternatives...</div>
            ) : alternative ? (
              <div className="space-y-4">
                <div className={`text-sm font-medium ${
                  alternative.impact === 'negative' 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {alternative.current_impact}
                </div>
                <h3 className="font-semibold text-gray-800">{alternative.name}</h3>
                <p className="text-sm text-gray-600">{alternative.description}</p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center text-gray-700">
                    <span>Potential Emissions Reduction:</span>
                    <span className="font-medium">{alternative.emissions_reduction}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Price Range:</span>
                    <span>{alternative.price_range}</span>
                  </div>
                </div>
                {alternative.specific_recommendations && alternative.specific_recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Specific Recommendations:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {alternative.specific_recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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