import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const ImpactMetric: React.FC<{
  title: string;
  value: string;
  description: string;
}> = ({ title, value, description }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6"
  >
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </motion.div>
);

const Impact: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen p-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Environmental Impact
          </h1>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <ImpactMetric
              title="Carbon Footprint"
              value="245 kg"
              description="Total CO₂ emissions from your transactions this month"
            />
            <ImpactMetric
              title="Trees Needed"
              value="12"
              description="Number of trees needed to offset your monthly emissions"
            />
            <ImpactMetric
              title="Carbon Savings"
              value="52 kg"
              description="CO₂ emissions saved through eco-friendly choices"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Trends
            </h2>
            <div className="h-64 bg-gray-100 dark:bg-zinc-800 rounded-lg">
              {/* Chart component will go here */}
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-gray-400">Chart coming soon...</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recommendations
            </h2>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">🌱</span>
                Consider using public transportation more frequently
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">💡</span>
                Switch to energy-efficient appliances
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-400">
                <span className="mr-2">♻️</span>
                Increase recycling efforts
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Impact; 