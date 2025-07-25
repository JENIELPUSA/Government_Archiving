import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { advancedSearchVariants } from './PublicAccessLayout'; // Dito naka-export ang advancedSearchVariants

export default function Header({ searchTerm, handleSearchChange, showAdvancedSearch, toggleAdvancedSearch, children }) {
    return (
        <header className="bg-blue-700 text-white p-4 shadow-md">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center mb-2 md:mb-0">
                    <img
                        src="https://placehold.co/60x60/FFFFFF/000000?text=GOV"
                        alt="Government File Archiving System Logo"
                        className="h-12 w-12 mr-3 rounded-full shadow-sm"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/60x60/E0E0E0/000000?text=Error"; }}
                    />
                    <h1 className="text-4xl font-extrabold">Government File Archiving System</h1>
                </div>
                <div className="flex flex-col md:flex-row items-center w-full md:w-1/2 space-y-3 md:space-y-0 md:space-x-4">
                    <div className="relative w-full">
                        <input
                            type="text"
                            id="searchInput"
                            placeholder="Search documents or categories..."
                            className="w-full p-3 pl-10 rounded-xl bg-blue-800 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-700"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-blue-200"></i>
                        </div>
                    </div>
                    <button
                        onClick={toggleAdvancedSearch}
                        className="bg-blue-600 hover:bg-blue-800 text-white px-5 py-3 rounded-xl transition duration-200 ease-in-out flex items-center justify-center w-full md:w-auto shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-700"
                    >
                        <i className={`fas fa-sliders-h mr-2 transform transition-transform duration-300 ${showAdvancedSearch ? 'rotate-90' : ''}`}></i>
                        Advanced Search
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {children}
            </AnimatePresence>
        </header>
    );
}