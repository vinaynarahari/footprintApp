import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePlaidLink, PlaidLinkProps } from 'react-plaid-link';
import axios from 'axios';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { usePlaidScript } from '../hooks/usePlaidScript';
import EmissionsPieChart from '../components/EmissionsPieChart';
import TopEmissions from '../components/TopEmissions';
import TransactionList from '../components/TransactionList';
import MonthlyCarbonFootprint from '../components/MonthlyCarbonFootprint';
import CarbonMetrics from '../components/CarbonMetrics';
import Transactions from '../components/Transactions';
import MonthlyComparison from '../components/MonthlyComparison';
import CarbonDistanceHeadline from '../components/CarbonDistanceHeadline';
import { calculateCO2 } from '../utils/co2';

interface EmissionFactor {
  industry: string;
  factor: number;
  unit: string;
}

interface EmissionsData {
  businessName: string;
  industry: string;
  emissionFactor: EmissionFactor | null;
}

interface Transaction {
  date: string;
  name: string;
  amount: number;
  category: string[];
  merchant_name?: string;
  personal_finance_category?: {
    primary: string;
    detailed: string;
  };
  calculated_emissions_kg?: number;
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

  // Use our custom hook to load the Plaid script
  const { isLoaded: isPlaidScriptLoaded, error: plaidScriptError } = usePlaidScript();
  
  // Update error state if Plaid script fails to load
  useEffect(() => {
    if (plaidScriptError) {
      setError('Failed to load Plaid script. Please refresh the page.');
    }
  }, [plaidScriptError]);

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
      if (tx.calculated_emissions_kg) {
        const category = tx.personal_finance_category?.primary || tx.category[0] || 'Uncategorized';
        categoryTotals.set(
          category,
          (categoryTotals.get(category) || 0) + tx.calculated_emissions_kg
        );
        totalEmissions += tx.calculated_emissions_kg;
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
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ public_token })
      });

      if (!response.ok) {
        throw new Error('Failed to exchange token');
      }

      const data = await response.json();
      
      if (isMounted.current) {
        setAccessToken(data.access_token);
        localStorage.setItem('plaid_access_token', data.access_token);
      }
    } catch (error) {
      console.error('Error exchanging public token:', error);
      if (isMounted.current) {
        setError('Failed to exchange public token');
      }
    }
  }, []);

  const onExit = useCallback((err?: Error | null) => {
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
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const data = await response.json();
      
      if (isMounted.current) {
        setLinkToken(data.link_token);
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
      const response = await fetch('/api/plaid/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      
      if (isMounted.current) {
        // Get all unique business names
        const businessNames = Array.from(new Set(data.transactions.map((tx: Transaction) => tx.merchant_name || tx.name)));

        // Send all business names at once for classification
        const emissionsResponse = await fetch('/api/business/classify/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ businessNames })
        });

        if (!emissionsResponse.ok) {
          throw new Error('Failed to classify businesses');
        }

        const emissionsData = await emissionsResponse.json();

        // Create a map of business name to emissions data
        const emissionsMap = new Map(
          emissionsData.map((item: EmissionsData) => [item.businessName, item])
        );

        // Map emissions data back to transactions
        const transactionsWithEmissions = data.transactions.map((tx: Transaction) => {
          const businessName = tx.merchant_name || tx.name;
          const emissionsInfo = emissionsMap.get(businessName) as EmissionsData | undefined;
          
          return {
            ...tx,
            calculated_emissions_kg: emissionsInfo?.emissionFactor ? 
              Math.abs(tx.amount) * emissionsInfo.emissionFactor.factor : 0
          };
        });

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

  // Check for stored access token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('plaid_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Plaid Test | Footprint</title>
      </Head>
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
                  description: tx.merchant_name || tx.name,
                  amount: tx.amount,
                  category: tx.personal_finance_category?.primary || (Array.isArray(tx.category) ? tx.category[0] : tx.category) || 'Uncategorized',
                  carbon_emissions: {
                    description: tx.personal_finance_category?.primary || tx.category[0] || 'Uncategorized',
                    intensity: `${tx.calculated_emissions_kg?.toFixed(5)} kg CO2e`
                  },
                  calculated_emissions_kg: tx.calculated_emissions_kg || 0
                }))}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
} 