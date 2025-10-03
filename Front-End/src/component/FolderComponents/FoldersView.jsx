import React from 'react';
import { FolderPlus, Search, Grid, List, Calendar, Edit, Trash2, Folder, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';

const FoldersView = ({
    foldersToDisplay,
    searchTerm,
    handleFolderSearch,
    resetFolderFilters,
    viewMode,
    setViewMode,
    isCreating,
    setIsCreating,
    newFolderName,
    setNewFolderName,
    selectedColor,
    setSelectedColor,
    openFolderWithEffect,
    isEditing,
    setIsEditing,
    editedFolderName,
    setEditedFolderName,
    editedFolderColor,
    setEditedFolderColor,
    handleEditClick,
    saveEdit,
    cancelEdit,
    hanndledeleteFolder,
    folderCurrentPage,
    folderTotalPages,
    setFolderCurrentPage,
    colors,
    getColorClasses,
    handleKeyPress,
    createFolder
}) => {
    return (
        <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Files Management</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Create and organize your folders efficiently</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search folders..."
                                value={searchTerm}
                                onChange={(e) => handleFolderSearch(e.target.value)}
                                className="w-72 rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Reset folder filters button */}
                        {searchTerm && (
                            <button
                                onClick={resetFolderFilters}
                                className="rounded-lg px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                            >
                                Reset Search
                            </button>
                        )}

                        {/* View Toggle */}
                        <div className="flex rounded-xl bg-gray-100 p-1 shadow-inner dark:bg-gray-700">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`rounded-lg p-3 transition-all duration-200 ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400" : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"}`}
                            >
                                <Grid className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`rounded-lg p-3 transition-all duration-200 ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400" : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"}`}
                            >
                                <List className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex transform items-center gap-3 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
                        >
                            <FolderPlus className="h-5 w-5" />
                            New Folder
                        </button>
                    </div>
                </div>
            </div>

            {/* Create Folder Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-gray-800">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Folder</h2>
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setNewFolderName("");
                                    setSelectedColor("blue");
                                }}
                                className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Folder Name</label>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, createFolder)}
                                    placeholder="Enter folder name..."
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Choose Color</label>
                                <div className="flex gap-3">
                                    {colors.map((color) => {
                                        const colorClasses = getColorClasses(color.name);
                                        return (
                                            <button
                                                key={color.name}
                                                onClick={() => setSelectedColor(color.name)}
                                                className={`h-12 w-12 rounded-2xl ${colorClasses.accent} shadow-md transition-all duration-200 hover:scale-110 ${
                                                    selectedColor === color.name ? "ring-4 ring-gray-400 ring-offset-2 dark:ring-gray-300" : ""
                                                }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => {
                                    setIsCreating(false);
                                    setNewFolderName("");
                                    setSelectedColor("blue");
                                }}
                                className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createFolder}
                                disabled={!newFolderName.trim()}
                                className="flex-1 transform rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Folders Grid/List */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                {foldersToDisplay.length === 0 ? (
                    <div className="py-16 text-center">
                        <Folder className="mx-auto mb-6 h-20 w-20 text-gray-300 dark:text-gray-600" />
                        <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                            {searchTerm ? "No folders found" : "No folders yet"}
                        </h3>
                        <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                            {searchTerm ? "Try adjusting your search terms" : "Create your first folder to get started"}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="mx-auto flex transform items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
                            >
                                <FolderPlus className="h-6 w-6" />
                                Create Folder
                            </button>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {foldersToDisplay.length} {foldersToDisplay.length === 1 ? "Folder" : "Folders"}
                            </h2>

                            <div className="flex flex-wrap items-center gap-4">
                                {searchTerm && (
                                    <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                        Search: "{searchTerm}"
                                    </span>
                                )}

                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Page {folderCurrentPage} of {folderTotalPages}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setFolderCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={folderCurrentPage === 1}
                                            className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setFolderCurrentPage((prev) => Math.min(prev + 1, folderTotalPages))}
                                            disabled={folderCurrentPage === folderTotalPages || folderTotalPages === 0}
                                            className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {foldersToDisplay.map((folder, index) => {
                                    const colorClasses = getColorClasses(folder.color);
                                    return (
                                        <div
                                            key={folder._id}
                                            className="group relative transform cursor-pointer transition-all duration-200 hover:scale-105"
                                            onClick={() => openFolderWithEffect(folder)}
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
                                                        onKeyPress={(e) => handleKeyPress(e, (event) => saveEdit(event, folder._id))}
                                                        className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                        autoFocus
                                                    />
                                                    <div className="mt-4 flex gap-3">
                                                        {colors.map((color) => (
                                                            <button
                                                                key={color.name}
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
                                {foldersToDisplay.map((folder, index) => {
                                    const colorClasses = getColorClasses(folder.color);
                                    return (
                                        <div
                                            key={folder._id}
                                            className={`group relative flex cursor-pointer items-center justify-between p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700`}
                                            onClick={() => openFolderWithEffect(folder)}
                                            style={{ animationDelay: `${index * 100}ms` }}
                                        >
                                            {isEditing === folder._id ? (
                                                <div
                                                    className="flex w-full items-center gap-4"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div
                                                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colorClasses.accent}`}
                                                    >
                                                        <Folder className={`h-6 w-6 text-white`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={editedFolderName}
                                                            onChange={(e) => setEditedFolderName(e.target.value)}
                                                            onKeyPress={(e) => handleKeyPress(e, (event) => saveEdit(event, folder._id))}
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
                                                            <div
                                                                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${colorClasses.accent}`}
                                                            >
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

                        {folderTotalPages >= 1 && (
                            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {foldersToDisplay.length} of {folderTotalPages * 8} folders
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setFolderCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={folderCurrentPage === 1}
                                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </button>
                                    <span className="text-sm font-medium dark:text-white">
                                        Page {folderCurrentPage} of {folderTotalPages}
                                    </span>
                                    <button
                                        onClick={() => setFolderCurrentPage((prev) => Math.min(prev + 1, folderTotalPages))}
                                        disabled={folderCurrentPage === folderTotalPages}
                                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FoldersView;