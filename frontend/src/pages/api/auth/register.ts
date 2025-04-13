import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if we're in development mode
    if (!process.env.NEXT_PUBLIC_AUTH_URL) {
      console.log('Using mock registration (NEXT_PUBLIC_AUTH_URL not set)');
      // Mock registration for development
      return res.status(200).json({
        id: '1',
        name: fullName,
        email: email,
        token: 'mock-token-for-development'
      });
    }

    // Here you would typically make a request to your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 