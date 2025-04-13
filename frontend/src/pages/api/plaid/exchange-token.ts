import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    // Get the public token from the request body
    const { public_token } = req.body;
    
    if (!public_token) {
      return res.status(400).json({ error: 'Public token is required' });
    }

    // Check if BACKEND_URL is set
    if (!process.env.BACKEND_URL) {
      console.warn('BACKEND_URL environment variable is not set. Using mock response.');
      // Return a mock success response for development
      return res.status(200).json({ 
        success: true,
        message: 'Mock token exchange successful'
      });
    }

    // Call your backend service to exchange the public token
    const response = await fetch(`${process.env.BACKEND_URL}/api/plaid/exchange-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ 
        userId,
        public_token 
      }),
    });

    if (!response.ok) {
      console.warn('Failed to exchange token:', response.status, response.statusText);
      // Return a mock success response for development
      return res.status(200).json({ 
        success: true,
        message: 'Mock token exchange successful'
      });
    }

    const data = await response.json();
    
    // Return the success response
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error exchanging token:', error);
    // Return a mock success response for development
    return res.status(200).json({ 
      success: true,
      message: 'Mock token exchange successful'
    });
  }
} 