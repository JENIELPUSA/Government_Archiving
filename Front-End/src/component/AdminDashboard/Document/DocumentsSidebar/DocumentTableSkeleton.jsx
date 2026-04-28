import React from 'react';

const DocumentTableSkeleton = () => (
    <div className="animate-pulse">
        <div className="mb-4 flex items-center justify-between">
            <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-5 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-700">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="h-4 rounded bg-gray-200 dark:bg-gray-600"
                    ></div>
                ))}
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, rowIdx) => (
                    <div
                        key={rowIdx}
                        className="grid grid-cols-5 gap-4 px-6 py-4"
                    >
                        {[...Array(5)].map((_, colIdx) => (
                            <div
                                key={colIdx}
                                className={`h-4 rounded bg-gray-200 dark:bg-gray-700 ${colIdx === 4 ? "w-24" : ""}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default DocumentTableSkeleton;