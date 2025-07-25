import React, { useState, useEffect } from 'react';

const DocumentFilter = ({ documents, onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    tags: [],
    dateFrom: '',
    dateTo: ''
  });
  
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const uniqueCategories = [...new Set(documents.map(doc => doc.category))];
  const uniqueTags = [...new Set(documents.flatMap(doc => doc.tags || []))];

  // Handle all filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  // Clear specific filter or all filters
  const clearFilter = (name) => {
    if (name === 'all') {
      setFilters({
        search: '',
        status: '',
        category: '',
        tags: [],
        dateFrom: '',
        dateTo: ''
      });
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [name]: Array.isArray(prev[name]) ? [] : '' 
      }));
    }
  };

  // Toggle tags
  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Apply filters when changed
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 transition-colors duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 dark:text-purple-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter Documents
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Refine your document search
          </p>
        </div>
        
        {(filters.search || filters.status || filters.category || filters.tags.length || filters.dateFrom || filters.dateTo) && (
          <button 
            onClick={() => clearFilter('all')}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            Clear all filters
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Archived">Archived</option>
            <option value="Rejected">Rejected</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Date Range</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center justify-center text-gray-400">→</div>
            <div className="flex-1">
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        {/* Tags Filter */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Tags</label>
          <div className="relative">
            <button
              onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              className="w-full flex justify-between items-center p-3 border border-gray-300 rounded-lg bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <span>
                {filters.tags.length > 0 
                  ? `${filters.tags.length} selected` 
                  : "Select tags"}
              </span>
              <svg className={`transform ${showTagsDropdown ? 'rotate-180' : ''} h-5 w-5 text-gray-400`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {showTagsDropdown && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600">
                {uniqueTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {uniqueTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 text-sm rounded-full flex items-center transition-colors ${
                          filters.tags.includes(tag)
                            ? 'bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500'
                        }`}
                      >
                        <span className="mr-1.5">#</span>
                        {tag}
                        {filters.tags.includes(tag) && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2 dark:text-gray-400">No tags available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(filters.search || filters.status || filters.category || filters.tags.length || filters.dateFrom || filters.dateTo) && (
        <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Active filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <FilterBadge 
                label={`Search: "${filters.search}"`} 
                onClear={() => clearFilter('search')} 
                icon="🔍"
              />
            )}
            
            {filters.status && (
              <FilterBadge 
                label={`Status: ${filters.status}`} 
                onClear={() => clearFilter('status')} 
                icon="📄"
              />
            )}
            
            {filters.category && (
              <FilterBadge 
                label={`Category: ${filters.category}`} 
                onClear={() => clearFilter('category')} 
                icon="🗂️"
              />
            )}
            
            {filters.tags.map(tag => (
              <FilterBadge 
                key={tag} 
                label={`Tag: #${tag}`} 
                onClear={() => handleTagToggle(tag)} 
                icon="🏷️"
              />
            ))}
            
            {filters.dateFrom && (
              <FilterBadge 
                label={`From: ${new Date(filters.dateFrom).toLocaleDateString()}`} 
                onClear={() => clearFilter('dateFrom')} 
                icon="📅"
              />
            )}
            
            {filters.dateTo && (
              <FilterBadge 
                label={`To: ${new Date(filters.dateTo).toLocaleDateString()}`} 
                onClear={() => clearFilter('dateTo')} 
                icon="📅"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for filter badges
const FilterBadge = ({ label, onClear, icon }) => (
  <div className="flex items-center bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm dark:bg-blue-900/30 dark:text-blue-200">
    <span className="mr-2">{icon}</span>
    <span>{label}</span>
    <button 
      onClick={onClear}
      className="ml-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/50 p-0.5 transition-colors"
      aria-label="Remove filter"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
);

export default DocumentFilter;