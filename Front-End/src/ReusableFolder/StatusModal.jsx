import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence for exit animations

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirmDelete,
}) {
  return (
    <AnimatePresence> {/* Wrap with AnimatePresence for exit animations */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[999] p-4 font-inter" // Darker overlay, added font-inter
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }} // Added y for a subtle drop-in effect
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }} // Added y for exit effect
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-md w-full relative text-center
                       border border-gray-200 dark:border-gray-700
                       transform transition-all duration-300 ease-in-out" // Enhanced styling
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300
                         transition-colors duration-200 focus:outline-none"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }} // Initial rotation for a more dynamic entry
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200, damping: 15 }} // Spring animation for icon
              className="mx-auto mb-6 w-24 h-24 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30" // Larger, softer background
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-5xl text-red-500 dark:text-red-400" // Red color for the warning icon
              >
                &#9888;&#xFE0F; {/* Unicode warning sign emoji */}
              </motion.div>
            </motion.div>

            {/* Heading */}
            <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
              Are you sure?
            </h2>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-400 text-base mb-8 leading-relaxed">
              This action cannot be undone. All associated data will be
              permanently removed. Are you sure you want to delete this item?
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4"> {/* Responsive button layout */}
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-full hover:bg-gray-300
                           transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75
                           dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirmDelete();
                  onClose();
                }}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-red-700
                           transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75
                           dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
