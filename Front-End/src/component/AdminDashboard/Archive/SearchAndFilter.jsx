import React from 'react';
import { FaSearch, FaTimes, FaTag } from 'react-icons/fa';

export const SearchAndFilter = ({
    searchQuery,
    setSearchQuery,
    allTags,
    selectedTags,
    toggleTag,
    clearAllFilters,
    isFilterOpen,
    setIsFilterOpen,
    showTagSuggestions,
    setShowTagSuggestions
}) => {


    console.log("Tags in Filter Pass",allTags)
    const filteredTagSuggestions = allTags.filter(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
                <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-600 dark:bg-gray-700">
                    <FaSearch className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search documents or tags..."
                        className="ml-2 min-w-[200px] bg-transparent focus:outline-none dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowTagSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowTagSuggestions(false), 100)}
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            aria-label="Clear search query"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                
                {/* Tag suggestions dropdown */}
                {showTagSuggestions && searchQuery && filteredTagSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="p-2">
                            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Matching Tags</h3>
                            <div className="flex flex-wrap gap-1">
                                {filteredTagSuggestions.map(tag => (
                                    <button
                                        key={tag}
                                        className={`rounded-full px-2 py-1 text-xs ${
                                            selectedTags.includes(tag)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                        onClick={() => {
                                            toggleTag(tag);
                                            setSearchQuery("");
                                            setShowTagSuggestions(false);
                                        }}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                 {showTagSuggestions && searchQuery && filteredTagSuggestions.length === 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">
                            No matching tags.
                        </div>
                    </div>
                )}
            </div>
            
            {/* Filter Button */}
            <div className="relative filter-container">
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
                    aria-expanded={isFilterOpen}
                    aria-controls="filter-dropdown"
                >
                    <FaTag className="text-blue-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-200">Filter</span>
                    {selectedTags.length > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                            {selectedTags.length}
                        </span>
                    )}
                </button>
                
                {/* Filter Dropdown */}
                {isFilterOpen && (
                    <div id="filter-dropdown" className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Filter by Tags</h3>
                            {selectedTags.length > 0 && (
                                <button 
                                    onClick={clearAllFilters}
                                    className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        
                        <div className="mb-4 max-h-40 overflow-y-auto">
                            {allTags.length > 0 ? (
                                <div className="space-y-2">
                                    {allTags.map(tag => (
                                        <div 
                                            key={tag} 
                                            className={`flex cursor-pointer items-center justify-between rounded-lg p-2 ${
                                                selectedTags.includes(tag)
                                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => toggleTag(tag)}
                                        >
                                            <span className="text-gray-700 dark:text-gray-300">{tag}</span>
                                            {selectedTags.includes(tag) && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">No tags available</p>
                            )}
                        </div>
                        
                        {/* Selected Tags */}
                        {selectedTags.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Selected Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTags.map(tag => (
                                        <div 
                                            key={tag} 
                                            className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                                        >
                                            {tag}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTag(tag);
                                                }}
                                                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                aria-label={`Remove tag ${tag}`}
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};