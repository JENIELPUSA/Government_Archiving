import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function StatusModal({
  isOpen,
  onClose,
  status = "success",
  error = null, // New prop for custom error message
}) {
  const isSuccess = status === "success";

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';

    return () => (document.body.style.overflow = 'unset');
  }, [isOpen]);

  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[999] p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-200 dark:border-gray-700"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 text-2xl"
          aria-label="Close modal"
        >
          ✕
        </button>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 260, damping: 20 }}
          className={`mx-auto mb-6 w-24 h-24 flex items-center justify-center rounded-full
            ${isSuccess ? "bg-gradient-to-br from-green-400 to-green-600" : "bg-gradient-to-br from-red-400 to-red-600"}
            text-white shadow-lg`}
        >
          <span className="text-5xl">
            {isSuccess ? "✅" : "❌"}
          </span>
        </motion.div>

        <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white text-center">
          {isSuccess ? "Success!" : "Failed!"}
        </h2>

        <div className="text-gray-700 dark:text-gray-300 text-base mb-8 leading-relaxed max-h-[60vh] overflow-y-auto text-center">
          {isSuccess ? (
            "Your request has been successfully accepted and processed. Everything looks great!"
          ) : (
            <div className="space-y-2 text-center">
              <p>Oops! Something went wrong.</p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-lg text-sm font-mono whitespace-pre-wrap break-words">
                  {error}
                </div>
              )}
              <p className="pt-2">Please review and try again.</p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3 px-6 rounded-full text-white font-semibold text-lg
            ${isSuccess
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-300"
              : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:ring-red-300"}
            transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50`}
        >
          {isSuccess ? "Got it!" : "Try Again"}
        </button>
      </motion.div>
    </div>
  );
}
