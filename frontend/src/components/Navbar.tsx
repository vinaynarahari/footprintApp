import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Footprint</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-blue-200">Home</Link>
          <Link to="/register" className="hover:text-blue-200">Register</Link>
          <Link to="/link" className="hover:text-blue-200">Link Account</Link>
          <Link to="/transactions" className="hover:text-blue-200">Transactions</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 