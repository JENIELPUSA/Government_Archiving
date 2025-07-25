import React, { useState, useEffect } from 'react';

const DraftFilter = ({ documents, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const uniqueCategories = [...new Set(documents.map(doc => doc.department))];
  const uniqueTags = [...new Set(documents.flatMap(doc => doc.tags || []))];

  useEffect(() => {
    onFilterChange({
      search: searchTerm,
      status: statusFilter,
      department: departmentFilter,
      tags: selectedTags,
      dateFrom: dateFrom,
      dateTo: dateTo
    });
  }, [searchTerm, statusFilter, departmentFilter, selectedTags, dateFrom, dateTo, onFilterChange]);

  const clearTag = (type, value = null) => {
    if (type === 'search') setSearchTerm('');
    if (type === 'status') setStatusFilter('');
    if (type === 'department') setDepartmentFilter('');
    if (type === 'tag') {
      setSelectedTags(prevTags => prevTags.filter(tag => tag !== value));
    }
    if (type === 'dateFrom') setDateFrom('');
    if (type === 'dateTo') setDateTo('');
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prevTags => prevTags.filter(selectedTag => selectedTag !== tag));
    } else {
      setSelectedTags(prevTags => [...prevTags, tag]);
    }
  };

  return (
    <div className="mb-8 p-4 bg-gray-50 rounded-lg shadow-inner dark:bg-gray-800 dark:text-gray-100 transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
          <i className="fas fa-filter mr-2 text-purple-600 dark:text-purple-400"></i> Search and Filter
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Search document..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-md bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-md bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
        >
          <option value="">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Archived">Archived</option>
          <option value="Rejected">Rejected</option>
          <option value="Draft">Draft</option>
        </select>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-md bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
        >
          <option value="">All Categories</option>
          {uniqueCategories.map(department => (
            <option key={department} value={department}>{department}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">Date From:</label>
          <input
            type="date"
            id="dateFrom"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="p-3 border border-gray-300 rounded-md w-full bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">Date To:</label>
          <input
            type="date"
            id="dateTo"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="p-3 border border-gray-300 rounded-md w-full bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>
      </div>

      <div className="relative mb-4">
        <button
          onClick={() => setShowTagsDropdown(!showTagsDropdown)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md inline-flex items-center dark:bg-purple-700 dark:hover:bg-purple-800 transition-colors duration-200"
        >
          <i className="fas fa-tags mr-2"></i> Filter By Tags
          <svg className="fill-current h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </button>
        {showTagsDropdown && (
          <div className="absolute z-10 mt-2 w-full md:w-auto bg-white border border-gray-300 rounded-md shadow-lg p-4 max-h-60 overflow-y-auto dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {uniqueTags.length > 0 ? (
                uniqueTags.map(tag => (
                  <label key={tag} className="flex items-center text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      value={tag}
                      checked={selectedTags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="form-checkbox h-4 w-4 text-purple-600 rounded dark:text-purple-400 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <span className="ml-2 text-sm">{tag}</span>
                  </label>
                ))
              ) : (
                <p className="col-span-full text-gray-500 text-sm dark:text-gray-400">No tags available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {(searchTerm || statusFilter || departmentFilter || selectedTags.length > 0 || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {searchTerm && (
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-purple-800 dark:text-purple-100">
              🔍 Search: {searchTerm}
              <button onClick={() => clearTag('search')} className="ml-2 text-purple-500 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100">×</button>
            </span>
          )}
          {statusFilter && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-blue-800 dark:text-blue-100">
              📄 Status: {statusFilter}
              <button onClick={() => clearTag('status')} className="ml-2 text-blue-500 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100">×</button>
            </span>
          )}
          {departmentFilter && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-green-800 dark:text-green-100">
              🗂️ department: {departmentFilter}
              <button onClick={() => clearTag('department')} className="ml-2 text-green-500 hover:text-green-800 dark:text-green-300 dark:hover:text-green-100">×</button>
            </span>
          )}
          {selectedTags.map(tag => (
            <span key={tag} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-yellow-800 dark:text-yellow-100">
              🏷️ Tag: {tag}
              <button onClick={() => clearTag('tag', tag)} className="ml-2 text-yellow-500 hover:text-yellow-800 dark:text-yellow-300 dark:hover:text-yellow-100">×</button>
            </span>
          ))}
          {dateFrom && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-red-800 dark:text-red-100">
              🗓️ From: {dateFrom}
              <button onClick={() => clearTag('dateFrom')} className="ml-2 text-red-500 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100">×</button>
            </span>
          )}
          {dateTo && (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-red-800 dark:text-red-100">
              🗓️ To: {dateTo}
              <button onClick={() => clearTag('dateTo')} className="ml-2 text-red-500 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default DraftFilter;