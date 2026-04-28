import React from 'react';

const DocumentFilterSkeleton = () => (
    <div className="mb-6 animate-pulse">
        <div className="flex flex-wrap gap-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700 md:w-40"
                ></div>
            ))}
        </div>
    </div>
);

export default DocumentFilterSkeleton;