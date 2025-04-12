import { useState } from 'react';
import { usePlaidLink, PlaidLinkProps } from 'react-plaid-link';
import axios from 'axios';

interface Transaction {
  transaction_id: string;
  date: string;
  name: string;
  amount: number;
  category?: string[];
  emissions?: {
    industry: string;
    emissionFactor: {
      industry: string;
      factor: number;
      unit: string;
      description: string;
    };
  };
}

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
      const response = await fetch('http://localhost:5001/api/plaid/transactions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      console.log('Raw transactions data:', data);

      // Get unique business names
      const uniqueBusinessNames = Array.from(new Set(data.transactions.map((t: Transaction) => t.name)));
      console.log('Unique business names:', uniqueBusinessNames);

      // Classify all businesses at once
      const emissionsResponse = await fetch('http://localhost:5001/api/business/classify/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessNames: uniqueBusinessNames }),
      });

      if (!emissionsResponse.ok) {
        throw new Error('Failed to fetch emissions data');
      }

      const emissionsData = await emissionsResponse.json();
      console.log('Emissions data:', emissionsData);

      // Create a map of business names to emissions data
      const emissionsMap = new Map(emissionsData.map((item: any) => [item.businessName, item]));

      // Add emissions data to transactions
      const transactionsWithEmissions = data.transactions.map((transaction: Transaction) => ({
        ...transaction,
        emissions: emissionsMap.get(transaction.name),
      }));

      setTransactions(transactionsWithEmissions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const config: PlaidLinkProps = {
    token: linkToken,
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
    onExit: () => {
      console.log('Link exited');
    },
    onEvent: (eventName: string) => {
      console.log('Event:', eventName);
    }
  };

  const { open, ready } = usePlaidLink(config);

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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {transactions.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Transaction History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carbon Emissions
                    </th>
                    <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classification
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.transaction_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.emissions ? (
                          <div className="font-medium">
                            {(transaction.emissions.emissionFactor.factor * Math.abs(transaction.amount)).toFixed(2)} {transaction.emissions.emissionFactor.unit.split('/')[0]}
                          </div>
                        ) : (
                          <div className="text-gray-400">Loading...</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.emissions ? (
                          <div className="text-gray-600">
                            {transaction.emissions.emissionFactor.industry}
                          </div>
                        ) : (
                          <div className="text-gray-400">Loading...</div>
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
    </div>
  );
} 