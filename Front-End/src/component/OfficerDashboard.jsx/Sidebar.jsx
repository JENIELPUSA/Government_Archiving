import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, X } from 'lucide-react';

const Sidebar = ({ notifications, onNotificationClick, onDismissNotification, onClose }) => {
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50 p-6 flex flex-col"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <Bell className="h-6 w-6 mr-2 text-indigo-600" /> Notifications
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Close sidebar"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`mb-4 p-4 rounded-lg border ${notif.isRead ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300' : 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-700 text-gray-800 dark:text-white font-medium'} flex items-start`}
            >
              <div className="flex-1 cursor-pointer" onClick={() => onNotificationClick(notif)}>
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: notif.message }}></p>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  {new Date(notif.timestamp).toLocaleString()}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDismissNotification(notif.id); }}
                className="ml-3 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Dismiss notification"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p>No new notifications.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;