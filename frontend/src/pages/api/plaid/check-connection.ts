import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if we have an access token in the request body
    const { access_token } = req.body;
    
    if (access_token) {
      // For development, just return true if we have an access token
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({ isConnected: true });
      }

      // In production, verify the access token
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/plaid/verify-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token }),
        });

        if (response.ok) {
          return res.status(200).json({ isConnected: true });
        }
      } catch (error) {
        console.error('Error verifying access token:', error);
      }

      return res.status(200).json({ isConnected: false });
    }
    
    // If no access token provided, return not connected
    return res.status(200).json({ isConnected: false });
  } catch (error) {
    console.error('Error checking connection:', error);
    return res.status(200).json({ isConnected: false });
  }
} 