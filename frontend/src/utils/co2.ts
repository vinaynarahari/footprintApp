// CO2 emissions factors (kg CO2 per $) for different spending categories
const CO2_FACTORS: { [key: string]: number } = {
  'FOOD_AND_DRINK': 0.15,      // Food production and restaurant services
  'TRANSPORTATION': 0.2,       // Public transport, ride sharing
  'TRAVEL': 0.3,              // Air travel, hotels
  'SHOPPING': 0.1,            // General retail
  'UTILITIES': 0.25,          // Energy consumption
  'PAYMENT': 0.05,            // Digital services
  'TRANSFER': 0.02,           // Money transfers
  'RENT_AND_UTILITIES': 0.2,  // Housing
  'GENERAL_MERCHANDISE': 0.12, // Mixed retail
  'ENTERTAINMENT': 0.08,      // Recreation
  'default': 0.12             // Default factor for uncategorized spending
};

/**
 * Calculates the estimated CO2 emissions for a transaction
 * @param amount Transaction amount in dollars
 * @param category Transaction category
 * @returns Estimated CO2 emissions in kilograms
 */
export const calculateCO2 = (amount: number, category: string): number => {
  // Convert category to uppercase and remove spaces for matching
  const normalizedCategory = category.toUpperCase().replace(/\s+/g, '_');
  
  // Get the emission factor for the category, or use default if not found
  const emissionFactor = CO2_FACTORS[normalizedCategory] || CO2_FACTORS.default;
  
  // Calculate and return the CO2 emissions
  return amount * emissionFactor;
}; 