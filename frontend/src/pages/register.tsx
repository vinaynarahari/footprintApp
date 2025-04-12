import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

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
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % facts.length);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

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
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
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
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                  placeholder="••••••••"
                />
              </div>

              <button className="w-full py-3 px-4 bg-black text-white rounded-md font-medium hover:bg-gray-900 transition-colors">
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <p className="text-sm text-gray-500 text-center">
                {activeTab === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setActiveTab('register')}
                      className="text-gray-900 hover:text-gray-700 transition-colors font-medium"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => setActiveTab('login')}
                      className="text-gray-900 hover:text-gray-700 transition-colors font-medium"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 