import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { IconUser, IconCalendar, IconChartBar, IconChartPie, IconSettings, IconLogout } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

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

const Dashboard: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth');
    },
  });
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('year');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const currentData = emissionsData[selectedTimeRange as keyof typeof emissionsData] || [];
  
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
  
  // Calculate total CO2 emissions for the year
  const totalCO2 = 1475.0; // Fixed value as shown in the image
  
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
    setIsProfileOpen(false);
    router.push('/settings');
  };

  // Handle sign out
  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await signOut({ redirect: true, callbackUrl: '/auth' });
  };

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>

            {/* Profile Circle */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="text-sm font-medium">
                  {session?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </motion.button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {isProfileOpen && (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left half - Pie Chart */}
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
          
          {/* Bottom section - Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Transactions
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Grocery Store</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Local organic market</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">$45.20</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Eco-friendly</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Online Shopping</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fast fashion retailer</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">$89.99</p>
                  <p className="text-sm text-red-600 dark:text-red-400">High impact</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Public Transit</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly pass</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">$65.00</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Eco-friendly</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard; 