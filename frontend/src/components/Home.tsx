import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.95
  }
};

const Home: React.FC = () => {
  return (
    <motion.div 
      className="text-center py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="text-4xl font-bold mb-4"
        variants={itemVariants}
      >
        Welcome to Footprint
      </motion.h1>
      <motion.p 
        className="text-xl mb-8"
        variants={itemVariants}
      >
        Track your spending and manage your finances with ease.
      </motion.p>
      <motion.div 
        className="space-x-4"
        variants={itemVariants}
      >
        <motion.span
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="inline-block"
        >
          <Link to="/register" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Get Started
          </Link>
        </motion.span>
        <motion.span
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          className="inline-block"
        >
          <Link to="/link" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Link Your Account
          </Link>
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default Home; 