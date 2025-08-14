// DocumentCard.jsx
import React from 'react';
import { FaFileAlt } from 'react-icons/fa';

export const DocumentCard = ({ doc, onSelect }) => (
    <div
        className="group flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600"
        onClick={() => onSelect(doc)}
    >
        <div className="mb-3 flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-500 dark:bg-blue-900/50 dark:text-blue-400">
                <FaFileAlt className="text-xl" />
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
                <h3 className="truncate text-base font-medium text-gray-800 dark:text-gray-200">
                    {doc.fileName || doc.title || "Untitled Document"}
                </h3>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {doc.author || "Unknown Author"}
                </p>
            </div>
        </div>
        <div className="mt-auto flex flex-wrap gap-1">
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                {doc.fullText}
            </span>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                doc.status === 'ArchiveLayoutroved' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
            }`}>
                {doc.status}
            </span>
        </div>
        {doc.tags && doc.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
                {doc.tags.map((tag, index) => (
                    <span 
                        key={index} 
                        className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        )}
    </div>
);