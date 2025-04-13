import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlaidLink, PlaidLinkProps } from 'react-plaid-link';
import axios from 'axios';
import { useRouter } from 'next/router';
import Script from 'next/script';

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

export default function PlaidTest() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
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
        )}
      </div>
    </>
  );
} 