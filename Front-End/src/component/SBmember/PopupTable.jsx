import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const PopupTable = ({ isOpen, onClose, files, memberInfo, count }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="popup-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        key="popup-content"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                        className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between bg-blue-600 p-4 text-white dark:bg-blue-700">
                            <h3 className="text-xl font-bold">
                                Files for {memberInfo?.fullName}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-2xl font-bold text-white hover:text-gray-200 dark:hover:text-gray-300"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Table Container */}
                        <div className="flex-grow overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                            Date of Resolution
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-800">
                                    {files.map((file, index) => (
                                        <tr key={index} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {file.title}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        file.category === "Resolution"
                                                            ? "bg-blue-100 text-blue-800 dark:bg-blue-200 dark:text-blue-900"
                                                            : "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900"
                                                    }`}
                                                >
                                                    {file.category}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                                                {new Date(file.dateOfResolution).toLocaleDateString("en-PH", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Empty State */}
                            {files.length === 0 && (
                                <div className="py-12 text-center">
                                    <div className="mb-2 text-gray-400 dark:text-gray-500">No files available</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">This member has no files yet</div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between bg-gray-50 p-4 dark:bg-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                                Showing {files.length} of {count} files
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PopupTable;
