import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { usePlaidLink, PlaidLinkProps } from 'react-plaid-link';
import axios from 'axios';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Transaction {
  date: string;
  name: string;
  amount: number;
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
  const isMounted = useRef(true);

  // Calculate category emissions for the pie chart
  const categoryEmissions = useMemo(() => {
    if (!transactions.length) return [];

    // Calculate total emissions for each category
    const categoryTotals = new Map<string, number>();
    let totalEmissions = 0;

    transactions.forEach(tx => {
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
  }, [transactions]);

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
            {categoryEmissions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Carbon Emissions Distribution</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryEmissions}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percentage }) => {
                          const shortName = name.length > 20 ? name.substring(0, 20) + '...' : name;
                          return `${shortName} (${percentage.toFixed(1)}%)`;
                        }}
                        outerRadius={150}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        isAnimationActive={true}
                        paddingAngle={2}
                      >
                        {categoryEmissions.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(2)} kg CO2e`, 'Emissions']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '8px'
                        }}
                        labelStyle={{ fontWeight: 'bold' }}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        wrapperStyle={{ 
                          paddingLeft: '20px',
                          fontSize: '12px'
                        }}
                        formatter={(value: string) => {
                          const shortName = value.length > 25 ? value.substring(0, 25) + '...' : value;
                          return shortName;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-4 text-gray-600">
                  Total Carbon Emissions: {categoryEmissions.reduce((sum, item) => sum + item.value, 0).toFixed(2)} kg CO2e
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-left">Carbon Emissions</th>
                      <th className="px-4 py-2 text-right">Calculated Emissions (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{new Date(transaction.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{transaction.name}</td>
                        <td className="px-4 py-2 text-right">
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          {transaction.emissions ? (
                            <div>
                              <div className="font-semibold">{transaction.emissions.industry}</div>
                              {transaction.emissions.emissionFactor ? (
                                <div className="text-sm">
                                  <div>{transaction.emissions.emissionFactor.factor} {transaction.emissions.emissionFactor.unit}</div>
                                  <div className="text-gray-600">{transaction.emissions.emissionFactor.description}</div>
                                </div>
                              ) : (
                                <div className="text-sm text-yellow-600">No emission factor found</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Loading emissions...</div>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {transaction.emissions?.emissionFactor ? (
                            <div>
                              {(Math.abs(transaction.amount) * transaction.emissions.emissionFactor.factor).toFixed(3)} kg
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">-</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
} 