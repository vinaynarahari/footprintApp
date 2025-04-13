import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePlaidLink, PlaidLinkProps } from 'react-plaid-link';
import axios from 'axios';
import { useRouter } from 'next/router';
import Script from 'next/script';
import EmissionsPieChart from '../components/EmissionsPieChart';
import TopEmissions from '../components/TopEmissions';
import TransactionList from '../components/TransactionList';
import MonthlyCarbonFootprint from '../components/MonthlyCarbonFootprint';
import CarbonMetrics from '../components/CarbonMetrics';
import Transactions from '../components/Transactions';
import MonthlyComparison from '../components/MonthlyComparison';
import CarbonDistanceHeadline from '../components/CarbonDistanceHeadline';

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

interface CategoryEmissions {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'
];

export default function PlaidTest() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [daysToInclude, setDaysToInclude] = useState<number>(30); // Default to 30 days
  const isMounted = useRef(true);

  // Calculate date ranges for the slider
  const dateRanges = useMemo(() => {
    if (!transactions.length) return { earliest: new Date(), latest: new Date(), totalDays: 0 };
    
    const dates = transactions.map(tx => new Date(tx.date));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    const totalDays = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24));
    
    return { earliest, latest, totalDays };
  }, [transactions]);

  // Calculate category emissions for the pie chart
  const categoryEmissions = useMemo(() => {
    if (!transactions.length) return [];

    // Calculate cutoff date from the latest transaction date, not current date
    const dates = transactions.map(tx => new Date(tx.date));
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);

    // Filter transactions by date range
    const recentTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= cutoffDate && txDate <= latestDate;
    });

    // Calculate total emissions for each category
    const categoryTotals = new Map<string, number>();
    let totalEmissions = 0;

    recentTransactions.forEach(tx => {
      if (tx.emissions?.emissionFactor) {
        const category = tx.emissions.industry;
        const emissionValue = Math.abs(tx.amount) * tx.emissions.emissionFactor.factor;
        
        categoryTotals.set(
          category,
          (categoryTotals.get(category) || 0) + emissionValue
        );
        totalEmissions += emissionValue;
      }
    });

    // Convert to array and calculate percentages
    const emissions: CategoryEmissions[] = Array.from(categoryTotals.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalEmissions > 0 ? (value / totalEmissions) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);

    return emissions;
  }, [transactions, daysToInclude]);

  const onSuccess = useCallback(async (public_token: string) => {
    if (!isMounted.current) return;

    try {
      const response = await axios.post('http://localhost:5001/api/plaid/item/public_token/exchange', {
        public_token
      });
      if (isMounted.current) {
        setAccessToken(response.data.access_token);
      }
    } catch (error) {
      console.error('Error exchanging public token:', error);
      if (isMounted.current) {
        setError('Failed to exchange public token');
      }
    }
  }, []);

  const onExit = useCallback((err?: Error | null, metadata?: any) => {
    if (!isMounted.current) return;

    if (err) {
      console.error('Plaid Link exited with error:', err);
      setError('Plaid Link exited with error');
    }
  }, []);

  const config: PlaidLinkProps = {
    token: linkToken || '',
    onSuccess,
    onExit,
  };

  const { open, ready } = usePlaidLink(config);

  const getLinkToken = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      const response = await axios.post('http://localhost:5001/api/plaid/link/token/create');
      if (isMounted.current) {
        setLinkToken(response.data.link_token);
      }
    } catch (error) {
      console.error('Error getting link token:', error);
      if (isMounted.current) {
        setError('Failed to get link token');
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      setLinkToken(null);
      setAccessToken(null);
    };
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!accessToken || !isMounted.current) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5001/api/plaid/transactions/sync', {
        access_token: accessToken
      });
      
      if (isMounted.current) {
        const transactions = response.data.transactions || [];
        
        // Get all unique business names
        const businessNames = Array.from(new Set(transactions.map(tx => tx.name)));

        // Send all business names at once
        const emissionsResponse = await axios.post('http://localhost:5001/api/business/classify/batch', {
          businessNames
        });

        // Create a map of business name to emissions data
        const emissionsMap = new Map(
          emissionsResponse.data.map((item: any) => [item.businessName, item])
        );

        // Map emissions data back to transactions
        const transactionsWithEmissions = transactions.map(tx => ({
          ...tx,
          emissions: emissionsMap.get(tx.name) || null
        }));

        setTransactions(transactionsWithEmissions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      if (isMounted.current) {
        setError('Failed to fetch transactions');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [accessToken]);

  return (
    <>
      <Script
        src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"
        strategy="beforeInteractive"
        onError={(e) => {
          console.error('Failed to load Plaid script:', e);
          setError('Failed to load Plaid script');
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Plaid Integration Test</h1>
          <div className="flex space-x-4">
            <button
              onClick={getLinkToken}
              disabled={!!linkToken}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Get Link Token
            </button>
            <button
              onClick={() => open()}
              disabled={!ready || !linkToken}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
            >
              Open Plaid Link
            </button>
            <button
              onClick={fetchTransactions}
              disabled={!accessToken || loading}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-300"
            >
              {loading ? 'Loading...' : 'Fetch Transactions'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {transactions.length > 0 && (
          <>
            <MonthlyComparison transactions={transactions} />
            <CarbonDistanceHeadline transactions={transactions} />
            <CarbonMetrics transactions={transactions} />
            
            {categoryEmissions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Carbon Emissions Distribution</h2>
                <div className="mb-4">
                  <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">
                    Showing data for: {new Date(dateRanges.latest.getTime() - (daysToInclude * 24 * 60 * 60 * 1000)).toLocaleDateString()} - {dateRanges.latest.toLocaleDateString()}
                  </label>
                  <input
                    type="range"
                    id="dateRange"
                    min="7"
                    max={Math.max(dateRanges.totalDays, 7)}
                    value={daysToInclude}
                    onChange={(e) => setDaysToInclude(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>7 days</span>
                    <span>{dateRanges.totalDays} days</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Most Recent: {dateRanges.latest.toLocaleDateString()}</span>
                    <span>Earliest: {dateRanges.earliest.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="h-[400px]">
                  <EmissionsPieChart data={categoryEmissions} />
                </div>
                <div className="text-center mt-4 text-gray-600">
                  Total Carbon Emissions: {categoryEmissions.reduce((sum, item) => sum + item.value, 0).toFixed(5)} kg CO2e
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <Transactions
                transactions={transactions.map(tx => ({
                  date: tx.date,
                  description: tx.name,
                  amount: tx.amount,
                  category: Array.isArray(tx.category) ? tx.category[0] : tx.category || 'Uncategorized',
                  carbon_emissions: tx.emissions ? {
                    description: tx.emissions.industry,
                    intensity: tx.emissions.emissionFactor ? `${tx.emissions.emissionFactor.factor} ${tx.emissions.emissionFactor.unit}` : 'N/A'
                  } : undefined,
                  calculated_emissions_kg: tx.emissions?.emissionFactor ? 
                    Math.abs(tx.amount) * tx.emissions.emissionFactor.factor : 0
                }))}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
} 