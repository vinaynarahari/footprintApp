'use client';

import React, { useState } from 'react';

export default function CarbonEmissions() {
  const [businessName, setBusinessName] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const classifyBusiness = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:5001/api/business/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: businessName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to classify business');
      }

      const data = await response.json();
      setResult(data.industry);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Business Classifier</h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter business name"
            />
          </div>

          <button
            onClick={classifyBusiness}
            disabled={loading || !businessName}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? 'Classifying...' : 'Classify Business'}
          </button>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-50 rounded-md">
              <h2 className="text-lg font-medium text-green-800">Industry:</h2>
              <p className="mt-1 text-green-700">{result}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 