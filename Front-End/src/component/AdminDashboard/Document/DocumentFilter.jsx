import React, { useState, useEffect, useContext } from "react";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";

const DocumentFilter = ({ onFilterChange, isActiveTags }) => {
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        tags: [],
        dateFrom: "",
        dateTo: "",
        limit: 10, 
    });

    const { isCategory } = useContext(CategoryContext);
    const [showTagsDropdown, setShowTagsDropdown] = useState(false);

    const handleFilterChange = (name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const clearFilter = (name) => {
        if (name === "all") {
            setFilters({
                search: "",
                category: "",
                tags: [],
                dateFrom: "",
                dateTo: "",
                limit: 10,
            });
        } else {
            setFilters((prev) => ({
                ...prev,
                [name]: Array.isArray(prev[name]) ? [] : "",
            }));
        }
    };

    const handleTagToggle = (tag) => {
        setFilters((prev) => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter((t) => t !== tag)
                : [...prev.tags, tag],
        }));
    };

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    return (
        <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-gray-200">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-purple-600 dark:text-purple-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Filter Documents
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Refine your document search</p>
                </div>

                {(filters.search || filters.category || filters.tags.length || filters.dateFrom || filters.dateTo) && (
                    <button
                        onClick={() => clearFilter("all")}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Clear all filters
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-1 h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Main Filters */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    />
                </div>

                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </div>
                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange("category", e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value="">All Categories</option>
                        {isCategory &&
                            isCategory.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.category}
                                </option>
                            ))}
                    </select>
                </div>

                {/* Limit Dropdown */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M5 3h10v2H5V3zM5 7h10v2H5V7zM5 11h10v2H5v-2z" />
                        </svg>
                    </div>
                    <select
                        value={filters.limit}
                        onChange={(e) => handleFilterChange("limit", Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-300 bg-white p-3 pl-10 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    >
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>

            {/* Date Range and Tags */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
                {/* Date Range */}
                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Date Range</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        />
                        <div className="flex items-center justify-center text-gray-400">→</div>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        />
                    </div>
                </div>

                {/* Tags Filter */}
                <div className="md:col-span-3">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
                    <div className="relative">
                        <button
                            onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                            className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white p-3 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                        >
                            <span>{filters.tags.length > 0 ? `${filters.tags.length} selected` : "Select tags"}</span>
                            <svg
                                className={`transform ${showTagsDropdown ? "rotate-180" : ""} h-5 w-5 text-gray-400`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>

                        {showTagsDropdown && (
                            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                                {isActiveTags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {isActiveTags
                                            .filter((tag) => !filters.tags.includes(tag))
                                            .map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleTagToggle(tag)}
                                                    className="flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-600 dark:text-gray-200"
                                                >
                                                    <span className="mr-1.5">#</span>
                                                    {tag}
                                                </button>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="py-2 text-center text-gray-500 dark:text-gray-400">No tags available</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentFilter;
