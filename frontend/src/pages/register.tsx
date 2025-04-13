import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const facts = [
  {
    text: "The average person's yearly carbon footprint is 4 tons of CO₂",
    image: "/forest.jpg"
  },
  {
    text: "Just one tree can absorb 48 pounds of CO₂ per year",
    image: "/tree.jpg"
  },
  {
    text: "75% of our carbon footprint comes from transportation and household energy",
    image: "/mountain.jpg"
  }
];

const AuthPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % facts.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = activeTab === 'login' ? '/auth/login' : '/auth/register';
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activeTab === 'login' ? {
          email: formData.email,
          password: formData.password
        } : formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Store the token
      localStorage.setItem('token', data.token);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Carousel */}
      <div className="hidden lg:flex w-1/2 relative bg-black">
        <Link 
          href="/" 
          className="absolute top-4 left-4 z-30 text-white/60 hover:text-white text-sm flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Home
        </Link>

        {facts.map((fact, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentSlide === index ? 1 : 0 }}
            transition={{ duration: 1 }}
            className={`absolute inset-0 ${currentSlide === index ? 'z-10' : 'z-0'}`}
          >
            <div className="absolute inset-0 bg-black/50 z-10" />
            <Image
              src={fact.image}
              alt="Nature"
              fill
              priority
              quality={100}
              className="object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center p-12">
              <p className="text-white text-3xl font-medium text-center leading-relaxed">
                {fact.text}
              </p>
            </div>
          </motion.div>
        ))}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {facts.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-white to-gray-100">
        <div className="absolute top-4 left-4 lg:hidden">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back home
          </Link>
        </div>
        
        <div className="max-w-md mx-auto pt-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-flex items-center">
              <div className="w-10 h-10 bg-black rounded-full mr-2" />
              <span className="text-2xl font-medium text-black">Footprint</span>
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/70 backdrop-blur-xl rounded-xl p-6 border border-gray-200 shadow-xl shadow-gray-200/20"
          >
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {activeTab === 'register' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                      placeholder="John Doe"
                      required={activeTab === 'register'}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-black text-white rounded-md font-medium hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {activeTab === 'login' ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    activeTab === 'login' ? 'Sign In' : 'Create Account'
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  {activeTab === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('register');
                          setError('');
                        }}
                        className="text-gray-900 hover:text-gray-700 transition-colors font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setError('');
                        }}
                        className="text-gray-900 hover:text-gray-700 transition-colors font-medium"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 