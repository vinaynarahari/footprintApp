import { useState, useMemo, useEffect } from 'react';
import { usePlaidLink, PlaidLinkProps } from 'react-plaid-link';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLinkToken = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/plaid/link/token/create');
      setLinkToken(response.data.link_token);
    } catch (error) {
      console.error('Error getting link token:', error);
      setError('Failed to get link token');
    }
  };

  const fetchTransactions = async () => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5001/api/plaid/transactions/sync', {
        access_token: accessToken
      });
      
      console.log('Raw transactions response:', response.data);
      
      const transactions = response.data.transactions || [];
      
      // Get all unique business names
      const businessNames = Array.from(new Set(transactions.map(tx => tx.name)));
      console.log('Unique business names:', businessNames);

      // Send all business names at once
      const emissionsResponse = await axios.post('http://localhost:5001/api/business/classify/batch', {
        businessNames
      });

      console.log('Batch emissions response:', emissionsResponse.data);

      // Create a map of business name to emissions data
      const emissionsMap = new Map(
        emissionsResponse.data.map((item: any) => [item.businessName, item])
      );

      // Map emissions data back to transactions
      const transactionsWithEmissions = transactions.map(tx => ({
        ...tx,
        emissions: emissionsMap.get(tx.name) || null
      }));

      console.log('Final transactions with emissions:', transactionsWithEmissions);
      setTransactions(transactionsWithEmissions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const config: PlaidLinkProps = {
    token: linkToken || '',
    onSuccess: (public_token: string) => {
      console.log('Success! Public token:', public_token);
      
      axios.post('http://localhost:5001/api/plaid/item/public_token/exchange', {
        public_token: public_token
      })
      .then(response => {
        console.log('Access token:', response.data.access_token);
        setAccessToken(response.data.access_token);
      })
      .catch(error => {
        console.error('Error exchanging public token:', error);
        setError('Failed to exchange public token');
      });
    },
    onExit: (err: any, metadata: any) => {
      console.log('Link exited', { err, metadata });
      if (err) {
        setError(`Plaid Link Error: ${err.display_message || err.error_message}`);
      }
    },
    onEvent: (eventName: string, metadata: any) => {
      console.log('Event:', eventName, metadata);
    },
    onLoad: () => {
      console.log('Plaid Link loaded');
    }
  };

  const { open, ready } = usePlaidLink(config);

  const categoryEmissions = useMemo(() => {
    const emissionsMap = new Map<string, { value: number; name: string }>();

    transactions.forEach(transaction => {
      if (transaction.emissions?.emissionFactor) {
        const category = transaction.emissions.industry;
        const amount = Math.abs(transaction.amount);
        const factor = transaction.emissions.emissionFactor.factor;
        const value = amount * factor;

        const current = emissionsMap.get(category);
        if (current) {
          current.value += value;
        } else {
          emissionsMap.set(category, { value, name: category });
        }
      }
    });

    const totalEmissions = Array.from(emissionsMap.values()).reduce((sum, item) => sum + item.value, 0);

    return Array.from(emissionsMap.values())
      .map(item => ({
        ...item,
        percentage: (item.value / totalEmissions) * 100
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold mb-4">Plaid Integration Test</h1>
          <div className="space-x-4">
            <button
              onClick={getLinkToken}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Get Link Token
            </button>
            <button
              onClick={() => linkToken ? open() : setError('Please get a link token first')}
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {transactions.length > 0 && (
          <>
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-bold mb-4">Carbon Emissions Distribution</h2>
              {categoryEmissions.length > 0 ? (
                <div className="h-[500px]">
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
                        outerRadius={180}
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
                  <div className="text-center mt-4 text-gray-600">
                    Total Carbon Emissions: {categoryEmissions.reduce((sum, item) => sum + item.value, 0).toFixed(2)} kg CO2e
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No emission data available to display
                </div>
              )}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-left">Category</th>
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
                          {transaction.category ? (Array.isArray(transaction.category) ? transaction.category.join(', ') : transaction.category) : 'Uncategorized'}
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
    </div>
  );
} 