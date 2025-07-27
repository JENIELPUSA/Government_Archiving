import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoLogin from '../../assets/logo-login.png'; 
import { advancedSearchVariants } from "./PublicAccessLayout"; // Dito naka-export ang advancedSearchVariants

export default function Header({ searchTerm, handleSearchChange, showAdvancedSearch, toggleAdvancedSearch, children }) {
    return (
        <header className="bg-blue-700 p-4 text-white shadow-md">
            <div className="container mx-auto flex flex-col items-center justify-between md:flex-row">
                <div className="mb-2 flex items-center md:mb-0">
                    <img
                        src={logoLogin}
                        alt="Government File Archiving System Logo"
                        className="mr-3 h-12 w-12 rounded-full shadow-sm"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/60x60/E0E0E0/000000?text=Error";
                        }}
                    />
                    <h1 className="text-4xl font-extrabold">Government File Archiving System</h1>
                </div>
                <div className="flex w-full flex-col items-center space-y-3 md:w-1/2 md:flex-row md:space-x-4 md:space-y-0">
                    <div className="relative w-full">
                        <input
                            type="text"
                            id="searchInput"
                            placeholder="Search documents or categories..."
                            className="w-full rounded-xl bg-blue-800 p-3 pl-10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-700"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <i className="fas fa-search text-blue-200"></i>
                        </div>
                    </div>
                    <button
                        onClick={toggleAdvancedSearch}
                        className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-white shadow-md transition duration-200 ease-in-out hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-blue-700 md:w-auto"
                    >
                        <i
                            className={`fas fa-sliders-h mr-2 transform transition-transform duration-300 ${showAdvancedSearch ? "rotate-90" : ""}`}
                        ></i>
                        Advanced Search
                    </button>
                </div>
            </div>
            <AnimatePresence>{children}</AnimatePresence>
        </header>
    );
}
