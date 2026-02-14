import React, { useState, useMemo } from "react";
import {
    ArrowLeft,
    Upload,
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    Folder,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    X,
} from "lucide-react";
import EditDocumentModal from "../AdminDashboard/Document/EditDocumentModal";
import UploadDocumentModal from "./FormUpload/UploadDocuments";

// Skeleton Loading Components
const FileItemSkeleton = () => (
    <div className="group p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-2">
                    <div className="h-5 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
            </div>
            <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        </div>
    </div>
);

const SearchBarSkeleton = () => (
    <div className="relative min-w-[250px] flex-1">
        <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
    </div>
);

const DateFilterSkeleton = () => (
    <div className="flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
    </div>
);

const PaginationSkeleton = () => (
    <div className="flex items-center gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex gap-2">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        </div>
    </div>
);

const TagsFilterSkeleton = () => (
    <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
);

const ShowPerPageSkeleton = () => (
    <div className="flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-20 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"></div>
    </div>
);

const FilterSectionSkeleton = () => (
    <div className="flex flex-1 flex-wrap items-center gap-4">
        <SearchBarSkeleton />
        <TagsFilterSkeleton />
        <DateFilterSkeleton />
        <DateFilterSkeleton />
        <ShowPerPageSkeleton />
    </div>
);

const FilesView = ({
    fetchFilterTags,
    setIsTagsDropdownOpen,
    isTagsDropdownOpen,
    selectedTags,
    setSelectedTags,
    isTags,
    openFolder,
    selectedCategory,
    handleUploadFiles,
    isfolderFiles,
    isLoadingFiles,
    fileSearchTerm,
    setFileSearchTerm,
    fileDateFrom,
    setFileDateFrom,
    fileDateTo,
    setFileDateTo,
    resetFileFilters,
    fileCurrentPage,
    fileTotalPages,
    fetchSpecificData,
    openFileMenu,
    setOpenFileMenu,
    handleViewPdf,
    handleDeleteFiles,
    getFileIcon,
    isUploadModalOpen,
    closeUploadModal,
    Success,
    show,
    setShow,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [searchTimer, setSearchTimer] = useState(null);
    
    const handleEditSave = (updatedDocument) => {
        setIsEditing(false);
        setCurrentDocument(null);
        fetchSpecificData(openFolder._id, {
            search: fileSearchTerm,
            type: "",
            dateFrom: fileDateFrom,
            dateTo: fileDateTo,
            page: fileCurrentPage,
            tags: selectedTags,
        });
    };

    const handleEditClick = (file) => {
        setCurrentDocument(file);
        setIsEditing(true);
        setOpenFileMenu(null);
    };

    const handleFileSearch = (e) => {
        const newSearchTerm = e.target.value;
        setFileSearchTerm(newSearchTerm);

        if (searchTimer) {
            clearTimeout(searchTimer);
        }

        const timer = setTimeout(() => {
            fetchSpecificData(openFolder._id, {
                search: newSearchTerm,
                type: "",
                dateFrom: fileDateFrom,
                dateTo: fileDateTo,
                page: 1,
                tags: selectedTags,
            });
        }, 2000);

        setSearchTimer(timer);
    };

    const handleDateFromChange = (e) => {
        setFileDateFrom(e.target.value);
        fetchSpecificData(openFolder._id, {
            search: fileSearchTerm,
            type: "",
            dateFrom: e.target.value,
            dateTo: fileDateTo,
            page: 1,
            tags: selectedTags,
        });
    };

    const handleDateToChange = (e) => {
        setFileDateTo(e.target.value);
        fetchSpecificData(openFolder._id, {
            search: fileSearchTerm,
            type: "",
            dateFrom: fileDateFrom,
            dateTo: e.target.value,
            page: 1,
            tags: selectedTags,
        });
    };

    const handleTagSelection = (tagValue) => {
        const newSelectedTags = selectedTags.includes(tagValue) ? selectedTags.filter((tag) => tag !== tagValue) : [...selectedTags, tagValue];

        setSelectedTags(newSelectedTags);
        fetchSpecificData(openFolder._id, {
            search: fileSearchTerm,
            type: "",
            dateFrom: fileDateFrom,
            dateTo: fileDateTo,
            page: 1,
            tags: newSelectedTags,
        });
    };

    const removeTag = (tagToRemove) => {
        const newSelectedTags = selectedTags.filter((tag) => tag !== tagToRemove);
        setSelectedTags(newSelectedTags);
        fetchSpecificData(openFolder._id, {
            search: fileSearchTerm,
            type: "",
            dateFrom: fileDateFrom,
            dateTo: fileDateTo,
            page: 1,
            tags: newSelectedTags,
        });
    };

    const resetAllFilters = () => {
        setFileSearchTerm("");
        setFileDateFrom("");
        setFileDateTo("");
        setSelectedTags([]);
        resetFileFilters();
    };

    // Function to check if document is a resolution or ordinance and show committee members
    const renderResolutionOrdinanceInfo = (file) => {
        // Check if the file is a resolution or ordinance based on category or tags
        const isResolutionOrOrdinance = 
            file.category?.toLowerCase().includes('resolution') || 
            file.category?.toLowerCase().includes('ordinance') ||
            file.tags?.some(tag => 
                tag.toLowerCase().includes('resolution') || 
                tag.toLowerCase().includes('ordinance')
            );

        if (!isResolutionOrOrdinance) {
            return null;
        }

        return (
            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Document Information:</p>
                
                {/* Ang chairperson ay ang author ng Resolution o Ordinance */}
                {file.author && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Chairperson/Author:</span> {file.author}
                    </p>
                )}
                
                {file.viceChairperson && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Vice Chairperson:</span> {file.viceChairperson}
                    </p>
                )}
                
                {file.members && file.members.length > 0 && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Committee Members:</span> {file.members.join(', ')}
                    </p>
                )}
                
                {/* Additional resolution/ordinance information */}
                {file.dateApproved && (
                    <p className="text-xs text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Date Approved:</span> {new Date(file.dateApproved).toLocaleDateString()}
                    </p>
                )}
            </div>
        );
    };

    const filteredFiles = useMemo(() => {
        return isfolderFiles?.filter((file) => {
            // Extended search to include resolution/ordinance information
            const searchInMembers = file.members && file.members.some(member => 
                member.toLowerCase().includes(fileSearchTerm.toLowerCase())
            );
            
            const searchInViceChairperson = file.viceChairperson?.toLowerCase().includes(fileSearchTerm.toLowerCase());
            
            const matchesSearch =
                file.title?.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
                file.fileName?.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
                file.author?.toLowerCase().includes(fileSearchTerm.toLowerCase()) || // Author is now Chairperson
                searchInViceChairperson ||
                searchInMembers ||
                file.resolutionNumber?.toLowerCase().includes(fileSearchTerm.toLowerCase()) ||
                file.ordinanceNumber?.toLowerCase().includes(fileSearchTerm.toLowerCase());

            const fileDate = new Date(file.createdAt);
            const fromDate = fileDateFrom ? new Date(fileDateFrom) : null;
            const toDate = fileDateTo ? new Date(fileDateTo) : null;

            const matchesDateRange = (!fromDate || fileDate >= fromDate) && (!toDate || fileDate <= toDate);

            // Filter by tags - show files that have at least one of the selected tags
            const matchesTags = selectedTags.length === 0 || (file.tags && selectedTags.some((tag) => file.tags.includes(tag)));

            return matchesSearch && matchesDateRange && matchesTags;
        });
    }, [isfolderFiles, fileSearchTerm, fileDateFrom, fileDateTo, selectedTags]);

    const colorClasses = {
        bg: "bg-blue-100 dark:bg-blue-900",
        icon: "text-blue-500 dark:text-blue-300",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    {/* Combined search and filter bar */}
                    {isLoadingFiles ? (
                        <>
                            <FilterSectionSkeleton />
                            <PaginationSkeleton />
                        </>
                    ) : (
                        <>
                            <div className="flex flex-1 flex-wrap items-center gap-4">
                                {/* File Search Input with Tag Suggestions */}
                                <div className="relative min-w-[250px] flex-1">
                                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search files, tags, chairperson, committee members, or resolution numbers..."
                                        value={fileSearchTerm}
                                        onChange={handleFileSearch}
                                        className="w-full rounded-xl border border-gray-300 py-2 pl-12 pr-4 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />

                                    {/* Suggestions Dropdown */}
                                    {fileSearchTerm && (
                                        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            {isTags
                                                ?.filter((tag) => {
                                                    const tagValue = tag.tagName || tag.name || tag;
                                                    if (typeof tagValue !== "string") return false;

                                                    const searchWords = fileSearchTerm.toLowerCase().split(/\s+/).filter(Boolean);

                                                    return searchWords.some((word) => tagValue.toLowerCase().includes(word));
                                                })
                                                .map((tag, idx) => {
                                                    const tagValue = tag.tagName || tag.name || tag;
                                                    return (
                                                        <button
                                                            key={tag._id || idx}
                                                            onClick={() => {
                                                                setFileSearchTerm(tagValue);
                                                                fetchSpecificData(openFolder._id, {
                                                                    search: tagValue,
                                                                    type: "",
                                                                    dateFrom: fileDateFrom,
                                                                    dateTo: fileDateTo,
                                                                    page: 1,
                                                                    tags: selectedTags,
                                                                });
                                                            }}
                                                            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            {tagValue}
                                                        </button>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>

                                {/* Tags Filter Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsTagsDropdownOpen(!isTagsDropdownOpen)}
                                        className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm shadow-sm hover:bg-gray-50 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        <span>Tags {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>

                                    {isTagsDropdownOpen && (
                                        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            <div className="sticky top-0 bg-white p-2 dark:bg-gray-800">
                                                <button
                                                    onClick={() => setSelectedTags([])}
                                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                >
                                                    Clear all
                                                </button>
                                            </div>
                                            {isTags?.map((tag, idx) => {
                                                const tagValue = tag.tagName || tag.name || tag;
                                                return (
                                                    <div
                                                        key={tag._id || idx}
                                                        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id={`tag-${tag._id || idx}`}
                                                            checked={selectedTags.includes(tagValue)}
                                                            onChange={() => handleTagSelection(tagValue)}
                                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <label
                                                            htmlFor={`tag-${tag._id || idx}`}
                                                            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                                                        >
                                                            {tagValue}
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Date Range */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
                                    <input
                                        type="date"
                                        value={fileDateFrom}
                                        onChange={handleDateFromChange}
                                        className="rounded-xl border border-gray-300 px-2 py-1 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                                    <input
                                        type="date"
                                        value={fileDateTo}
                                        onChange={handleDateToChange}
                                        className="rounded-xl border border-gray-300 px-2 py-1 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Show per page dropdown */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</label>
                                    <select
                                        value={show}
                                        onChange={(e) => {
                                            const showValue = Number(e.target.value);
                                            setShow(showValue);
                                            fetchSpecificData(openFolder._id, {
                                                page: 1,
                                                limit: showValue,
                                                categoryId: selectedCategory.categoryID,
                                                tags: selectedTags,
                                            });
                                        }}
                                        className="rounded-xl border border-gray-300 px-2 py-1 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={40}>40</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                {/* Reset Button */}
                                {(fileSearchTerm || fileDateFrom || fileDateTo || selectedTags.length > 0) && (
                                    <button
                                        onClick={resetAllFilters}
                                        className="rounded-lg px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {fileCurrentPage} of {fileTotalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            fetchSpecificData(openFolder._id, {
                                                search: fileSearchTerm,
                                                type: "",
                                                dateFrom: fileDateFrom,
                                                dateTo: fileDateTo,
                                                page: Math.max(fileCurrentPage - 1, 1),
                                                tags: selectedTags,
                                            })
                                        }
                                        disabled={fileCurrentPage === 1}
                                        className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() =>
                                            fetchSpecificData(openFolder._id, {
                                                search: fileSearchTerm,
                                                type: "",
                                                dateFrom: fileDateFrom,
                                                dateTo: fileDateTo,
                                                page: Math.min(fileCurrentPage + 1, fileTotalPages),
                                                tags: selectedTags,
                                            })
                                        }
                                        disabled={fileCurrentPage === fileTotalPages || fileTotalPages === 0}
                                        className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected tags:</span>
                        {selectedTags.map((tag, index) => (
                            <span
                                key={index}
                                className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                                {tag}
                                <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Folder Content */}
            <div className="mx-auto max-w-7xl px-6 pb-8">
                {isLoadingFiles ? (
                    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                            <div className="mb-2 h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <FileItemSkeleton key={index} />
                            ))}
                        </div>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className={`h-32 w-32 ${colorClasses.bg} mx-auto mb-8 flex items-center justify-center rounded-3xl shadow-lg`}>
                            <Folder className={`h-16 w-16 ${colorClasses.icon}`} />
                        </div>
                        <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">No files found</h3>
                        <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                            {fileSearchTerm || fileDateFrom || fileDateTo || selectedTags.length > 0
                                ? "Try adjusting your filters"
                                : "Add some files to get started"}
                        </p>

                        <button
                            onClick={handleUploadFiles}
                            className="mx-auto flex transform items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
                        >
                            <Upload className="h-5 w-5" />
                            Upload Files
                        </button>
                    </div>
                ) : (
                    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Files in this folder</h2>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Showing {filteredFiles.length} files</p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredFiles.map((file, index) => {
                                const fileExtension = file.fileName?.split(".").pop()?.toLowerCase() || "";
                                const fileType = file.category || fileExtension;
                                const IconComponent = getFileIcon(fileType);

                                // Display resolution/ordinance number if available
                                const documentNumber = file.resolutionNumber || file.ordinanceNumber;
                                
                                // Check if this is a resolution or ordinance
                                const isResolutionOrOrdinance = 
                                    file.category?.toLowerCase().includes('resolution') || 
                                    file.category?.toLowerCase().includes('ordinance') ||
                                    file.tags?.some(tag => 
                                        tag.toLowerCase().includes('resolution') || 
                                        tag.toLowerCase().includes('ordinance')
                                    );

                                return (
                                    <div
                                        key={file._id}
                                        className="group p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                    <IconComponent className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                            {file.title || file.fileName}
                                                        </h3>
                                                        {documentNumber && (
                                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                                {documentNumber}
                                                            </span>
                                                        )}
                                                        {isResolutionOrOrdinance && (
                                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                {file.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {/* Ang author ay ipapakita bilang "Chairperson" para sa mga resolution/ordinance */}
                                                        {isResolutionOrOrdinance ? (
                                                            <>
                                                                <span className="font-medium">Chairperson:</span> {file.chairpersons || 'Not specified'} • 
                                                            </>
                                                        ) : (
                                                            <>
                                                                {file.author && <>{file.author} • </>}
                                                            </>
                                                        )}
                                                        {file.category} • {file.fileSize} bytes • {new Date(file.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {file.tags && file.tags.length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {file.tags.map((tag, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {/* Render committee members for resolutions and ordinances */}
                                                    {renderResolutionOrdinanceInfo(file)}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenFileMenu(openFileMenu === file._id ? null : file._id);
                                                    }}
                                                    className="rounded-xl p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                </button>
                                                {openFileMenu === file._id && (
                                                    <div className="absolute right-0 top-full z-[999] mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewPdf(file);
                                                                setOpenFileMenu(null);
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                            <span>View</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditClick(file);
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFiles(file._id)}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination for files */}
                        {fileTotalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {fileCurrentPage} of {fileTotalPages}
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() =>
                                            fetchSpecificData(openFolder._id, {
                                                search: fileSearchTerm,
                                                limit: show,
                                                type: "",
                                                dateFrom: fileDateFrom,
                                                dateTo: fileDateTo,
                                                page: Math.max(fileCurrentPage - 1, 1),
                                                tags: selectedTags,
                                            })
                                        }
                                        disabled={fileCurrentPage === 1}
                                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            fetchSpecificData(openFolder._id, {
                                                search: fileSearchTerm,
                                                type: "",
                                                limit: show,
                                                dateFrom: fileDateFrom,
                                                dateTo: fileDateTo,
                                                page: Math.min(fileCurrentPage + 1, fileTotalPages),
                                                tags: selectedTags,
                                            })
                                        }
                                        disabled={fileCurrentPage === fileTotalPages}
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

            {/* UPLOAD MODAL */}
            {isUploadModalOpen && (
                <UploadDocumentModal
                    isOpen={isUploadModalOpen}
                    onClose={closeUploadModal}
                    folderId={openFolder._id}
                    isSuccess={Success}
                />
            )}

            {/* EDIT DOCUMENT MODAL */}
            {isEditing && (
                <EditDocumentModal
                    show={isEditing}
                    onClose={() => setIsEditing(false)}
                    document={currentDocument}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
};

export default FilesView;