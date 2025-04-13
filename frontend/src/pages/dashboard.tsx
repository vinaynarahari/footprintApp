import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { IconUser, IconCalendar, IconChartBar, IconChartPie, IconSettings, IconLogout } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { usePlaidLink } from "react-plaid-link";
import Head from 'next/head';
import { usePlaidScript } from '../hooks/usePlaidScript';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

// Define colors for the pie chart
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C43', '#A4DE6C', '#D0ED57'
];

// Mock data for the pie chart
const spendingCategories = [
  { name: 'Transportation', value: 35, color: '#4285F4' },
  { name: 'Food', value: 25, color: '#34A853' },
  { name: 'Shopping', value: 20, color: '#FBBC05' },
  { name: 'Utilities', value: 15, color: '#7B61FF' },
  { name: 'Entertainment', value: 5, color: '#EA4335' },
];

// Mock data for the CO2 emissions graph
const timeRanges = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

// Mock data for different time ranges
const emissionsData = {
  day: [
    { time: '12 AM', value: 5.2 },
    { time: '4 AM', value: 3.8 },
    { time: '8 AM', value: 8.4 },
    { time: '12 PM', value: 12.1 },
    { time: '4 PM', value: 10.5 },
    { time: '8 PM', value: 7.2 },
    { time: '11 PM', value: 4.8 },
  ],
  week: [
    { time: 'Mon', value: 45.2 },
    { time: 'Tue', value: 42.8 },
    { time: 'Wed', value: 48.4 },
    { time: 'Thu', value: 52.1 },
    { time: 'Fri', value: 55.5 },
    { time: 'Sat', value: 47.2 },
    { time: 'Sun', value: 38.8 },
  ],
  month: [
    { time: 'Week 1', value: 125.2 },
    { time: 'Week 2', value: 142.8 },
    { time: 'Week 3', value: 138.4 },
    { time: 'Week 4', value: 152.1 },
  ],
  year: [
    { time: 'Jan', value: 158.4 },
    { time: 'Feb', value: 142.1 },
    { time: 'Mar', value: 156.8 },
    { time: 'Apr', value: 147.2 },
    { time: 'May', value: 152.9 },
    { time: 'Jun', value: 158.4 },
    { time: 'Jul', value: 162.3 },
    { time: 'Aug', value: 159.7 },
    { time: 'Sep', value: 154.2 },
    { time: 'Oct', value: 149.8 },
    { time: 'Nov', value: 145.6 },
    { time: 'Dec', value: 151.3 },
  ],
};

interface GraphScaling {
  min: number;
  max: number;
  labels: number[];
}

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string[];
  eco_friendly: boolean;
  merchant_name?: string;
  personal_finance_category?: {
    primary: string;
    detailed: string;
  };
}

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  value: number;  // For pie chart compatibility
  name: string;   // For pie chart compatibility
  color: string;  // For pie chart compatibility
}

interface EmissionsData {
  day: Array<{ date: string; value: number }>;
  week: Array<{ date: string; value: number }>;
  month: Array<{ date: string; value: number }>;
  year: Array<{ date: string; value: number }>;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false
    },
    global: {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      }
    }
  }
);

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth');
    },
  });
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('month');
  const [showProfile, setShowProfile] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isPlaidConnected, setIsPlaidConnected] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlaidPrompt, setShowPlaidPrompt] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const currentData = emissionsData[selectedTimeRange as keyof typeof emissionsData] || [];
  const [imageError, setImageError] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([]);
  const [co2Data, setCo2Data] = useState<EmissionsData>({
    day: [],
    week: [],
    month: [],
    year: []
  });
  const [totalCO2, setTotalCO2] = useState<number>(0);
  const [dateRangeText, setDateRangeText] = useState<string>('');
  
  // Calculate graph scaling values with padding
  const graphScaling = useMemo<GraphScaling>(() => {
    if (currentData.length === 0) return { min: 0, max: 100, labels: [0, 25, 50, 75, 100] };
    
    const values = currentData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;
    
    // Add 10% padding to top and bottom
    const padding = range * 0.1;
    const yMin = Math.max(0, minValue - padding); // Don't go below 0
    const yMax = maxValue + padding;
    
    // Calculate nice round numbers for the y-axis
    const niceMin = Math.floor(yMin);
    const niceMax = Math.ceil(yMax);
    
    // Generate intermediate points for y-axis labels
    const stepCount = 4;
    const stepSize = (niceMax - niceMin) / stepCount;
    const yAxisLabels = Array.from({ length: stepCount + 1 }, (_, i) => 
      niceMin + (stepSize * i)
    );
    
    return {
      min: niceMin,
      max: niceMax,
      labels: yAxisLabels,
    };
  }, [currentData]);
  
  // SVG path generator for pie chart segments
  const createPieSegment = (startAngle: number, endAngle: number, radius: number = 100) => {
    const start = {
      x: Math.cos(startAngle) * radius,
      y: Math.sin(startAngle) * radius
    };
    const end = {
      x: Math.cos(endAngle) * radius,
      y: Math.sin(endAngle) * radius
    };
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    
    return `M 0,0 L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArc} 1 ${end.x},${end.y} Z`;
  };

  // Calculate pie chart segments
  const totalSpending = spendingCategories.reduce((sum, category) => sum + category.value, 0);
  let currentAngle = -Math.PI / 2; // Start from top (-90 degrees)

  // Function to format Y-axis value based on time range
  const formatYAxisValue = (value: number) => {
    return `${value.toFixed(1)} kg`;
  };
  
  // Animation variants for the graph container
  const graphContainerVariants = {
    initial: {
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      scale: 1,
      opacity: 1,
    },
    exit: {
      scale: 1.2,
      opacity: 0,
    },
  };

  // Handle navigation to settings
  const handleSettingsClick = () => {
    setShowProfile(false);
    router.push('/settings');
  };

  // Handle sign out
  const handleSignOut = async () => {
    setShowProfile(false);
    // Clear Plaid access token on logout
    localStorage.removeItem('plaid_access_token');
    await signOut({ redirect: true, callbackUrl: '/auth' });
  };

  const getLinkToken = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Requesting link token...');
      const response = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Failed to create link token:', response.status, response.statusText);
        throw new Error(`Failed to create link token: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Link token received:', data.link_token ? 'Token received' : 'No token in response');
      setLinkToken(data.link_token);
    } catch (err) {
      console.error('Error getting link token:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupabaseData = async () => {
    setIsLoading(true);
    try {
      const access_token = localStorage.getItem('plaid_access_token');
      if (!access_token) {
        console.error('No access token found');
        return;
      }

      const response = await fetch(`/api/plaid/transactions?access_token=${access_token}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      
      if (!data.transactions || data.transactions.length === 0) {
        setTransactions([]);
        setSpendingCategories([]);
        setCo2Data({ day: [], week: [], month: [], year: [] });
        setTotalCO2(0);
        return;
      }

      // Store all transactions
      setTransactions(data.transactions);

      // Get filtered transactions based on time range
      const now = new Date();
      let startDate = new Date();
      
      switch (selectedTimeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }

      const filteredTransactions = data.transactions.filter(tx => 
        new Date(tx.date) >= startDate
      );

      // Process transactions for spending categories
      const categoryTotals: Record<string, number> = {};
      let totalAmount = 0;

      filteredTransactions.forEach(tx => {
        const category = tx.personal_finance_category?.primary || tx.category?.[0] || 'Uncategorized';
        const amount = Math.abs(Number(tx.amount));
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        totalAmount += amount;
      });

      const categories: SpendingCategory[] = Object.entries(categoryTotals)
        .map(([category, amount], colorIndex) => ({
          category,
          amount: Number(amount),
          percentage: (Number(amount) / totalAmount) * 100,
          value: (Number(amount) / totalAmount) * 100, // For pie chart
          name: category,
          color: COLORS[colorIndex % COLORS.length]
        }));

      setSpendingCategories(categories);

      // Helper function to calculate CO2 emissions for a transaction
      const calculateCO2 = (tx: any) => {
        const amount = Math.abs(Number(tx.amount));
        const category = tx.personal_finance_category?.primary || tx.category?.[0] || 'Uncategorized';
        
        // CO2 emission factors (kg CO2 per dollar) for different categories
        const emissionFactors: Record<string, number> = {
          'Food and Drink': 0.5,
          'Transportation': 0.8,
          'Shopping': 0.3,
          'Utilities': 0.6,
          'Entertainment': 0.4,
          'Travel': 1.2,
          'Healthcare': 0.2,
          'Education': 0.3,
          'Home': 0.4,
          'Personal Care': 0.3,
          'Uncategorized': 0.4
        };

        return amount * (emissionFactors[category] || 0.4);
      };

      // Calculate total CO2 emissions for filtered transactions
      const totalCO2 = filteredTransactions.reduce((sum, tx) => 
        sum + calculateCO2(tx), 0
      );

      setTotalCO2(totalCO2);

      // Process CO2 data for the graph
      const processedEmissions = filteredTransactions.reduce((acc: any, tx) => {
        const date = new Date(tx.date);
        const co2 = calculateCO2(tx);
        
        let timeKey;
        if (selectedTimeRange === 'day') {
          timeKey = date.getHours() + ':00';
        } else if (selectedTimeRange === 'week') {
          timeKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        } else if (selectedTimeRange === 'month') {
          timeKey = 'Week ' + Math.ceil((date.getDate()) / 7);
        } else {
          timeKey = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
        }
        
        if (!acc[timeKey]) {
          acc[timeKey] = 0;
        }
        acc[timeKey] += co2;
        return acc;
      }, {});

      // Convert to array format for the graph
      const graphData = Object.entries(processedEmissions)
        .map(([time, value]) => ({ time, value }))
        .sort((a, b) => {
          if (selectedTimeRange === 'week') {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days.indexOf(a.time) - days.indexOf(b.time);
          }
          return 0;
        });

      // Update graph data
      const newEmissionsData = {
        ...co2Data,
        [selectedTimeRange]: graphData
      };
      setCo2Data(newEmissionsData);

    } catch (err) {
      console.error('Error fetching transaction data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  // Use our custom hook to load the Plaid script
  const { isLoaded: isPlaidScriptLoaded, error: plaidScriptError } = usePlaidScript();
  
  // Update error state if Plaid script fails to load
  useEffect(() => {
    if (plaidScriptError) {
      setError('Failed to load Plaid script. Please refresh the page.');
    }
  }, [plaidScriptError]);

  // Check if bank is connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if we have a stored access token
        const storedAccessToken = localStorage.getItem('plaid_access_token');
        
        if (storedAccessToken) {
          console.log('Found stored access token, verifying connection...');
          setAccessToken(storedAccessToken);
          
          // Verify the access token is still valid
          const response = await fetch('/api/plaid/check-connection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ access_token: storedAccessToken }),
          });
          
          const data = await response.json();
          
          if (data.isConnected) {
            console.log('Stored access token is valid');
            setIsPlaidConnected(true);
            setShowPlaidPrompt(false);
            await fetchSupabaseData();
            return;
          } else {
            console.log('Stored access token is invalid, removing it');
            localStorage.removeItem('plaid_access_token');
          }
        }
        
        // If no stored token or token is invalid, check connection status
        const response = await fetch('/api/plaid/check-connection');
        const data = await response.json();
        setIsPlaidConnected(data.isConnected);
        
        // If connected, fetch the data
        if (data.isConnected) {
          await fetchSupabaseData();
        }
        
        // Delay showing the prompt to ensure smooth animation
        setTimeout(() => {
          setShowPlaidPrompt(!data.isConnected);
        }, 100);
      } catch (error) {
        console.error('Error checking bank connection:', error);
        setIsPlaidConnected(false);
        setTimeout(() => {
          setShowPlaidPrompt(true);
        }, 100);
      }
    };

    checkConnection();
  }, []);

  // Fetch data when time range changes
  useEffect(() => {
    if (isPlaidConnected) {
      fetchSupabaseData();
    }
  }, [selectedTimeRange]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (public_token: string) => handlePlaidSuccess(public_token, {}),
    onExit: () => handlePlaidExit(null, {}),
  });

  // Automatically open Plaid Link when ready and prompt is shown
  useEffect(() => {
    if (ready && showPlaidPrompt && linkToken) {
      open();
    }
  }, [ready, showPlaidPrompt, linkToken, open]);

  const handlePlaidSuccess = async (public_token: string, metadata: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Exchanging public token for access token...');
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ public_token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to exchange token');
      }

      const data = await response.json();
      console.log('Token exchange successful:', data);
      
      // Store the access token in localStorage
      if (data.access_token) {
        localStorage.setItem('plaid_access_token', data.access_token);
        setAccessToken(data.access_token);
      }
      
      // Update connection status
      setIsPlaidConnected(true);
      setShowPlaidPrompt(false);
      
      // Fetch initial data
      await fetchSupabaseData();
      
    } catch (err) {
      console.error('Error in handlePlaidSuccess:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsPlaidConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaidExit = (err: any, metadata: any) => {
    if (err) {
      setError(err.display_message || err.error_message || 'An error occurred');
    }
  };

  // Helper function to determine if a category is eco-friendly
  const determineEcoFriendly = (categories: string[] | null): boolean => {
    if (!categories || !Array.isArray(categories)) return false;
    
    const ecoFriendlyCategories = [
      'Food', 'Transportation', 'Utilities', 'Home', 'Healthcare',
      'Groceries', 'Public Transit', 'Electric', 'Gas', 'Water',
      'Medical', 'Dental', 'Pharmacy'
    ];
    return categories.some(category => ecoFriendlyCategories.includes(category));
  };

  // Update date range text when time range changes
  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedTimeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        setDateRangeText('Last 24 hours');
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        setDateRangeText('Last 7 days');
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        setDateRangeText('Last 30 days');
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        setDateRangeText('Last 12 months');
        break;
      default:
        setDateRangeText('');
    }
  }, [selectedTimeRange]);

  // Get filtered transactions based on selected time range
  const filteredTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedTimeRange) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return transactions
      .filter(tx => new Date(tx.date) >= startDate)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10); // Show only the 10 most recent transactions
  }, [transactions, selectedTimeRange]);

  // Show loading state while checking authentication
  if (status === "loading" || isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Dashboard - Footprint</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-6 py-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>

            {/* Profile Circle */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProfile(!showProfile)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="text-sm font-medium">
                  {session?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </motion.button>
              
              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-zinc-800 rounded-lg shadow-xl z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session?.user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {session?.user?.email || 'user@example.com'}
                      </p>
                    </div>
                    <button 
                      onClick={handleSettingsClick}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center"
                    >
                      <IconSettings className="w-4 h-4 mr-2" />
                      Settings
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center"
                    >
                      <IconLogout className="w-4 h-4 mr-2" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Date Range Picker */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <IconCalendar className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {dateRangeText}
              </h2>
            </div>
            <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setSelectedTimeRange(range.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTimeRange === range.value
                      ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          {isPlaidConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Spending Categories Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center mb-6">
                    <IconChartPie className="w-5 h-5 mr-2 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Spending Categories
                    </h2>
                  </div>
                  
                  <div className="relative h-80 flex items-center justify-center">
                    <svg 
                      viewBox="-110 -110 220 220" 
                      className="w-64 h-64 transform -rotate-90"
                    >
                      {spendingCategories.map((category, index) => {
                        const angle = (category.value / totalSpending) * 2 * Math.PI;
                        const path = createPieSegment(currentAngle, currentAngle + angle);
                        const currentPath = path;
                        currentAngle += angle;
                        
                        return (
                          <path
                            key={index}
                            d={currentPath}
                            fill={category.color}
                            stroke="white"
                            strokeWidth="1"
                            className="transition-all duration-300"
                          />
                        );
                      })}
                      {/* Center circle */}
                      <circle r="60" fill="white" className="dark:fill-zinc-800" />
                    </svg>
                    
                    {/* Center content */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                      <IconUser className="w-8 h-8 mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your CO₂</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{totalCO2.toFixed(1)} kg</p>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-6 grid grid-cols-2 gap-y-3">
                    {spendingCategories.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.name} ({category.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                {/* Right half - Interactive Graph */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <IconChartBar className="w-5 h-5 mr-2 text-green-500" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        CO₂ Emissions
                      </h2>
                    </div>
                  </div>
                  
                  <div className="h-80 relative">
                    {/* Y-axis with animated values */}
                    <div className="absolute left-0 top-0 bottom-6 w-16 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
                      {graphScaling.labels.map((value, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                          {formatYAxisValue(value)}
                        </motion.span>
                      ))}
                    </div>
                    
                    {/* Graph area */}
                    <div className="ml-16 h-full pb-6 relative overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedTimeRange}
                          variants={graphContainerVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 25,
                          }}
                          className="w-full h-full"
                        >
                          <svg 
                            className="w-full h-full"
                            viewBox="0 0 1100 400"
                            preserveAspectRatio="none"
                          >
                            {/* Grid lines with animation */}
                            {graphScaling.labels.map((_, i) => (
                              <motion.line
                                key={`h-${i}`}
                                x1="0"
                                y1={i * (400 / (graphScaling.labels.length - 1))}
                                x2="1100"
                                y2={i * (400 / (graphScaling.labels.length - 1))}
                                stroke="#E5E7EB"
                                strokeWidth="1"
                                className="dark:stroke-zinc-800"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                              />
                            ))}
                            
                            {currentData.length > 0 && (
                              <>
                                {/* Animated data line */}
                                <motion.polyline
                                  points={currentData.map((point, i) => {
                                    const x = (i / (currentData.length - 1)) * 1100;
                                    const y = 400 - ((point.value - graphScaling.min) / (graphScaling.max - graphScaling.min)) * 400;
                                    return `${x},${y}`;
                                  }).join(' ')}
                                  fill="none"
                                  stroke="#22C55E"
                                  strokeWidth="2"
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                />
                                
                                {/* Animated data points */}
                                {currentData.map((point, i) => {
                                  const x = (i / (currentData.length - 1)) * 1100;
                                  const y = 400 - ((point.value - graphScaling.min) / (graphScaling.max - graphScaling.min)) * 400;
                                  return (
                                    <motion.circle
                                      key={i}
                                      cx={x}
                                      cy={y}
                                      r="4"
                                      fill="#22C55E"
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ duration: 0.3, delay: 0.5 + (i * 0.05) }}
                                    />
                                  );
                                })}
                              </>
                            )}
                          </svg>
                        </motion.div>
                      </AnimatePresence>
                      
                      {/* X-axis labels with animation */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        {currentData.map((point, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            {point.time}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Recent Transactions Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Transactions
                </h2>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                            {transaction.merchant_name?.[0] || transaction.name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.merchant_name || transaction.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.personal_finance_category?.primary || transaction.category[0]}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {isPlaidConnected 
                        ? `No transactions found for the ${selectedTimeRange} period.` 
                        : 'No transactions found. Connect your bank account to see your transactions.'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Plaid Prompt */}
      <AnimatePresence>
        {showPlaidPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.3
              }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Connect Your Bank Account</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  To start tracking your carbon footprint, please connect your bank account. This helps us analyze your spending patterns and calculate your environmental impact.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={getLinkToken}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <span>Connect bank with Plaid</span>
                  )}
                </motion.button>
                {error && (
                  <p className="mt-4 text-red-500 text-sm">{error}</p>
                )}
                <button 
                  onClick={() => setShowPlaidPrompt(false)}
                  className="mt-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Close (if stuck)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Dashboard; 