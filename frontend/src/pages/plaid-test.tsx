import { useState } from 'react';
import { usePlaidLink, PlaidLinkProps } from 'react-plaid-link';
import axios from 'axios';

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
        )}
      </div>
    </div>
  );
} 