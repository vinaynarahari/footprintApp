import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconHome, IconChartBar, IconLeaf, IconSettings, IconMenu2, IconSun, IconMoon } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
  href?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick, href }) => {
  const content = (
    <>
      <span className={`flex items-center justify-center ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
        {icon}
      </span>
      <span className={`${collapsed ? 'hidden' : 'block'} whitespace-nowrap ml-3`}>{label}</span>
    </>
  );

  if (onClick) {
    return (
      <motion.div
        onClick={onClick}
        className={`flex items-center px-4 py-2 cursor-pointer ${
          active 
            ? 'bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
        }`}
        whileHover={{ x: 4 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <Link href={href || '#'}>
      <motion.div
        className={`flex items-center px-4 py-2 cursor-pointer ${
          active 
            ? 'bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'
        }`}
        whileHover={{ x: 4 }}
      >
        {content}
      </motion.div>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(savedTheme === 'dark' || (!savedTheme && systemPrefersDark));
  }, []);

  // Update theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <motion.div 
      className={`bg-white dark:bg-black border-r border-gray-200 dark:border-zinc-800 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-zinc-800">
        <h1 className={`font-semibold text-xl text-gray-900 dark:text-white ${
          isSidebarCollapsed ? 'hidden' : 'block'
        } whitespace-nowrap`}>Footprint</h1>
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-md flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <IconMenu2 size={20} className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="mt-4 flex-1">
        <NavItem 
          icon={<IconHome className="w-5 h-5" />} 
          label="Dashboard" 
          active={router.pathname === '/dashboard'} 
          collapsed={isSidebarCollapsed}
          href="/dashboard"
        />
        <NavItem 
          icon={<IconChartBar className="w-5 h-5" />} 
          label="Analytics" 
          active={router.pathname === '/analytics'} 
          collapsed={isSidebarCollapsed}
          href="/analytics"
        />
        <NavItem 
          icon={<IconLeaf className="w-5 h-5" />} 
          label="Impact" 
          active={router.pathname === '/impact'} 
          collapsed={isSidebarCollapsed}
          href="/impact"
        />
        <NavItem 
          icon={<IconSettings className="w-5 h-5" />} 
          label="Settings" 
          active={router.pathname === '/settings'} 
          collapsed={isSidebarCollapsed}
          href="/settings"
        />
      </nav>

      {/* Theme Toggle */}
      <div className="mb-4">
        <NavItem 
          icon={isDarkMode ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
          label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          collapsed={isSidebarCollapsed}
          onClick={() => setIsDarkMode(!isDarkMode)}
        />
      </div>
    </motion.div>
  );
};

export default Sidebar; 