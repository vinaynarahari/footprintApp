import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-semibold text-gray-900 tracking-tight">
                Footprint
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link 
              href="/"
              className={`text-sm font-medium ${
                router.pathname === '/' 
                  ? 'text-black' 
                  : 'text-gray-500 hover:text-gray-900'
              } transition-colors duration-200`}
            >
              Home
            </Link>
            <Link 
              href="/dashboard"
              className={`text-sm font-medium ${
                router.pathname === '/dashboard' 
                  ? 'text-black' 
                  : 'text-gray-500 hover:text-gray-900'
              } transition-colors duration-200`}
            >
              Dashboard
            </Link>
            <Link 
              href="/transactions"
              className={`text-sm font-medium ${
                router.pathname === '/transactions' 
                  ? 'text-black' 
                  : 'text-gray-500 hover:text-gray-900'
              } transition-colors duration-200`}
            >
              Transactions
            </Link>
            <Link 
              href="/login"
              className="text-sm font-medium text-white bg-black px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden bg-white border-b border-gray-100`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`block px-3 py-2 text-base font-medium ${
              router.pathname === '/'
                ? 'text-black bg-gray-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`block px-3 py-2 text-base font-medium ${
              router.pathname === '/dashboard'
                ? 'text-black bg-gray-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/transactions"
            className={`block px-3 py-2 text-base font-medium ${
              router.pathname === '/transactions'
                ? 'text-black bg-gray-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Transactions
          </Link>
          <Link
            href="/login"
            className="block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 