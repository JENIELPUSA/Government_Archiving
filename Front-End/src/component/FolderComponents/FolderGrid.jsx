import React from "react";
import { Edit, Trash2, Folder, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const FolderGrid = ({ 
    folders,
    currentFolders,
    viewMode,
    isEditing,
    editedFolderName,
    editedFolderColor,
    setEditedFolderName,
    setEditedFolderColor,
    setIsEditing,
    handleEditClick,
    saveEdit,
    cancelEdit,
    hanndledeleteFolder,
    openFolder,
    getColorClasses,
    totalFolderPages,
    currentFolderPage,
    setCurrentFolderPage,
    searchTerm,
    folderFilters
}) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {folders.length === 0 ? (
                <div className="py-16 text-center">
                    <Folder className="mx-auto mb-6 h-20 w-20 text-gray-300 dark:text-gray-600" />
                    <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                        {searchTerm || Object.values(folderFilters).some(val => val) ? "No folders found" : "No folders yet"}
                    </h3>
                    <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                        {searchTerm || Object.values(folderFilters).some(val => val) 
                            ? "Try adjusting your search or filter terms" 
                            : "Create your first folder to get started"}
                    </p>
                </div>
            ) : (
                <div>
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {folders.length} {folders.length === 1 ? "Folder" : "Folders"}
                        </h2>
                        
                        <div className="flex flex-wrap items-center gap-4">
                            {searchTerm && (
                                <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                    Search: "{searchTerm}"
                                </span>
                            )}
                            
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {currentFolderPage} of {totalFolderPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentFolderPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentFolderPage === 1}
                                        className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => setCurrentFolderPage(prev => Math.min(prev + 1, totalFolderPages))}
                                        disabled={currentFolderPage === totalFolderPages || totalFolderPages === 0}
                                        className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {currentFolders.map((folder, index) => {
                                const colorClasses = getColorClasses(folder.color);
                                return (
                                    <div
                                        key={folder._id}
                                        className="group relative transform cursor-pointer transition-all duration-200 hover:scale-105"
                                        onClick={() => openFolder(folder)}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Edit mode vs Normal mode */}
                                        {isEditing === folder._id ? (
                                            <div
                                                className={`relative rounded-2xl p-6 ${colorClasses.bg} ${colorClasses.border} border-2 shadow-lg transition-shadow duration-200`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Edit Folder</h3>
                                                <input
                                                    type="text"
                                                    value={editedFolderName}
                                                    onChange={(e) => setEditedFolderName(e.target.value)}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                    autoFocus
                                                />
                                                <div className="mt-4 flex gap-3">
                                                    {Object.values(colorClasses).map((color, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setEditedFolderColor(color.name)}
                                                            className={`h-8 w-8 rounded-full ${color.accent} transition-all duration-200 hover:scale-110 ${
                                                                editedFolderColor === color.name ? "ring-2 ring-gray-400 ring-offset-2" : ""
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="mt-6 flex gap-2">
                                                    <button
                                                        onClick={(e) => cancelEdit(e)}
                                                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2 font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={(e) => saveEdit(e, folder._id)}
                                                        disabled={!editedFolderName.trim()}
                                                        className="flex-1 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={`flex h-48 flex-col justify-between rounded-2xl border-2 p-6 transition-all duration-200 ${colorClasses.bg} ${colorClasses.border} shadow-lg group-hover:shadow-xl`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div
                                                        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${colorClasses.accent}`}
                                                    >
                                                        <Folder className={`h-6 w-6 text-white`} />
                                                    </div>
                                                    <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => handleEditClick(e, folder)}
                                                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => hanndledeleteFolder(e, folder._id)}
                                                                className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-gray-700"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                        {folder.folderName}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentFolders.map((folder, index) => {
                                const colorClasses = getColorClasses(folder.color);
                                return (
                                    <div
                                        key={folder._id}
                                        className={`group relative flex cursor-pointer items-center justify-between p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700`}
                                        onClick={() => openFolder(folder)}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {isEditing === folder._id ? (
                                            <div
                                                className="flex w-full items-center gap-4"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colorClasses.accent}`}>
                                                    <Folder className={`h-6 w-6 text-white`} />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={editedFolderName}
                                                        onChange={(e) => setEditedFolderName(e.target.value)}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => saveEdit(e, folder._id)}
                                                        disabled={!editedFolderName.trim()}
                                                        className="rounded-xl p-2 text-green-500 transition-colors hover:bg-green-100 disabled:opacity-50 dark:hover:bg-gray-700"
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => cancelEdit(e)}
                                                        className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-gray-700"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex w-full items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${colorClasses.accent}`}>
                                                        <Folder className={`h-6 w-6 text-white`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                            {folder.folderName}
                                                        </h3>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => handleEditClick(e, folder)}
                                                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => hanndledeleteFolder(e, folder._id)}
                                                            className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-gray-700"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Pagination for folders */}
                    {totalFolderPages > 1 && (
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {indexOfFirstFolder + 1} to {Math.min(indexOfLastFolder, folders.length)} of {folders.length} folders
                            </span>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setCurrentFolderPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentFolderPage === 1}
                                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Previous
                                </button>
                                <span className="text-sm font-medium">
                                    Page {currentFolderPage} of {totalFolderPages}
                                </span>
                                <button
                                    onClick={() => setCurrentFolderPage(prev => Math.min(prev + 1, totalFolderPages))}
                                    disabled={currentFolderPage === totalFolderPages}
                                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                                >
                                    Next <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FolderGrid;