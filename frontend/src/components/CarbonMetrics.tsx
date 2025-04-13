import { useState, useEffect } from 'react';

interface Transaction {
  date: string;
  name: string;
  amount: number;
  category: string[];
  emissions?: {
    industry: string;
    emissionFactor: {
      industry: string;
      factor: number;
      unit: string;
      description: string;
    } | null;
  } | null;
}

interface CarbonMetricsProps {
  transactions: Transaction[];
}

export default function CarbonMetrics({ transactions }: CarbonMetricsProps) {
  const [metrics, setMetrics] = useState({
    daily: { carbon: 0, amount: 0, ratio: 0 },
    weekly: { carbon: 0, amount: 0, ratio: 0 },
    monthly: { carbon: 0, amount: 0, ratio: 0 },
    yearly: { carbon: 0, amount: 0, ratio: 0 }
  });

  useEffect(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const calculateMetrics = (startDate: Date) => {
      let totalCarbon = 0;
      let totalAmount = 0;

      transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate >= startDate && transaction.emissions?.emissionFactor) {
          const amount = Math.abs(transaction.amount);
          const carbon = amount * transaction.emissions.emissionFactor.factor;
          totalCarbon += carbon;
          totalAmount += amount;
        }
      });

      return {
        carbon: totalCarbon,
        amount: totalAmount,
        ratio: totalAmount > 0 ? totalCarbon / totalAmount : 0
      };
    };

    setMetrics({
      daily: calculateMetrics(oneDayAgo),
      weekly: calculateMetrics(oneWeekAgo),
      monthly: calculateMetrics(oneMonthAgo),
      yearly: calculateMetrics(oneYearAgo)
    });
  }, [transactions]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Carbon Emissions per Dollar Spent</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Daily</h3>
          <p className="text-sm text-gray-600">Total Carbon: {metrics.daily.carbon.toFixed(3)} kg</p>
          <p className="text-sm text-gray-600">Total Amount: ${metrics.daily.amount.toFixed(2)}</p>
          <p className="text-lg font-bold mt-2">
            {metrics.daily.ratio.toFixed(6)} kg/$
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Weekly</h3>
          <p className="text-sm text-gray-600">Total Carbon: {metrics.weekly.carbon.toFixed(3)} kg</p>
          <p className="text-sm text-gray-600">Total Amount: ${metrics.weekly.amount.toFixed(2)}</p>
          <p className="text-lg font-bold mt-2">
            {metrics.weekly.ratio.toFixed(6)} kg/$
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Monthly</h3>
          <p className="text-sm text-gray-600">Total Carbon: {metrics.monthly.carbon.toFixed(3)} kg</p>
          <p className="text-sm text-gray-600">Total Amount: ${metrics.monthly.amount.toFixed(2)}</p>
          <p className="text-lg font-bold mt-2">
            {metrics.monthly.ratio.toFixed(6)} kg/$
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Yearly</h3>
          <p className="text-sm text-gray-600">Total Carbon: {metrics.yearly.carbon.toFixed(3)} kg</p>
          <p className="text-sm text-gray-600">Total Amount: ${metrics.yearly.amount.toFixed(2)}</p>
          <p className="text-lg font-bold mt-2">
            {metrics.yearly.ratio.toFixed(6)} kg/$
          </p>
        </div>
      </div>
    </div>
  );
} 