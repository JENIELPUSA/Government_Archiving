import React from 'react';
import {
  Sun,
  Moon,
  UploadCloud,
  FileText,
  User,
  Info,
  CreditCard,
  Bell,
  ChevronsLeft
} from 'lucide-react';
import PropTypes from 'prop-types';

const DashboardHeader = ({ theme, toggleTheme, handleFeatureClick, collapsed, setCollapsed }) => {
  return (
    <header className="sticky top-0 z-50 rounded-xl bg-slate-400 shadow-lg p-6 flex justify-between items-center border-b border-blue-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center space-x-4">
        <button
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <ChevronsLeft size={20} className={collapsed ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to the Government Archiving System!
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          onClick={() => handleFeatureClick('notifications')}
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* Theme Toggle Button - Back in action! */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button
          onClick={() => handleFeatureClick('upload')}
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-300 hidden md:block"
          title="Upload Document"
        >
          <UploadCloud size={20} />
        </button>

        <button
          onClick={() => handleFeatureClick('search')}
          className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-300 hidden md:block"
          title="Search Archive"
        >
          <FileText size={20} />
        </button>

        <button
          onClick={() => handleFeatureClick('categories')}
          className="p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-300 hidden md:block"
          title="Manage Categories"
        >
          <CreditCard size={20} />
        </button>

        <button
          onClick={() => handleFeatureClick('reports')}
          className="p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors duration-300 hidden md:block"
          title="View Reports"
        >
          <Info size={20} />
        </button>

        <button
          onClick={() => handleFeatureClick('profile')}
          className="p-2 rounded-full bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-300"
          title="User Profile / Settings"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

DashboardHeader.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
};

export default DashboardHeader;