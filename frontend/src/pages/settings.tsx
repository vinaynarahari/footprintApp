import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const Settings: React.FC = () => {
  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gray-50 dark:bg-black p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>
        <div className="max-w-2xl">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Account Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Account management options coming soon...
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Preferences
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Customize your experience...
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Settings; 