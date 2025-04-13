import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { public_token } = req.body;
    
    if (!public_token) {
      return res.status(400).json({ error: 'Public token is required' });
    }
    
    // For development, return a mock access token
    if (process.env.NODE_ENV === 'development') {
      // Generate a mock access token
      const mockAccessToken = `access-sandbox-${Math.random().toString(36).substring(2, 15)}`;
      
      // Simulate processing transactions
      console.log('Processing transactions with mock access token...');
      
      // Return the access token
      return res.status(200).json({ 
        access_token: mockAccessToken,
        item_id: 'mock-item-id',
        transaction_count: 10
      });
    }
    
    // In production, exchange the public token for an access token
    const response = await fetch(`${process.env.BACKEND_URL}/api/plaid/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to exchange token');
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error exchanging token:', error);
    return res.status(500).json({ error: 'Failed to exchange token' });
  }
} 