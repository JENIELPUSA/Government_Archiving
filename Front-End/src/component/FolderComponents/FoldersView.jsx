// FoldersView.js
import React, { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, Folder, FolderPlus, ChevronLeft, ChevronRight, X, Check, File, Image, FileText, Music, Video, Eye, Tag } from 'lucide-react';
import SearchAndFilters from './SearchandFilter';

const FoldersView = ({
    foldersToDisplay = [],
    searchTerm = '',
    handleFolderSearch,
    resetFolderFilters,
    viewMode = 'grid',
    setViewMode,
    isCreating = false,
    setIsCreating,
    newFolderName = '',
    setNewFolderName,
    selectedColor = 'blue',
    setSelectedColor,
    openFolderWithEffect,
    isEditing = null,
    setIsEditing,
    editedFolderName = '',
    setEditedFolderName,
    editedFolderColor = 'blue',
    setEditedFolderColor,
    handleEditClick,
    saveEdit,
    cancelEdit,
    hanndledeleteFolder,
    folderCurrentPage = 1,
    folderTotalPages = 1,
    setFolderCurrentPage,
    colors = [],
    getColorClasses,
    handleKeyPress,
    createFolder,
    TotalGeneralPages = 0,
    GeneralFile = [],
    getAllFiles,
    CurrentGeneralPages,
    getTags,
    istags = [],
    totalTags = 0,
    handleViewPdf,
}) => {
    // LOCAL STATE FOR SEARCH TYPE
    const [searchType, setSearchType] = useState('folder');
    const [fileSearchTerm, setFileSearchTerm] = useState('');
    const [tagSearchTerm, setTagSearchTerm] = useState('');
    const [fileCurrentPage, setFileCurrentPage] = useState(1);
    const [tagCurrentPage, setTagCurrentPage] = useState(1);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showAllFilesMode, setShowAllFilesMode] = useState(false);
    const [showAllTagsMode, setShowAllTagsMode] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filesToDisplay = GeneralFile || [];

    // Calculate total pages based on total pages from API
    const totalFilePages = TotalGeneralPages;
    const totalTagPages = Math.ceil(totalTags / itemsPerPage);

    const tagsToDisplay = istags || [];

    // Helper function to check if a file is viewable
    const isViewableFile = (file) => {
        const viewableTypes = ['pdf', 'document', 'ordinance', 'jpg', 'jpeg', 'png', 'gif', 'image'];
        const fileType = (file.fileType || file.category || '').toLowerCase();
        return viewableTypes.includes(fileType);
    };

    useEffect(() => {
        if (searchType === 'file' && getAllFiles) {
            const queryParams = {
                page: fileCurrentPage,
                limit: itemsPerPage
            };

            if (fileSearchTerm) {
                queryParams.search = fileSearchTerm;
                queryParams.showAll = false;
            } else if (showAllFilesMode) {
                queryParams.showAll = true;
            }

            if (selectedTags.length > 0) {
                queryParams.tags = selectedTags.join(',');
            }
            getAllFiles(queryParams);
        }
    }, [fileCurrentPage, searchType, fileSearchTerm, selectedTags, getAllFiles, showAllFilesMode, itemsPerPage]);

    useEffect(() => {
        if (searchType === 'tag' && getTags) {
            const queryParams = {
                page: tagCurrentPage,
                limit: itemsPerPage
            };

            if (tagSearchTerm) {
                queryParams.search = tagSearchTerm;
                queryParams.showAll = false;
            } else if (showAllTagsMode) {
                queryParams.showAll = true;
            }

            getTags(queryParams);
        }
    }, [tagCurrentPage, searchType, tagSearchTerm, getTags, showAllTagsMode, itemsPerPage]);

    useEffect(() => {
        if (CurrentGeneralPages && typeof CurrentGeneralPages === 'function') {
            // Optional: You can add logic here if needed
        }
    }, [CurrentGeneralPages]);

    const handleFileSearch = (term) => {
        setFileSearchTerm(term);
        setFileCurrentPage(1);
        setShowAllFilesMode(false);
        if (term && !selectedTags.length) {
            setSelectedTags([]);
        }
    };

    const handleTagSearch = (term) => {
        setTagSearchTerm(term);
        setTagCurrentPage(1);
        setShowAllTagsMode(false);

        if (term && term.trim()) {
            setSelectedTags([term]);
            setSearchType('file');
            setFileCurrentPage(1);
            setIsTagModalOpen(false);
        }
    };

    const handleTagSelect = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
        setFileCurrentPage(1);
        setShowAllFilesMode(false);
        setSearchType('file');
        setIsTagModalOpen(false);
    };

    const resetFileFilters = () => {
        setFileSearchTerm('');
        setSelectedTags([]);
        setFileCurrentPage(1);
        setShowAllFilesMode(false);
        if (getAllFiles) {
            const queryParams = {
                page: 1,
                limit: itemsPerPage
            };
            getAllFiles(queryParams);
        }
    };

    const showAllFiles = () => {
        setFileSearchTerm('');
        setSelectedTags([]);
        setFileCurrentPage(1);
        setShowAllFilesMode(!showAllFilesMode);

        if (getAllFiles) {
            const queryParams = {
                page: 1,
                limit: itemsPerPage
            };

            if (!showAllFilesMode) {
                queryParams.showAll = true;
            }

            getAllFiles(queryParams);
        }
    };

    const showAllTags = () => {
        setTagSearchTerm('');
        setTagCurrentPage(1);
        setShowAllTagsMode(!showAllTagsMode);

        if (getTags) {
            getTags({
                page: 1,
                limit: itemsPerPage,
                showAll: !showAllTagsMode
            });
        }
    };

    const resetTagFilters = () => {
        setTagSearchTerm('');
        setTagCurrentPage(1);
        setShowAllTagsMode(false);

        if (getTags) {
            getTags({
                page: 1,
                limit: itemsPerPage,
                showAll: false
            });
        }
    };

    const handleFilePageChange = (newPage) => {
        setFileCurrentPage(newPage);
        if (CurrentGeneralPages && typeof CurrentGeneralPages === 'function') {
            CurrentGeneralPages(newPage);
        }
    };

    const getFileIcon = (file) => {
        const fileType = file.fileType || file.category;
        switch (fileType) {
            case 'pdf': return <FileText className="h-6 w-6 text-red-500" />;
            case 'image': return <Image className="h-6 w-6 text-green-500" />;
            case 'excel': return <FileText className="h-6 w-6 text-green-600" />;
            case 'ppt': return <FileText className="h-6 w-6 text-orange-500" />;
            case 'word': return <FileText className="h-6 w-6 text-blue-500" />;
            case 'audio': return <Music className="h-6 w-6 text-purple-500" />;
            case 'video': return <Video className="h-6 w-6 text-pink-500" />;
            case 'Resolution': return <FileText className="h-6 w-6 text-blue-500" />;
            default: return <File className="h-6 w-6 text-gray-500" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, fileCurrentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalFilePages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

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
                        <SearchAndFilters
                            searchType={searchType}
                            setSearchType={setSearchType}
                            searchTerm={searchTerm}
                            fileSearchTerm={fileSearchTerm}
                            tagSearchTerm={tagSearchTerm}
                            handleFolderSearch={handleFolderSearch}
                            handleFileSearch={handleFileSearch}
                            handleTagSearch={handleTagSearch}
                            resetFolderFilters={resetFolderFilters}
                            resetFileFilters={resetFileFilters}
                            resetTagFilters={resetTagFilters}
                            getAllFiles={getAllFiles}
                            fileCurrentPage={fileCurrentPage}
                            setFileCurrentPage={setFileCurrentPage}
                            itemsPerPage={itemsPerPage}
                            setItemsPerPage={setItemsPerPage}
                            selectedTags={selectedTags}
                            setSelectedTags={setSelectedTags}
                            showAllFilesMode={showAllFilesMode}
                            setShowAllFilesMode={setShowAllFilesMode}
                            showAllTagsMode={showAllTagsMode}
                            setShowAllTagsMode={setShowAllTagsMode}
                            getTags={getTags}
                            tagCurrentPage={tagCurrentPage}
                            setTagCurrentPage={setTagCurrentPage}
                            isTagModalOpen={isTagModalOpen}
                            setIsTagModalOpen={setIsTagModalOpen}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            setIsCreating={setIsCreating}
                            tagsToDisplay={tagsToDisplay}
                            totalTags={totalTags}
                            foldersToDisplay={foldersToDisplay}
                            openFolderWithEffect={openFolderWithEffect}
                            handleViewPdf={handleViewPdf}
                            getColorClasses={getColorClasses}
                            colors={colors}
                            TotalGeneralPages={TotalGeneralPages}
                            CurrentGeneralPages={CurrentGeneralPages}
                        />
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
                                    setIsCreating?.(false);
                                    setNewFolderName?.("");
                                    setSelectedColor?.("blue");
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
                                    onChange={(e) => setNewFolderName?.(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress?.(e, createFolder)}
                                    placeholder="Enter folder name..."
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Choose Color</label>
                                <div className="flex gap-3">
                                    {colors.map((color) => {
                                        const colorClasses = getColorClasses?.(color.name);
                                        return (
                                            <button
                                                key={color.name}
                                                onClick={() => setSelectedColor?.(color.name)}
                                                className={`h-12 w-12 rounded-2xl ${colorClasses?.accent} shadow-md transition-all duration-200 hover:scale-110 ${selectedColor === color.name ? "ring-4 ring-gray-400 ring-offset-2 dark:ring-gray-300" : ""
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
                                    setIsCreating?.(false);
                                    setNewFolderName?.("");
                                    setSelectedColor?.("blue");
                                }}
                                className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createFolder}
                                disabled={!newFolderName?.trim()}
                                className="flex-1 transform rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Folder Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-gray-800">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Folder</h2>
                            <button
                                onClick={() => cancelEdit?.(null)}
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
                                    value={editedFolderName}
                                    onChange={(e) => setEditedFolderName?.(e.target.value)}
                                    onKeyPress={(e) => handleKeyPress?.(e, () => saveEdit?.(e, isEditing))}
                                    placeholder="Enter folder name..."
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Choose Color</label>
                                <div className="flex gap-3">
                                    {colors.map((color) => {
                                        const colorClasses = getColorClasses?.(color.name);
                                        return (
                                            <button
                                                key={color.name}
                                                onClick={() => setEditedFolderColor?.(color.name)}
                                                className={`h-12 w-12 rounded-2xl ${colorClasses?.accent} shadow-md transition-all duration-200 hover:scale-110 ${editedFolderColor === color.name ? "ring-4 ring-gray-400 ring-offset-2 dark:ring-gray-300" : ""
                                                    }`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => cancelEdit?.(null)}
                                className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={(e) => saveEdit?.(e, isEditing)}
                                disabled={!editedFolderName?.trim()}
                                className="flex-1 transform rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Conditional Display: Folder or File Results */}
            {searchType === 'folder' ? (
                // FOLDER RESULTS
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {!foldersToDisplay || foldersToDisplay.length === 0 ? (
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
                                    onClick={() => setIsCreating?.(true)}
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
                                                onClick={() => setFolderCurrentPage?.((prev) => Math.max(prev - 1, 1))}
                                                disabled={folderCurrentPage === 1}
                                                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setFolderCurrentPage?.((prev) => Math.min(prev + 1, folderTotalPages))}
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
                                        const colorClasses = getColorClasses?.(folder.color);
                                        return (
                                            <div
                                                key={folder._id}
                                                className="group relative transform cursor-pointer transition-all duration-200 hover:scale-105"
                                                onClick={() => openFolderWithEffect?.(folder)}
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div
                                                    className={`flex h-48 flex-col justify-between rounded-2xl border-2 p-6 transition-all duration-200 ${colorClasses?.bg} ${colorClasses?.border} shadow-lg group-hover:shadow-xl`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div
                                                            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${colorClasses?.accent}`}
                                                        >
                                                            <Folder className={`h-6 w-6 text-white`} />
                                                        </div>
                                                        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditClick?.(e, folder);
                                                                    }}
                                                                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                                                >
                                                                    <Edit className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openFolderWithEffect?.(folder);
                                                                    }}
                                                                    className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-100 dark:hover:bg-gray-700"
                                                                >
                                                                    <Eye className="h-5 w-5" />
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
                                                        {folder.tags && folder.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {folder.tags.slice(0, 2).map(tag => (
                                                                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                                        #{tag}
                                                                    </span>
                                                                ))}
                                                                {folder.tags.length > 2 && (
                                                                    <span className="text-xs text-gray-400">+{folder.tags.length - 2}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {foldersToDisplay.map((folder, index) => {
                                        const colorClasses = getColorClasses?.(folder.color);
                                        return (
                                            <div
                                                key={folder._id}
                                                className={`group relative flex cursor-pointer items-center justify-between p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700`}
                                                onClick={() => openFolderWithEffect?.(folder)}
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                <div className="flex w-full items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <div
                                                            className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${colorClasses?.accent}`}
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
                                                            {folder.tags && folder.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {folder.tags.map(tag => (
                                                                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick?.(e, folder);
                                                                }}
                                                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                                            >
                                                                <Edit className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openFolderWithEffect?.(folder);
                                                                }}
                                                                className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-100 dark:hover:bg-gray-700"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
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
                                            onClick={() => setFolderCurrentPage?.((prev) => Math.max(prev - 1, 1))}
                                            disabled={folderCurrentPage === 1}
                                            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                        >
                                            <ChevronLeft className="h-4 w-4" /> Previous
                                        </button>
                                        <span className="text-sm font-medium dark:text-white">
                                            Page {folderCurrentPage} of {folderTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setFolderCurrentPage?.((prev) => Math.min(prev + 1, folderTotalPages))}
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
            ) : (
                // FILE RESULTS - WITH VIEW BUTTON
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {/* File Statistics Header */}
                    <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Total Pages: <span className="text-blue-600 dark:text-blue-400">{TotalGeneralPages.toLocaleString()}</span>
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Showing {filesToDisplay.length} files on page {fileCurrentPage} of {totalFilePages}
                                    {TotalGeneralPages > 0 && (
                                        <span className="ml-2 text-gray-500">
                                            (Approximately {(TotalGeneralPages * itemsPerPage).toLocaleString()} total files)
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Items per page selector */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            const newLimit = parseInt(e.target.value);
                                            setItemsPerPage(newLimit);
                                            setFileCurrentPage(1);
                                            if (getAllFiles && searchType === 'file') {
                                                const queryParams = {
                                                    page: 1,
                                                    limit: newLimit
                                                };
                                                if (fileSearchTerm) {
                                                    queryParams.search = fileSearchTerm;
                                                }
                                                if (selectedTags.length > 0) {
                                                    queryParams.tags = selectedTags.join(',');
                                                }
                                                if (showAllFilesMode) {
                                                    queryParams.showAll = true;
                                                }
                                                getAllFiles(queryParams);
                                            }
                                        }}
                                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value={10}>10 per page</option>
                                        <option value={25}>25 per page</option>
                                        <option value={50}>50 per page</option>
                                        <option value={100}>100 per page</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(fileSearchTerm || selectedTags.length > 0) && (
                        <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Filters:</span>
                                {fileSearchTerm && (
                                    <span className="rounded-full bg-blue-200 px-2 py-1 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                        Search: {fileSearchTerm}
                                    </span>
                                )}
                                {selectedTags.map(tag => (
                                    <span key={tag} className="rounded-full bg-blue-200 px-2 py-1 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsTagModalOpen(true)}
                                    className="flex items-center gap-1 rounded-lg bg-purple-500 px-3 py-1 text-xs font-medium text-white hover:bg-purple-600"
                                >
                                    <Tag className="h-3 w-3" />
                                    Manage Tags
                                </button>
                                <button
                                    onClick={showAllFiles}
                                    className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600"
                                >
                                    <Eye className="h-3 w-3" />
                                    {showAllFilesMode ? "Show Less" : "Show All"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Selected Tags Display */}
                    {selectedTags.length > 0 && (
                        <div className="mb-6 flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg dark:bg-gray-700/50">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtering by tags:</span>
                            {selectedTags.map(tag => (
                                <span key={tag} className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                                    #{tag}
                                    <button
                                        onClick={() => handleTagSelect(tag)}
                                        className="ml-2 hover:text-gray-200"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="text-xs text-red-500 hover:text-red-600 ml-2"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    )}

                    {!filesToDisplay || filesToDisplay.length === 0 ? (
                        <div className="py-16 text-center">
                            <File className="mx-auto mb-6 h-20 w-20 text-gray-300 dark:text-gray-600" />
                            <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                                {fileSearchTerm || selectedTags.length > 0 ? "No files found" : "No files yet"}
                            </h3>
                            <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                                {fileSearchTerm || selectedTags.length > 0 ? "Try adjusting your search terms or tags" : "Upload your first file to get started"}
                            </p>
                            {(fileSearchTerm || selectedTags.length > 0) && (
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={resetFileFilters}
                                        className="flex transform items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700"
                                    >
                                        Clear Filters
                                    </button>
                                    <button
                                        onClick={() => setIsTagModalOpen(true)}
                                        className="flex transform items-center gap-3 rounded-xl bg-purple-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-purple-700"
                                    >
                                        <Tag className="h-5 w-5" />
                                        Browse Tags
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {/* LIST VIEW ONLY for Files */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filesToDisplay.map((file, index) => (
                                    <div
                                        key={file._id}
                                        className="group relative flex cursor-pointer items-center justify-between p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-600">
                                                    {getFileIcon(file)}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                        {file.title || file.fileName || file.name || 'Untitled'}
                                                    </h3>
                                                    {file.tags && file.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {file.tags.map(tag => (
                                                                <span
                                                                    key={tag}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleTagSelect(tag);
                                                                    }}
                                                                    className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{new Date(file.createdAt || file.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <span>{formatFileSize(file.fileSize || file.size)}</span>
                                                        {file.category && (
                                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                                {file.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                <div className="flex gap-2">
                                                    {/* VIEW BUTTON - ALWAYS VISIBLE */}
                                                    {handleViewPdf && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewPdf(file);
                                                            }}
                                                            className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-100 dark:hover:bg-gray-700"
                                                            title="View file"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                  
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalFilePages >= 1 && (
                                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {filesToDisplay.length} of {TotalGeneralPages * itemsPerPage} total files (estimated)
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleFilePageChange(1)}
                                            disabled={fileCurrentPage === 1}
                                            className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                        >
                                            First
                                        </button>
                                        <button
                                            onClick={() => handleFilePageChange(fileCurrentPage - 1)}
                                            disabled={fileCurrentPage === 1}
                                            className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                        >
                                            Previous
                                        </button>

                                        {/* Page numbers */}
                                        <div className="flex gap-1">
                                            {getPageNumbers().map(pageNum => (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handleFilePageChange(pageNum)}
                                                    className={`rounded-lg px-3 py-1 text-sm transition-colors ${fileCurrentPage === pageNum
                                                        ? 'bg-blue-600 text-white'
                                                        : 'border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleFilePageChange(fileCurrentPage + 1)}
                                            disabled={fileCurrentPage === totalFilePages}
                                            className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                        >
                                            Next
                                        </button>
                                        <button
                                            onClick={() => handleFilePageChange(totalFilePages)}
                                            disabled={fileCurrentPage === totalFilePages}
                                            className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                        >
                                            Last
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FoldersView;