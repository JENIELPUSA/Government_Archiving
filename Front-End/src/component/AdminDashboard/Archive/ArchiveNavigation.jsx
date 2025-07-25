// ArchiveNavigation.jsx
import React from 'react';

export const ArchiveNavigation = ({
    isLoading,
    selectedMainFolder,
    selectedYear,
    selectedCategory,
    handleBackToMainFolders,
    handleBackToYears
}) => {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            {isLoading ? (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            ) : (
                <>
                    <button
                        onClick={handleBackToMainFolders}
                        className="rounded-lg px-3 py-1 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        Folders
                    </button>
                    
                    {selectedMainFolder && (
                        <>
                            <span className="text-gray-400">/</span>
                            <button
                                onClick={handleBackToMainFolders}
                                className="rounded-lg px-3 py-1 font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            >
                                {selectedMainFolder}
                            </button>
                        </>
                    )}
                    {selectedYear && (
                        <>
                            <span className="text-gray-400">/</span>
                            <button
                                onClick={handleBackToYears}
                                className="rounded-lg px-3 py-1 font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                            >
                                {selectedYear}
                            </button>
                        </>
                    )}
                    {selectedCategory && (
                        <>
                            <span className="text-gray-400">/</span>
                            <span className="rounded-lg px-3 py-1 font-medium text-gray-700 dark:text-gray-200">
                                {selectedCategory}
                            </span>
                        </>
                    )}
                </>
            )}
        </div>
    );
};