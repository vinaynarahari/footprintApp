import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

export default function Dashboard() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [plaidLoaded, setPlaidLoaded] = useState(false);

  // Function to get link token from our backend
  const getLinkToken = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'exists' : 'missing');
      
      if (!token) {
        router.push('/login');
        return;
      }

      console.log('Fetching link token from backend...');
      const response = await fetch('http://localhost:5001/api/plaid/link/token/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Backend response:', data);
      
      if (response.ok) {
        setLinkToken(data.link_token);
        console.log('Link token set successfully');
      } else {
        setMessage('Error getting Plaid link token');
        console.error('Error response:', data);
      }
    } catch (error) {
      setMessage('Error connecting to server');
      console.error('Fetch error:', error);
    }
  };

  // Exchange public token for access token
  const handleOnSuccess = async (public_token: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/plaid/item/public_token/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ public_token })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Successfully connected bank account!');
      } else {
        setMessage('Error connecting bank account');
      }
    } catch (error) {
      setMessage('Error connecting to server');
    }
  };

  const openPlaidLink = () => {
    console.log('Opening Plaid Link...');
    console.log('linkToken:', linkToken ? 'exists' : 'missing');
    console.log('plaidLoaded:', plaidLoaded);
    
    if (!linkToken || !plaidLoaded) {
      console.log('Cannot open Plaid Link - missing requirements');
      return;
    }
    
    // @ts-ignore
    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: (public_token: string) => handleOnSuccess(public_token),
      onExit: () => console.log('User exited Plaid Link'),
      onLoad: () => console.log('Plaid Link loaded'),
      onEvent: (eventName: string, metadata: any) => console.log('Plaid event:', eventName, metadata),
      language: 'en',
      countryCodes: ['US']
    });
    
    handler.open();
  };

  useEffect(() => {
    console.log('Dashboard mounted, getting link token...');
    getLinkToken();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes('Successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Connect Your Bank Account</h2>
        <button
          onClick={openPlaidLink}
          disabled={!linkToken || !plaidLoaded}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect with Plaid
        </button>
        <div className="mt-2 text-sm text-gray-500">
          Status: {!linkToken ? 'Waiting for link token...' : !plaidLoaded ? 'Loading Plaid...' : 'Ready to connect'}
        </div>
      </div>
      
      <Script 
        src="https://cdn.plaid.com/link/v2/stable/link-initialize.js" 
        onLoad={() => {
          console.log('Plaid script loaded');
          setPlaidLoaded(true);
        }}
      />
    </div>
  );
} 