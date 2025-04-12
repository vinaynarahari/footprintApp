import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4">Welcome to Footprint</h1>
      <p className="text-xl mb-8">Track your spending and manage your finances with ease.</p>
      <div className="space-x-4">
        <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Get Started
        </Link>
        <Link to="/link" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Link Your Account
        </Link>
      </div>
    </div>
  );
};

export default Home; 