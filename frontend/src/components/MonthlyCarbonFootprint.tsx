interface Transaction {
  date: string;
  amount: number;
  emissions?: {
    emissionFactor: {
      factor: number;
    } | null;
  } | null;
}

interface MonthlyCarbonFootprintProps {
  transactions: Transaction[];
}

export default function MonthlyCarbonFootprint({ transactions }: MonthlyCarbonFootprintProps) {
  if (!transactions.length) return null;

  // Calculate monthly emissions
  const monthlyEmissions = transactions.reduce((acc, tx) => {
    if (tx.emissions?.emissionFactor) {
      const date = new Date(tx.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const emissionValue = Math.abs(tx.amount) * tx.emissions.emissionFactor.factor;
      
      acc.set(monthYear, (acc.get(monthYear) || 0) + emissionValue);
    }
    return acc;
  }, new Map<string, number>());

  // Convert to array and sort by date
  const sortedMonths = Array.from(monthlyEmissions.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month,
      value
    }));

  if (!sortedMonths.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Monthly Carbon Footprint</h2>
      <div className="space-y-4">
        {sortedMonths.map(({ month, value }) => {
          const [year, monthNum] = month.split('-');
          const date = new Date(parseInt(year), parseInt(monthNum) - 1);
          
          return (
            <div key={month} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <span className="text-lg font-bold text-green-600">
                  {value.toFixed(2)} kg CO2e
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${(value / Math.max(...sortedMonths.map(m => m.value))) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 