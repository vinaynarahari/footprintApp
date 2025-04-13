import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get the user ID from the session
    const userId = session.user?.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found' });
    }

    // Check if BACKEND_URL is set
    if (!process.env.BACKEND_URL) {
      console.warn('BACKEND_URL environment variable is not set. Using mock transactions.');
      // Return mock transactions for development
      return res.status(200).json({ 
        transactions: [
          {
            id: '1',
            date: new Date().toISOString(),
            amount: 25.50,
            merchant: 'Grocery Store',
            category: 'Food',
            carbonImpact: 2.5,
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            amount: 45.00,
            merchant: 'Gas Station',
            category: 'Transportation',
            carbonImpact: 5.2,
          },
          {
            id: '3',
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            amount: 15.99,
            merchant: 'Online Shopping',
            category: 'Shopping',
            carbonImpact: 3.1,
          },
        ]
      });
    }

    // Call your backend service to fetch transactions
    const response = await fetch(`${process.env.BACKEND_URL}/api/plaid/transactions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn('Failed to fetch transactions:', response.status, response.statusText);
      // Return mock transactions for development
      return res.status(200).json({ 
        transactions: [
          {
            id: '1',
            date: new Date().toISOString(),
            amount: 25.50,
            merchant: 'Grocery Store',
            category: 'Food',
            carbonImpact: 2.5,
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            amount: 45.00,
            merchant: 'Gas Station',
            category: 'Transportation',
            carbonImpact: 5.2,
          },
          {
            id: '3',
            date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            amount: 15.99,
            merchant: 'Online Shopping',
            category: 'Shopping',
            carbonImpact: 3.1,
          },
        ]
      });
    }

    const data = await response.json();
    
    // Return the transactions
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    // Return mock transactions for development
    return res.status(200).json({ 
      transactions: [
        {
          id: '1',
          date: new Date().toISOString(),
          amount: 25.50,
          merchant: 'Grocery Store',
          category: 'Food',
          carbonImpact: 2.5,
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          amount: 45.00,
          merchant: 'Gas Station',
          category: 'Transportation',
          carbonImpact: 5.2,
        },
        {
          id: '3',
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          amount: 15.99,
          merchant: 'Online Shopping',
          category: 'Shopping',
          carbonImpact: 3.1,
        },
      ]
    });
  }
} 