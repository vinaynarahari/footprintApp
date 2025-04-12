'use client';

import React, { useState } from 'react';

export default function CarbonEmissions() {
  const [businessName, setBusinessName] = useState('');
  const [result, setResult] = useState<{
    industry: string;
    emissionFactor: {
      industry: string;
      factor: number;
      unit: string;
      description: string;
    } | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const classifyBusiness = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5001/api/business/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessName }),
      });

      if (!response.ok) {
        throw new Error('Failed to classify business');
      }

      const data = await response.json();
      setResult(data);
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
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold">Classification Result:</h3>
              <p className="mt-2">{result.industry}</p>
              
              {result.emissionFactor ? (
                <div className="mt-4">
                  <h4 className="text-md font-semibold">Emission Factor:</h4>
                  <p className="mt-1">Industry: {result.emissionFactor.industry}</p>
                  <p className="mt-1">Factor: {result.emissionFactor.factor} {result.emissionFactor.unit}</p>
                  <p className="mt-1 text-sm text-gray-600">{result.emissionFactor.description}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-yellow-600">No matching emission factor found for this industry.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 