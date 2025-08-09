import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NoteModal = ({ isOpen, onClose, note }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              damping: 25
            }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Note</h2>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl leading-none font-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full w-10 h-10 flex items-center justify-center"
                aria-label="Close modal"
              >
                &times;
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full p-5 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-100
                         min-h-[180px] max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-relaxed
                         shadow-inner border border-amber-200 dark:border-gray-600 font-serif note-container"
            >
              {note}
            </motion.div>

            <div className="flex justify-end mt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-md"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NoteModal;
