import React from 'react';
import { motion } from 'framer-motion';
import { Folder } from 'lucide-react'; // Placeholder - actual icons passed as props

const FolderCard = ({ count, folderName, icon: Icon, iconColorClass, onClick, isActive, newCount }) => {
  return (
    <motion.div
      className={`
        relative w-48 h-36 bg-blue-200 dark:bg-blue-700 border border-yellow-400 dark:border-yellow-600 rounded-lg shadow-md
        flex flex-col items-center justify-center p-4
        cursor-pointer hover:shadow-xl transition-all duration-200
        ${isActive ? 'border-indigo-500 ring-2 ring-indigo-500' : ''}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-0 left-4 w-1/3 h-4 bg-yellow-300 dark:bg-yellow-600 rounded-t-md border-t border-x border-yellow-400 dark:border-yellow-600 -mt-2"></div>
      <Icon className={`h-12 w-12 mb-2 ${iconColorClass}`} />
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white truncate">{folderName}</h2>
      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{count}</span>
      <p className="text-sm text-gray-600 dark:text-gray-400">documents</p>
      {newCount > 0 && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {newCount} New
        </span>
      )}
    </motion.div>
  );
};

export default FolderCard;