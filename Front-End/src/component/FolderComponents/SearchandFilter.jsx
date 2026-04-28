import React, { useState, useEffect } from 'react';
import { Search, Grid, List, FolderPlus, Eye, Tag, X, ChevronLeft, ChevronRight, Check, Folder, File, Image, FileText, Music, Video, Calendar, Loader2 } from 'lucide-react';

const SearchAndFilters = ({
    // Search state
    searchType,
    setSearchType,
    searchTerm,
    fileSearchTerm,
    tagSearchTerm,
    // Handlers
    handleFolderSearch,
    handleFileSearch: parentHandleFileSearch,
    handleTagSearch: parentHandleTagSearch,
    resetFolderFilters,
    resetFileFilters: parentResetFileFilters,
    resetTagFilters: parentResetTagFilters,
    // File-related
    getAllFiles,
    fileCurrentPage,
    setFileCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedTags,
    setSelectedTags,
    showAllFilesMode,
    setShowAllFilesMode,
    showAllTagsMode,
    setShowAllTagsMode,
    // Tag-related
    getTags,
    tagCurrentPage,
    setTagCurrentPage,
    // Modal
    isTagModalOpen,
    setIsTagModalOpen,
    // View
    viewMode,
    setViewMode,
    setIsCreating,
    // Data
    tagsToDisplay = [],
    totalTags = 0,
    foldersToDisplay = [],
    openFolderWithEffect,
    handleViewPdf,
    getColorClasses,
    colors,
    getColorClasses: getColorClassesProp,
    // Additional props
    TotalGeneralPages,
    CurrentGeneralPages,
}) => {
    // Local state for tag search within modal
    const [localTagSearchTerm, setLocalTagSearchTerm] = useState('');
    const [localTagCurrentPage, setLocalTagCurrentPage] = useState(1);
    const [localShowAllTagsMode, setLocalShowAllTagsMode] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(false); // Loading state for tags

    const totalTagPages = Math.ceil(totalTags / itemsPerPage);

    // Helper function to check if a file is viewable
    const isViewableFile = (file) => {
        const viewableTypes = ['pdf', 'document', 'ordinance', 'jpg', 'jpeg', 'png', 'gif', 'image'];
        const fileType = (file.fileType || file.category || '').toLowerCase();
        return viewableTypes.includes(fileType);
    };

    // Get file icon based on file type
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

    const getFolderColorClass = (color) => {
        const colorMap = {
            blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
            green: 'bg-green-100 text-green-600 dark:bg-green-900/30',
            red: 'bg-red-100 text-red-600 dark:bg-red-900/30',
            purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30',
            orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
        };
        return colorMap[color] || colorMap.blue;
    };

    const handleFileSearch = (term) => {
        parentHandleFileSearch(term);
        setFileCurrentPage(1);
        setShowAllFilesMode(false);
        if (term && !selectedTags.length) {
            setSelectedTags([]);
        }
    };

    const handleTagSearch = (term) => {
        parentHandleTagSearch(term);
        setTagCurrentPage(1);
        setShowAllTagsMode(false);

        if (term && term.trim()) {
            setSelectedTags([term]);
            setSearchType('file');
            setFileCurrentPage(1);
            closeTagModal();
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
        closeTagModal();
    };

    const resetFileFilters = () => {
        parentResetFileFilters();
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

    const showAllTags = async () => {
        setLocalTagSearchTerm('');
        setLocalTagCurrentPage(1);
        setLocalShowAllTagsMode(!localShowAllTagsMode);
        
        setIsLoadingTags(true); // Start loading
        if (getTags) {
            try {
                await getTags({
                    page: 1,
                    limit: itemsPerPage,
                    showAll: !localShowAllTagsMode
                });
            } finally {
                setIsLoadingTags(false); // End loading
            }
        } else {
            setIsLoadingTags(false);
        }
    };

    const resetTagFilters = () => {
        parentResetTagFilters();
        setLocalTagSearchTerm('');
        setLocalTagCurrentPage(1);
        setLocalShowAllTagsMode(false);
    };

    const openTagModal = async () => {
        setIsTagModalOpen(true);
        setIsLoadingTags(true); // Start loading when opening modal
        if (getTags) {
            try {
                await getTags({
                    page: 1,
                    limit: itemsPerPage,
                    showAll: false
                });
            } finally {
                setIsLoadingTags(false); // End loading
            }
        } else {
            setIsLoadingTags(false);
        }
    };

    const closeTagModal = () => {
        setIsTagModalOpen(false);
        setLocalTagSearchTerm('');
        setLocalTagCurrentPage(1);
        setLocalShowAllTagsMode(false);
        setIsLoadingTags(false); // Reset loading state
    };

    const getFilteredTagItems = () => {
        if (localTagSearchTerm.trim() === '') return [];

        const matchedFolders = foldersToDisplay.filter(folder =>
            (folder.tags || []).some(tag => tag.toLowerCase().includes(localTagSearchTerm.toLowerCase()))
        ).map(folder => ({ ...folder, type: 'folder' }));

        const matchedFiles = (CurrentGeneralPages?.files || []).filter(file =>
            (file.tags || []).some(tag => tag.toLowerCase().includes(localTagSearchTerm.toLowerCase()))
        ).map(file => ({ ...file, type: 'file' }));

        return [...matchedFolders, ...matchedFiles];
    };

    const filteredTagItems = getFilteredTagItems();
    const paginatedTagItems = filteredTagItems.slice((localTagCurrentPage - 1) * itemsPerPage, localTagCurrentPage * itemsPerPage);
    const totalTagResultPages = Math.ceil(filteredTagItems.length / itemsPerPage);

    const handleLocalTagSearch = (term) => {
        setLocalTagSearchTerm(term);
        setLocalTagCurrentPage(1);
        setLocalShowAllTagsMode(false);
    };

    return (
        <>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                    type="text"
                    placeholder={
                        searchType === 'folder' ? "Search folders..." :
                            searchType === 'file' ? "Search files by title or tags..." :
                                "Search by tag..."
                    }
                    value={
                        searchType === 'folder' ? searchTerm :
                            searchType === 'file' ? fileSearchTerm :
                                tagSearchTerm
                    }
                    onChange={(e) => {
                        if (searchType === 'folder') {
                            handleFolderSearch?.(e.target.value);
                        } else if (searchType === 'file') {
                            handleFileSearch(e.target.value);
                        } else {
                            handleTagSearch(e.target.value);
                        }
                    }}
                    className="w-72 rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Search Type Selection */}
            <div className="flex rounded-xl bg-gray-100 p-1 shadow-inner dark:bg-gray-700">
                <button
                    onClick={() => {
                        setSearchType('folder');
                        resetFileFilters();
                        resetTagFilters();
                        setShowAllFilesMode(false);
                        setShowAllTagsMode(false);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${searchType === 'folder'
                        ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
                        }`}
                >
                    Folders
                </button>
                <button
                    onClick={() => {
                        setSearchType('file');
                        resetTagFilters();
                        setShowAllTagsMode(false);
                        if (getAllFiles) {
                            const queryParams = {
                                page: fileCurrentPage,
                                limit: itemsPerPage
                            };
                            getAllFiles(queryParams);
                        }
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${searchType === 'file'
                        ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400"
                        : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"
                        }`}
                >
                    Files
                </button>
                <button
                    onClick={openTagModal}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-1 bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400`}
                >
                    <Tag className="h-4 w-4" />
                    Tags
                </button>
            </div>

            {/* Reset button and Show All button */}
            <div className="flex gap-2">
                {((searchType === 'folder' && searchTerm) ||
                    (searchType === 'file' && (fileSearchTerm || selectedTags.length > 0))) && (
                        <button
                            onClick={() => {
                                if (searchType === 'folder') {
                                    resetFolderFilters?.();
                                } else if (searchType === 'file') {
                                    resetFileFilters();
                                }
                            }}
                            className="rounded-lg px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                        >
                            Reset Search
                        </button>
                    )}
            </div>

            {/* View Toggle - Only show for Folders */}
            {searchType === 'folder' && (
                <div className="flex rounded-xl bg-gray-100 p-1 shadow-inner dark:bg-gray-700">
                    <button
                        onClick={() => setViewMode?.("grid")}
                        className={`rounded-lg p-3 transition-all duration-200 ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400" : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"}`}
                    >
                        <Grid className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode?.("list")}
                        className={`rounded-lg p-3 transition-all duration-200 ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400" : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"}`}
                    >
                        <List className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Create Button */}
            {searchType === 'folder' && (
                <button
                    onClick={() => setIsCreating?.(true)}
                    className="flex transform items-center gap-3 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
                >
                    <FolderPlus className="h-5 w-5" />
                    New Folder
                </button>
            )}

            {/* Tags Modal */}
            {isTagModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl scale-100 transform rounded-2xl bg-white shadow-2xl transition-all duration-300 dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Tags</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Browse and filter by tags</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeTagModal}
                                    className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                     

                            {/* Show All Tags Button */}
                            <div className="mb-4 flex justify-end">
                                <button
                                    onClick={showAllTags}
                                    disabled={isLoadingTags}
                                    className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-green-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingTags ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                    {localShowAllTagsMode ? "Show Less" : "Show All Tags"}
                                </button>
                            </div>

                            {/* Loading State */}
                            {isLoadingTags && !localTagSearchTerm ? (
                                <div className="py-12 text-center">
                                    <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
                                    <p className="text-gray-500 dark:text-gray-400">Loading tags...</p>
                                </div>
                            ) : !localTagSearchTerm ? (
                                <div>
                                    {tagsToDisplay.length === 0 ? (
                                        <div className="py-12 text-center">
                                            <Tag className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">No tags available</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-3 max-h-96 overflow-y-auto p-2">
                                            {tagsToDisplay.map((tag, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleTagSelect(tag)}
                                                    className={`group relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-md ${selectedTags.includes(tag)
                                                        ? 'bg-blue-500 text-white shadow-md'
                                                        : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 hover:from-blue-200 hover:to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 dark:text-blue-400'
                                                        }`}
                                                >
                                                    #{tag}
                                                    {selectedTags.includes(tag) && (
                                                        <Check className="ml-1 inline-block h-3 w-3" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : filteredTagItems.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Tag className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                                    <p className="text-gray-500 dark:text-gray-400">No items found with tag "{localTagSearchTerm}"</p>
                                    <button
                                        onClick={resetTagFilters}
                                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Found {filteredTagItems.length} {filteredTagItems.length === 1 ? "item" : "items"} with tag "{localTagSearchTerm}"
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Page {localTagCurrentPage} of {totalTagResultPages}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setLocalTagCurrentPage(prev => Math.max(prev - 1, 1))}
                                                    disabled={localTagCurrentPage === 1}
                                                    className="rounded-lg border border-gray-300 p-1 disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setLocalTagCurrentPage(prev => Math.min(prev + 1, totalTagResultPages))}
                                                    disabled={localTagCurrentPage === totalTagResultPages || totalTagResultPages === 0}
                                                    className="rounded-lg border border-gray-300 p-1 disabled:opacity-50 dark:border-gray-600 dark:text-white"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                        {paginatedTagItems.map((item, index) => (
                                            <div
                                                key={`${item.type}-${item._id}`}
                                                className="flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                                onClick={() => {
                                                    if (item.type === 'folder') {
                                                        closeTagModal();
                                                        openFolderWithEffect?.(item);
                                                    } else {
                                                        console.log('Opening file:', item);
                                                        if (handleViewPdf && isViewableFile(item)) {
                                                            handleViewPdf(item);
                                                        }
                                                        closeTagModal();
                                                    }
                                                }}
                                            >
                                                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${item.type === 'folder'
                                                    ? getFolderColorClass(item.color)
                                                    : 'bg-gray-100 dark:bg-gray-600'
                                                    }`}>
                                                    {item.type === 'folder' ? (
                                                        <Folder className="h-5 w-5" />
                                                    ) : (
                                                        getFileIcon(item)
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                                            {item.type === 'folder' ? item.folderName : (item.title || item.fileName || item.name || 'Untitled')}
                                                        </p>
                                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                    {item.tags && item.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {item.tags.slice(0, 2).map(tag => (
                                                                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                            {item.tags.length > 2 && (
                                                                <span className="text-xs text-gray-400">+{item.tags.length - 2}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-200 p-6 dark:border-gray-700">
                            <div className="flex justify-between gap-4">
                                {selectedTags.length > 0 && (
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Selected tags:</span>
                                            {selectedTags.map(tag => (
                                                <span key={tag} className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    #{tag}
                                                </span>
                                            ))}
                                            <button
                                                onClick={() => setSelectedTags([])}
                                                className="text-sm text-red-500 hover:text-red-600"
                                            >
                                                Clear all
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={closeTagModal}
                                        className="rounded-xl border border-gray-300 px-6 py-2 font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                                    >
                                        Close
                                    </button>
                                    {selectedTags.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setSearchType('file');
                                                closeTagModal();
                                            }}
                                            className="rounded-xl bg-blue-600 px-6 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:bg-blue-700"
                                        >
                                            Apply Filters ({selectedTags.length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SearchAndFilters;