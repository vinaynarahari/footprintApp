import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const Analytics: React.FC = () => {
  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Analytics
        </h1>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Carbon Trends
              </h2>
              <div className="h-64 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                {/* Chart component will go here */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600 dark:text-gray-400">Chart coming soon...</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Spending Categories
              </h2>
              <div className="h-64 bg-gray-100 dark:bg-zinc-800 rounded-lg">
                {/* Chart component will go here */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600 dark:text-gray-400">Chart coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Analytics; 