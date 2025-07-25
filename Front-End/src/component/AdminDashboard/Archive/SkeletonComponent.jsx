// SkeletonComponents.jsx
import React from 'react';

export const SkeletonFolderCard = () => (
    <div className="group flex flex-col items-center rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 text-center shadow-sm dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gray-200 animate-pulse dark:bg-gray-700" />
        </div>
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-2"></div>
        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
    </div>
);

export const SkeletonDocumentCard = () => (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 animate-pulse dark:bg-gray-700"></div>
            <div className="ml-3 flex-1 overflow-hidden">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            </div>
        </div>
        <div className="flex flex-wrap gap-1">
            <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
        </div>
    </div>
);

export const SkeletonDocumentDetails = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
            <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-4"></div>
            <div className="space-y-2 mb-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
            </div>
            
            <div className="mb-4 flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 animate-pulse dark:bg-gray-700"></div>
                <div className="ml-3">
                    <div className="h-5 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-1"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
                <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
                <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700"></div>
            </div>
        </div>
        
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-2"></div>
                        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse dark:bg-gray-700"></div>
                    </div>
                ))}
            </div>
            
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-3"></div>
                <div className="flex flex-wrap gap-1">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700"></div>
                    ))}
                </div>
            </div>
            
            <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse dark:bg-gray-700 mb-3"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse dark:bg-gray-700 flex-shrink-0"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-700 ml-2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);