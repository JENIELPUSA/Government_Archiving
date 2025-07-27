import React, { useState } from 'react';

export default function CategoriesSidebar({ 
  categories, 
  currentCategory, 
  showBookmarks, 
  handleCategoryClick, 
  handleShowBookmarks,
  hasNewApprovedFiles // Add this prop to indicate if there are new approved files
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNewApprovedFiles = () => {
    handleCategoryClick('new_approved_files');
  };

  return (
    <div className="relative">
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-6 right-6 z-20 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
        aria-label={isCollapsed ? "Open categories" : "Close categories"}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isCollapsed ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} 
          />
        </svg>
      </button>

      <aside 
        className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ease-in-out transform
          ${isCollapsed ? 'md:translate-x-0 -translate-x-full absolute md:static w-4/5 md:w-auto z-10 h-screen md:h-auto' : 'translate-x-0'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
          <button 
            onClick={() => setIsCollapsed(true)}
            className="md:hidden text-gray-500 hover:text-gray-700"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div id="categoriesList" className="space-y-2">
          <button
            className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 group
              ${currentCategory === null && !showBookmarks 
                ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                : 'hover:bg-gray-50'}`}
            onClick={() => handleCategoryClick(null)}
          >
            <div className={`p-2 rounded-lg ${currentCategory === null && !showBookmarks ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div>
              <span className={`font-medium ${currentCategory === null && !showBookmarks ? 'text-blue-700' : 'text-gray-700'}`}>
                All Documents
              </span>
              {currentCategory === null && !showBookmarks && (
                <div className="text-xs text-blue-500 mt-1">Currently viewing</div>
              )}
            </div>
          </button>

          <button
            className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 group
              ${showBookmarks 
                ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                : 'hover:bg-gray-50'}`}
            onClick={handleShowBookmarks}
          >
            <div className={`p-2 rounded-lg ${showBookmarks ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div>
              <span className={`font-medium ${showBookmarks ? 'text-blue-700' : 'text-gray-700'}`}>
                My Bookmarked Documents
              </span>
              {showBookmarks && (
                <div className="text-xs text-blue-500 mt-1">Currently viewing</div>
              )}
            </div>
          </button>

          {/* NEW APPROVED FILES BUTTON WITH BADGE */}
          <button
            className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 group
              ${currentCategory === 'new_approved_files' && !showBookmarks
                ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                : 'hover:bg-gray-50'}`}
            onClick={handleNewApprovedFiles}
          >
            <div className={`p-2 rounded-lg ${currentCategory === 'new_approved_files' && !showBookmarks ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className={`font-medium ${currentCategory === 'new_approved_files' && !showBookmarks ? 'text-blue-700' : 'text-gray-700'}`}>
                  New Approved Files
                </span>
                {hasNewApprovedFiles && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              {currentCategory === 'new_approved_files' && !showBookmarks && (
                <div className="text-xs text-blue-500 mt-1">Currently viewing</div>
              )}
            </div>
          </button>

          {/* Document Categories Section */}
          <div className="border-t border-gray-100 my-4 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 pl-2">Document Categories</h3>
            {categories.map(category => (
              <button
                key={category.id}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 group mb-2
                  ${currentCategory === category.id && !showBookmarks 
                    ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                    : 'hover:bg-gray-50'}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className={`p-2 rounded-lg ${currentCategory === category.id && !showBookmarks ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <span className={`font-medium ${currentCategory === category.id && !showBookmarks ? 'text-blue-700' : 'text-gray-700'}`}>
                    {category.name}
                  </span>
                  {currentCategory === category.id && !showBookmarks && (
                    <div className="text-xs text-blue-500 mt-1">Currently viewing</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}