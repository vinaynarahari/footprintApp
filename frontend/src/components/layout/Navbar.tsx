import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserCircle } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '#how-it-works', isScroll: true },
];

const scrollToSection = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(localStorage.getItem('token') !== null);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't render anything until after hydration
  if (!mounted) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled ? 'bg-black shadow-lg' : 'bg-white'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full ${isScrolled ? 'bg-white' : 'bg-black'}`} />
              <span className={`text-xl font-semibold ${isScrolled ? 'text-white' : 'text-black'}`}>
                Footprint
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:space-x-8">
            {navigation.map((item) => (
              item.isScroll ? (
                <button
                  key={item.name}
                  onClick={() => scrollToSection('how-it-works')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    router.pathname === item.href
                      ? isScrolled 
                        ? 'border-white text-white' 
                        : 'border-black text-gray-900'
                      : isScrolled
                        ? 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    router.pathname === item.href
                      ? isScrolled 
                        ? 'border-white text-white' 
                        : 'border-black text-gray-900'
                      : isScrolled
                        ? 'border-transparent text-gray-300 hover:border-gray-300 hover:text-white'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setIsAuthenticated(false);
                  router.push('/login');
                }}
                className={`text-sm font-medium ${
                  isScrolled 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium ${
                    isScrolled 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={`text-sm font-medium px-3.5 py-2.5 rounded-md ${
                    isScrolled 
                      ? 'bg-white text-black hover:bg-gray-100' 
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden">
            <button
              type="button"
              className={`inline-flex items-center justify-center rounded-md p-2 ${
                isScrolled 
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-500'
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden ${isScrolled ? 'bg-black' : 'bg-white'}`}>
        <div className="space-y-1 pb-3 pt-2">
          {navigation.map((item) => (
            item.isScroll ? (
              <button
                key={item.name}
                onClick={() => {
                  scrollToSection('how-it-works');
                  setIsOpen(false);
                }}
                className={`block w-full text-left border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                  router.pathname === item.href
                    ? isScrolled
                      ? 'border-white text-white bg-gray-900'
                      : 'border-black text-black bg-gray-50'
                    : isScrolled
                      ? 'border-transparent text-gray-300 hover:border-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                  router.pathname === item.href
                    ? isScrolled
                      ? 'border-white text-white bg-gray-900'
                      : 'border-black text-black bg-gray-50'
                    : isScrolled
                      ? 'border-transparent text-gray-300 hover:border-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {item.name}
              </Link>
            )
          ))}
          {isAuthenticated ? (
            <button
              onClick={() => {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                router.push('/login');
              }}
              className={`block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium ${
                isScrolled
                  ? 'text-gray-300 hover:border-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              Sign out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className={`block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium ${
                  isScrolled
                    ? 'text-gray-300 hover:border-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={`block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium ${
                  isScrolled
                    ? 'text-gray-300 hover:border-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 