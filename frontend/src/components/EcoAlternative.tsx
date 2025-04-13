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

interface FeedbackMessages {
  [key: string]: string[];
}

const EcoAlternative: React.FC<EcoAlternativeProps> = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [alternative, setAlternative] = useState<Alternative | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-load the alternative when component mounts
  useEffect(() => {
    setAlternative(getAlternativeForCategory(transaction.category, transaction.amount, transaction.emissions_kg, transaction.merchant));
  }, [transaction]);

  // Helper function to determine if transaction is eco-friendly
  const getTransactionStatus = (category: string, emissions_kg: number, amount: number, merchant: string): 'eco-friendly' | 'needs-improvement' => {
    // Calculate emissions per dollar spent
    const emissionsPerDollar = emissions_kg / amount;
    const merchantLower = merchant.toLowerCase();

    // Special handling for e-commerce
    if (merchantLower.includes('amazon') || merchantLower.includes('ebay') || merchantLower.includes('walmart.com')) {
      // For e-commerce, we use stricter thresholds due to shipping and packaging impact
      const ecommerceThresholds = {
        absoluteEmissions: 3.5,  // Lower threshold for e-commerce
        emissionsPerDollar: 0.3  // Stricter per-dollar emissions
      };
      
      return (emissions_kg < ecommerceThresholds.absoluteEmissions && 
              emissionsPerDollar < ecommerceThresholds.emissionsPerDollar)
        ? 'eco-friendly'
        : 'needs-improvement';
    }

    const thresholds = {
      'FOOD_AND_DRINK': {
        absoluteEmissions: 8,
        emissionsPerDollar: 0.8
      },
      'TRANSPORTATION': {
        absoluteEmissions: 10,
        emissionsPerDollar: 1.0
      },
      'GENERAL_MERCHANDISE': {
        absoluteEmissions: 6,
        emissionsPerDollar: 0.6
      },
      'PERSONAL_CARE': {
        absoluteEmissions: 4,
        emissionsPerDollar: 0.5
      },
      'default': {
        absoluteEmissions: 7,
        emissionsPerDollar: 0.7
      }
    };

    const categoryThresholds = thresholds[category] || thresholds.default;
    
    return (emissions_kg < categoryThresholds.absoluteEmissions && 
            emissionsPerDollar < categoryThresholds.emissionsPerDollar)
      ? 'eco-friendly'
      : 'needs-improvement';
  };

  const getPositiveFeedback = (category: string, merchant: string): string => {
    const feedback: FeedbackMessages = {
      'FOOD_AND_DRINK': [
        "Great choice! This meal has a lower carbon footprint.",
        "You're making sustainable dining choices!",
        "This restaurant choice helps reduce environmental impact."
      ],
      'TRANSPORTATION': [
        "Excellent transportation choice for the environment!",
        "Your travel decision helps reduce emissions.",
        "Smart pick! This trip has a lower carbon impact."
      ],
      'GENERAL_MERCHANDISE': [
        "Smart shopping! This purchase has a lower environmental impact.",
        "Great choice for sustainable shopping!",
        "Your purchase helps reduce carbon emissions."
      ],
      'PERSONAL_CARE': [
        "Excellent choice for eco-friendly personal care!",
        "This is a sustainable wellness decision.",
        "You're making environmentally conscious choices!"
      ]
    };

    const categoryMessages = feedback[category] || feedback['GENERAL_MERCHANDISE'];
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  };

  const getIconStyles = (status: 'eco-friendly' | 'needs-improvement') => {
    if (status === 'eco-friendly') {
      return {
        icon: <Leaf className="w-5 h-5 text-green-600" />,
        hover: 'hover:bg-green-50',
        border: 'border-green-100',
        text: 'text-green-600'
      };
    }
    return {
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      hover: 'hover:bg-red-50',
      border: 'border-red-100',
      text: 'text-red-600'
    };
  };

  const status = getTransactionStatus(transaction.category, transaction.emissions_kg, transaction.amount, transaction.merchant);
  const styles = getIconStyles(status);

  const getMerchantSpecificRecommendations = (merchant: string, category: string, amount: number): string[] => {
    const merchantLower = merchant.toLowerCase();
    
    // Fast Food and Restaurants
    if (merchantLower.includes('mcdonalds') || merchantLower.includes('mcdonald')) {
      return [
        'Try local vegan burger spots like Beyond Burger or Impossible Foods restaurants',
        'Visit farm-to-table restaurants in your area for fresh, local ingredients',
        'Consider meal prep services that use organic ingredients',
        'Look for restaurants that compost and use renewable energy',
        'Support local diners that source from nearby farms'
      ];
    }
    if (merchantLower.includes('chipotle')) {
      const alternatives = [
        // Mexican/Latin American alternatives
        'Try local authentic Mexican restaurants that source ingredients locally',
        'Visit farm-to-table taquerias in your area',
        'Look for Latin American restaurants using organic ingredients',
        'Consider restaurants offering plant-based Mexican options',
        'Support family-owned Mexican restaurants that use sustainable practices'
      ];
      if (amount < 15) {
        alternatives.push('Check out food trucks using local ingredients');
      }
      return alternatives;
    }
    if (merchantLower.includes('starbucks')) {
      return [
        'Visit local coffee shops that roast their own beans',
        'Try cafes that source directly from sustainable farms',
        'Support coffee shops using reusable cup programs',
        'Look for cafes powered by renewable energy',
        'Find shops offering organic and shade-grown coffee options'
      ];
    }

    // Retail Clothing
    if (merchantLower.includes('abercrombie') || merchantLower.includes('h&m') || merchantLower.includes('zara')) {
      return [
        'Shop at Patagonia for durable, environmentally conscious clothing',
        'Try Reformation for sustainable fashion with similar styles',
        'Visit local vintage or secondhand stores for unique pieces',
        'Check out Everlane for transparent, sustainable manufacturing',
        'Consider renting clothes from Rent the Runway for special occasions',
        'Support local designers using sustainable materials'
      ];
    }

    // Fitness
    if (merchantLower.includes('planet fitness') || merchantLower.includes('24 hour fitness')) {
      return [
        'Try outdoor bootcamp classes in local parks',
        'Join community sports leagues or running groups',
        'Look for gyms powered by renewable energy',
        'Consider home workout equipment made from sustainable materials',
        'Join eco-conscious yoga studios using natural lighting and ventilation'
      ];
    }

    // Transportation
    if (merchantLower.includes('uber') || merchantLower.includes('lyft')) {
      let alternatives: string[] = [];
      if (amount <= 15) {
        alternatives = [
          'Use local bike-sharing services for short trips',
          'Try electric scooter rentals for quick errands',
          'Walk when possible for nearby destinations'
        ];
      }
      return [
        ...alternatives,
        'Use public transit for regular commutes',
        'Join a local carpool group',
        'Consider electric vehicle rideshare options'
      ];
    }

    // Grocery
    if (merchantLower.includes('whole foods') || merchantLower.includes('trader')) {
      return [
        'Shop at local farmers markets for fresh produce',
        'Join a community-supported agriculture (CSA) program',
        'Visit local food co-ops with bulk buying options',
        'Support small organic grocery stores in your area',
        'Try zero-waste grocery stores that minimize packaging'
      ];
    }

    // Default recommendations based on category
    if (category === 'FOOD_AND_DRINK') {
      const cuisineTypes = {
        'burger': ['local organic burger joints', 'plant-based burger restaurants'],
        'pizza': ['pizzerias using local ingredients', 'wood-fired pizza places with sustainable practices'],
        'asian': ['local Asian restaurants using organic ingredients', 'sustainable sushi restaurants with ocean-friendly sourcing'],
        'coffee': ['local roasters', 'eco-friendly cafes'],
        'default': ['farm-to-table restaurants', 'local organic eateries']
      };

      // Try to match the merchant name with cuisine type
      const matchedCuisine = Object.keys(cuisineTypes).find(cuisine => 
        merchantLower.includes(cuisine)
      ) || 'default';

      return [
        `Try ${cuisineTypes[matchedCuisine][0]} in your area`,
        `Visit ${cuisineTypes[matchedCuisine][1]}`,
        'Support restaurants with composting programs',
        'Look for establishments using renewable energy',
        'Choose places offering reusable container programs'
      ];
    }

    if (category === 'SHOPPING') {
      return [
        'Visit local thrift stores or consignment shops',
        'Check out B-Corp certified retailers in your area',
        'Support local artisans and makers',
        'Try zero-waste stores for household items',
        'Look for products with minimal packaging'
      ];
    }

    if (category === 'TRANSPORTATION') {
      let alternatives: string[] = [];
      if (amount <= 20) {
        alternatives = [
          'Use bike-sharing programs for short trips',
          'Try electric scooter rentals',
          'Walk when possible'
        ];
      } else {
        alternatives = [
          'Use public transportation for longer trips',
          'Join a local carpool program',
          'Consider electric vehicle options'
        ];
      }
      return alternatives;
    }

    // Generic recommendations
    return [
      'Research local sustainable alternatives',
      'Support businesses with environmental certifications',
      'Look for companies using renewable energy',
      'Choose services with minimal environmental impact',
      'Consider digital or low-impact alternatives'
    ];
  };

  const getAlternativeForCategory = (category: string, amount: number, emissions_kg: number, merchant: string): Alternative => {
    const merchantSpecificRecommendations = getMerchantSpecificRecommendations(merchant, category, amount);
    
    // Enhanced suggestions with specific recommendations and impact assessment
    const suggestions: Record<string, Alternative> = {
      'TRANSPORTATION': {
        name: amount <= 15 ? 'Short-Distance Green Transit' : 'Sustainable Transportation',
        description: amount <= 15 ? 
          'Consider active transportation options for shorter trips' : 
          'Switch to more sustainable transportation methods for longer journeys',
        emissions_reduction: emissions_kg > 10 ? '70-80%' : '30-40%',
        price_range: amount <= 15 ? '$2 - $5' : `$${(amount * 0.6).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: emissions_kg > 10 ? 'negative' : 'positive',
        specific_recommendations: merchantSpecificRecommendations,
        current_impact: emissions_kg > 10 ? 
          'This trip has a significant carbon footprint' : 
          'Consider greener alternatives for regular trips'
      },
      'FOOD_AND_DRINK': {
        name: `Sustainable ${merchant.split(' ')[0]} Alternatives`,
        description: 'Discover eco-conscious dining options with similar cuisine',
        emissions_reduction: '40-60%',
        price_range: `$${(amount * 0.8).toFixed(2)} - $${amount.toFixed(2)}`,
        impact: emissions_kg > 5 ? 'negative' : 'positive',
        specific_recommendations: merchantSpecificRecommendations,
        current_impact: emissions_kg > 5 ? 
          'This meal has a higher environmental impact than necessary' : 
          'Your dining choice is relatively sustainable'
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

  const isEcoFriendly = (emissions: number, category: string): boolean => {
    const thresholds: { [key: string]: number } = {
      'FOOD_AND_DRINK': 5.0,
      'TRANSPORTATION': 8.0,
      'GENERAL_MERCHANDISE': 10.0,
      'PERSONAL_CARE': 6.0
    };
    
    const threshold = thresholds[category] || thresholds['GENERAL_MERCHANDISE'];
    return emissions <= threshold;
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => {
        setIsExpanded(true);
        if (status === 'needs-improvement' && !alternative) {
          // Only fetch alternatives for high-emission transactions
          setAlternative(getAlternativeForCategory(transaction.category, transaction.amount, transaction.emissions_kg, transaction.merchant));
        }
      }}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`p-1 rounded-full transition-colors ${styles.hover}`}
        title={status === 'eco-friendly' ? 'Eco-friendly choice!' : 'View eco-friendly alternatives'}
      >
        {styles.icon}
      </div>

      {isExpanded && (
        <div className={`absolute z-10 right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border ${styles.border}`}>
          <div className="p-4">
            {status === 'eco-friendly' ? (
              <div className="space-y-3">
                <div className={`text-sm font-medium ${styles.text}`}>
                  {getPositiveFeedback(transaction.category, transaction.merchant)}
                </div>
                <p className="text-sm text-gray-600">
                  Your carbon footprint for this transaction is {transaction.emissions_kg.toFixed(2)} kg CO₂, 
                  which is below average for this category. Keep making sustainable choices!
                </p>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Why this is good: </span>
                  {transaction.category === 'FOOD_AND_DRINK' && 'Lower emissions often mean more local, seasonal, or plant-based options.'}
                  {transaction.category === 'TRANSPORTATION' && 'This indicates efficient or shared transportation methods.'}
                  {transaction.category === 'GENERAL_MERCHANDISE' && 'This suggests sustainable or local shopping practices.'}
                  {transaction.category === 'PERSONAL_CARE' && 'This reflects eco-conscious personal care choices.'}
                </div>
              </div>
            ) : alternative ? (
              <div className="space-y-4">
                <div className={`text-sm font-medium ${styles.text}`}>
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
                {alternative.specific_recommendations && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700">Recommended Alternatives:</h4>
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
              <div className="text-sm text-gray-500">Loading...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoAlternative; 