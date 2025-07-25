import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const RecentDocumentRow = ({ typeIcon, fileName, location, lastModified, size, tags }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150">
    <div className="w-8 flex-shrink-0 mb-2 sm:mb-0">
      {typeIcon}
    </div>
    <div className="flex-1 ml-4 text-gray-800 dark:text-gray-200 font-medium">
      {fileName}
      {tags && tags.length > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tags: {tags.map(tag => (
            <span key={tag} className="inline-block bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-200 mr-1 mb-1">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className="w-full sm:w-1/5 text-gray-600 dark:text-gray-400 text-sm mt-1 sm:mt-0 hidden md:block">{location}</div>
    <div className="w-full sm:w-1/6 text-gray-600 dark:text-gray-400 text-sm mt-1 sm:mt-0 hidden sm:block">{lastModified}</div>
    <div className="w-full sm:w-20 text-gray-600 dark:text-gray-400 text-sm text-right mt-1 sm:mt-0">{size}</div>
  </div>
);
function RecentDocumentsSection({
  currentDocuments,
  totalPagesDocuments,
  currentPageDocuments,
  paginateDocuments,
  selectedType,
  uniqueDocumentTypes,
  setShowTypeFilterDropdown,
  showTypeFilterDropdown,
  handleTypeFilter,
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-t border-blue-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          Recent Documents
          <button className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356-2A8.001 8.001 0 004 12c0 2.972 1.153 5.727 3.056 7.727L9 21m4-14h.582m-9.356 2A8.001 8.001 0 0120 12c0 2.972-1.153 5.727-3.056 7.727L15 21" />
            </svg>
          </button>
        </h2>
      </div>

      {/* Filter and Column Headers */}
      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4 px-4 relative">
        <div
          className="flex items-center mr-4 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => setShowTypeFilterDropdown(!showTypeFilterDropdown)}
        >
          <span className="font-medium">{selectedType}</span>
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {showTypeFilterDropdown && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
            <ul className="py-1">
              {uniqueDocumentTypes.map((type) => (
                <li
                  key={type}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-gray-700 dark:text-gray-200"
                  onClick={() => handleTypeFilter(type)}
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex-1 font-medium hidden md:block">Location</div>
        <div className="w-1/6 font-medium hidden sm:block">Last Modified</div>
        <div className="w-20 font-medium text-right">Size</div>
      </div>

      {/* Earlier Section */}
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 px-4">Earlier</h3>

      {/* Documents List */}
      <div>
        {currentDocuments.length > 0 ? (
          currentDocuments.map((doc, index) => (
            <RecentDocumentRow key={index} {...doc} />
          ))
        ) : (
          <p className="p-4 text-gray-500 dark:text-gray-400 text-center">
            No documents found matching your criteria.
          </p>
        )}
      </div>

      {/* Pagination */}
      {totalPagesDocuments > 1 && (
        <div className="flex justify-center items-center mt-4 space-x-2">
          <button
            onClick={() => paginateDocuments(currentPageDocuments - 1)}
            disabled={currentPageDocuments === 1}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          {Array.from({ length: totalPagesDocuments }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginateDocuments(i + 1)}
              className={`px-3 py-1 rounded-full ${
                currentPageDocuments === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              } transition-colors duration-200`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginateDocuments(currentPageDocuments + 1)}
            disabled={currentPageDocuments === totalPagesDocuments}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </section>
  );
}

export default RecentDocumentsSection;
