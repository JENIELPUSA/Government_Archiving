// ArchiveHeaderContent.jsx
import React from 'react';

export const ArchiveHeaderContent = ({
    isLoading,
    selectedMainFolder,
    selectedYear,
    selectedCategory
}) => {
    return (
        <div>
            {isLoading ? (
                <>
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-3"></div>
                    <div className="h-5 w-80 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                </>
            ) : (
                <>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white md:text-3xl">
                        {!selectedMainFolder
                            ? "Archive Folders"
                            : !selectedYear
                                ? selectedMainFolder
                                : !selectedCategory
                                    ? `${selectedYear} Documents`
                                    : selectedCategory}
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {!selectedMainFolder
                            ? "Browse archive folders"
                            : !selectedYear
                                ? `View years in ${selectedMainFolder}`
                                : !selectedCategory
                                    ? `Browse categories from ${selectedYear}`
                                    : `Viewing documents in ${selectedCategory}`}
                    </p>
                </>
            )}
        </div>
    );
};