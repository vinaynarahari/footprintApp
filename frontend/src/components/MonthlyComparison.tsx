import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface Transaction {
  date: string;
  amount: number;
  emissions?: {
    emissionFactor: {
      factor: number;
    } | null;
  } | null;
}

interface MonthlyComparisonProps {
  transactions: Transaction[];
}

// Constants for tree calculations
const KG_CO2_PER_TREE_PER_YEAR = 21.7; // Average CO2 absorption per tree per year
const KG_CO2_PER_TREE_PER_MONTH = KG_CO2_PER_TREE_PER_YEAR / 12;

export default function MonthlyComparison({ transactions }: MonthlyComparisonProps) {
  if (!transactions.length) return null;

  // Get current and previous month's data
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Calculate previous month and year
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Calculate emissions for current and previous month
  const calculateMonthlyEmissions = (month: number, year: number): number => {
    return transactions.reduce((total, tx) => {
      if (tx.emissions?.emissionFactor) {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() === month && txDate.getFullYear() === year) {
          return total + (Math.abs(tx.amount) * tx.emissions.emissionFactor.factor);
        }
      }
      return total;
    }, 0);
  };

  const currentMonthEmissions = calculateMonthlyEmissions(currentMonth, currentYear);
  const previousMonthEmissions = calculateMonthlyEmissions(previousMonth, previousYear);
  
  // Calculate the difference
  const difference = currentMonthEmissions - previousMonthEmissions;
  const percentChange = previousMonthEmissions !== 0 
    ? ((difference / previousMonthEmissions) * 100)
    : 0;

  // Calculate tree impact
  const treeImpact = Math.abs(difference) / KG_CO2_PER_TREE_PER_MONTH;

  // Determine status color and message
  let statusColor = 'text-yellow-500';
  let bgColor = 'bg-yellow-50';
  let borderColor = 'border-yellow-200';
  let message = 'Your carbon footprint is about the same as last month';
  
  if (Math.abs(percentChange) >= 10) { // Only show significant changes (>= 10%)
    if (difference > 0) {
      statusColor = 'text-red-500';
      bgColor = 'bg-red-50';
      borderColor = 'border-red-200';
      message = 'Your carbon footprint has increased significantly';
    } else if (difference < 0) {
      statusColor = 'text-green-500';
      bgColor = 'bg-green-50';
      borderColor = 'border-green-200';
      message = 'Great job! Your carbon footprint has decreased significantly';
    }
  }

  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className={`p-6 mb-6 rounded-lg border ${bgColor} ${borderColor}`}>
      <h2 className="text-xl font-bold mb-4">Monthly Carbon Impact</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-2xl font-bold ${statusColor}`}>
              {difference > 0 ? '+' : ''}{difference.toFixed(2)} kg CO₂
            </span>
            <span className={statusColor}>
              {difference > 0 ? (
                <ArrowUp className="w-6 h-6" />
              ) : difference < 0 ? (
                <ArrowDown className="w-6 h-6" />
              ) : (
                <Minus className="w-6 h-6" />
              )}
            </span>
          </div>
          
          <p className={`text-lg ${statusColor}`}>
            {message}
          </p>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>{getMonthName(currentMonth)}:</span>
              <span className="font-medium">{currentMonthEmissions.toFixed(2)} kg CO₂</span>
            </div>
            <div className="flex justify-between">
              <span>{getMonthName(previousMonth)}:</span>
              <span className="font-medium">{previousMonthEmissions.toFixed(2)} kg CO₂</span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span className={`font-medium ${statusColor}`}>
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="border-t md:border-l md:border-t-0 pt-4 md:pt-0 md:pl-6">
          <h3 className="text-lg font-semibold mb-3">Tree Impact</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              This change in emissions is equivalent to:
            </p>
            <p className={`text-xl font-bold ${statusColor}`}>
              {difference > 0 ? 'Needing' : 'Saving'} {treeImpact.toFixed(1)} trees per month
            </p>
            <p className="text-sm text-gray-500">
              Based on average tree CO₂ absorption of {KG_CO2_PER_TREE_PER_MONTH.toFixed(1)} kg per month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 