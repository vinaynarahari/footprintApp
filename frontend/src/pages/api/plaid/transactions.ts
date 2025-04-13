import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the access token from the request body or query parameters
    const access_token = req.method === 'POST' ? req.body?.access_token : req.query.access_token;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }
    
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      // Generate mock transactions
      const mockTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `tx_${i}`,
        name: `Transaction ${i + 1}`,
        amount: Math.random() * 100,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: ['Food', 'Transportation', 'Shopping', 'Utilities', 'Entertainment'][Math.floor(Math.random() * 5)],
        eco_friendly: Math.random() > 0.5,
        merchant_name: `Merchant ${i + 1}`,
        personal_finance_category: {
          primary: ['Food and Drink', 'Transportation', 'Shopping', 'Utilities', 'Entertainment'][Math.floor(Math.random() * 5)],
          detailed: ['Groceries', 'Public Transit', 'Clothing', 'Electric', 'Movies'][Math.floor(Math.random() * 5)]
        }
      }));
      
      return res.status(200).json({ transactions: mockTransactions });
    }
    
    // In production, fetch transactions from the backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/plaid/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
} 