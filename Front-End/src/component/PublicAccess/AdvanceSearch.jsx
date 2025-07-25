import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiFilter, FiCalendar, FiUser, FiTag } from 'react-icons/fi';

export default function AdvancedSearch({
    variants,
    advAuthor,
    handleAdvAuthorChange,
    advApprovalDate,
    handleAdvApprovalDateChange,
    allUniqueTags,
    advSelectedTags,
    handleTagToggle,
    clearAdvancedFilters
}) {
    return (
        <motion.div
            className="container mx-auto mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-lg border border-blue-100"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                    <FiFilter className="text-indigo-600" />
                    Advanced Filters
                </h3>
                <button 
                    onClick={clearAdvancedFilters}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium transition-colors"
                >
                    <FiX size={18} />
                    Clear all
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                    <label htmlFor="advAuthor" className="block text-indigo-800 font-medium flex items-center gap-2">
                        <FiUser size={16} />
                        Author
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="advAuthor"
                            className="w-full p-3 pl-10 rounded-xl bg-white text-indigo-900 placeholder-indigo-300 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
                            value={advAuthor}
                            onChange={(e) => handleAdvAuthorChange(e.target.value)}
                            placeholder="Search authors..."
                        />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label htmlFor="advApprovalDate" className="block text-indigo-800 font-medium flex items-center gap-2">
                        <FiCalendar size={16} />
                        Approval Date
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="advApprovalDate"
                            className="w-full p-3 pl-10 rounded-xl bg-white text-indigo-900 placeholder-indigo-300 border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
                            value={advApprovalDate}
                            onChange={(e) => handleAdvApprovalDateChange(e.target.value)}
                            placeholder="e.g., July 6, 1987"
                        />
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-indigo-800 font-medium mb-3 flex items-center gap-2">
                    <FiTag size={16} />
                    Tags
                </label>
                <div className="flex flex-wrap gap-2">
                    {allUniqueTags.map(tag => (
                        <button
                            key={tag}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-out flex items-center shadow-sm
                                ${advSelectedTags.includes(tag)
                                    ? 'bg-indigo-600 text-white shadow-indigo-200'
                                    : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                                }`}
                            onClick={() => handleTagToggle(tag)}
                        >
                            {tag}
                            {advSelectedTags.includes(tag) && (
                                <FiX size={16} className="ml-2" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={clearAdvancedFilters}
                    className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-medium border border-indigo-200 hover:bg-indigo-50 hover:text-indigo-900 transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-indigo-100"
                >
                    <FiX size={18} />
                    Reset Filters
                </button>
            </div>
        </motion.div>
    );
}