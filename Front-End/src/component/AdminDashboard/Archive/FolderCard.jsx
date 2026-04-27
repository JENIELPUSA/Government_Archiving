// FolderCard.jsx
import React from 'react';
import { FaFolder, FaCalendarAlt, FaFolderOpen } from 'react-icons/fa';

export const FolderCard = ({ name, onClick, count = null, icon = "folder" }) => {
    const IconComponent = 
        icon === "calendar" ? FaCalendarAlt :
        icon === "folder-open" ? FaFolderOpen :
        FaFolder;

    return (
        <button
            onClick={onClick}
            className="group flex flex-col items-center rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 text-center shadow-sm transition-all duration-200 ease-in-out hover:border-blue-300 hover:shadow-lg hover:scale-[1.02] dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 dark:hover:border-blue-600"
        >
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-xl bg-blue-100 opacity-80 transition-all group-hover:opacity-100 dark:bg-blue-900/50">
                    <div className="absolute bottom-0 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-blue-200 group-hover:bg-blue-300 dark:bg-blue-700"></div>
                </div>
                <IconComponent className="relative z-10 text-3xl text-blue-500 transition-colors group-hover:text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{name}</p>
            {count !== null && (
                <span className="mt-1 text-sm text-gray-500 dark:text-gray-400">{count} documents</span>
            )}
        </button>
    );
};