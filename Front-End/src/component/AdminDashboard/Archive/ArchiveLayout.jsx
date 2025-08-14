import React, { useState, useMemo, useEffect, useContext } from "react";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { Database, Folder, Calendar, File } from "lucide-react";
import { SkeletonFolderCard, SkeletonDocumentCard } from "./SkeletonComponent";
import { FolderCard } from "./FolderCard";
import { DocumentCard } from "./DocumentCard";
import { SearchAndFilter } from "./SearchAndFilter";
import { ArchiveNavigation } from "./ArchiveNavigation";
import { ArchiveHeaderContent } from "./AtchiveHeaderContent";
import { DocumentDetailsPanel } from "./DocumentDetailPanel";

const NoDataDisplay = ({ message }) => (
    <div className="col-span-full flex h-full min-h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-gray-600">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Database className="h-8 w-8" />
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400">{message}</p>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        if (totalPages <= 8) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages = [];
        const startPage = Math.max(2, currentPage - 3);
        const endPage = Math.min(totalPages - 1, currentPage + 3);
        pages.push(1);
        if (startPage > 2) {
            pages.push('...');
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages - 1) {
            pages.push('...');
        }
        pages.push(totalPages);

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="my-6 flex items-center justify-center space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Previous
            </button>
            
            {pageNumbers.map((page, index) => (
                page === '...' ? (
                    <span 
                        key={`ellipsis-${index}`} 
                        className="px-2 py-1 text-gray-700"
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        disabled={currentPage === page}
                        className={`rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
                            currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                )
            ))}
            
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
                Next
            </button>
        </div>
    );
};

const ArchiveLayout = () => {
    const { 
        isLoading, 
        fetchAchivedData, 
        isArchived,
        Archivedtotalpage, 
        Archivedcurrentpage 
    } = useContext(FilesDisplayContext);
    
    const documents = useMemo(() => {
        if (!isArchived || !Array.isArray(isArchived)) return [];
        return isArchived.flatMap(category => category.files || []);
    }, [isArchived]);

    const [selectedMainFolder, setSelectedMainFolder] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);
    const folderStatusMap = {
        "Pending Deletion": "Deleted",
        "Restoration Queue": "For Restore",
        "Archived Files": "Archived",
        "Public Documents": "Active",
    };

    const allTags = useMemo(() => {
        if (isLoading) return [];

        const tagsSet = new Set();

        documents.forEach((doc) => {
            if (doc.tags && Array.isArray(doc.tags)) {
                doc.tags.forEach((tag) => tagsSet.add(tag));
            }
        });

        return Array.from(tagsSet).sort();
    }, [documents, isLoading]);

    const filteredDocuments = useMemo(() => {
        if (isLoading) return [];
        return documents.filter((doc) => {
            const matchesSearch =
                searchQuery === "" ||
                (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (doc.author && doc.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (doc.tags && doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

            const matchesTags = selectedTags.length === 0 || 
                (doc.tags && selectedTags.every((tag) => doc.tags.includes(tag)));

            return matchesSearch && matchesTags;
        });
    }, [documents, searchQuery, selectedTags, isLoading]);

    const organizedData = useMemo(() => {
        const organized = {
            "Pending Deletion": {},
            "Restoration Queue": {},
            "Archived Files": {},
            "Public Documents": {},
        };

        if (isLoading) return organized;

        filteredDocuments.forEach((doc) => {
            const year = doc.createdAt ? new Date(doc.createdAt).getFullYear().toString() : "Unknown";
            const category = doc.category || "Uncategorized";

            let targetFolder = null;
            if (doc.ArchivedStatus === "For Restore") {
                targetFolder = organized["Restoration Queue"];
            } else if ((doc.ArchivedStatus === "Active" || doc.ArchivedStatus === "Archived") && doc.status === "Approved") {
                targetFolder = organized["Public Documents"];
            } else if (doc.ArchivedStatus === "Deleted") {
                targetFolder = organized["Pending Deletion"];
            } else if (doc.ArchivedStatus === "Archived") {
                targetFolder = organized["Archived Files"];
            } else {
                // Default to Archived Files if status is not set
                targetFolder = organized["Archived Files"];
            }

            if (targetFolder) {
                if (!targetFolder[year]) {
                    targetFolder[year] = {};
                }
                if (!targetFolder[year][category]) {
                    targetFolder[year][category] = [];
                }
                targetFolder[year][category].push(doc);
            }
        });
        return organized;
    }, [filteredDocuments, isLoading]);

    const currentYears = useMemo(() => {
        if (isLoading) return [];
        if (selectedMainFolder && organizedData[selectedMainFolder]) {
            return Object.keys(organizedData[selectedMainFolder]).sort((a, b) => parseInt(b) - parseInt(a));
        }
        return [];
    }, [selectedMainFolder, organizedData, isLoading]);

    const currentCategories = useMemo(() => {
        if (isLoading) return [];
        if (
            selectedMainFolder &&
            selectedYear &&
            organizedData[selectedMainFolder]?.[selectedYear]
        ) {
            return Object.keys(organizedData[selectedMainFolder][selectedYear]).sort();
        }
        return [];
    }, [selectedMainFolder, selectedYear, organizedData, isLoading]);

    const currentDocuments = useMemo(() => {
        if (isLoading) return [];
        if (
            selectedMainFolder &&
            selectedYear &&
            selectedCategory &&
            organizedData[selectedMainFolder]?.[selectedYear]?.[selectedCategory]
        ) {
            return organizedData[selectedMainFolder][selectedYear][selectedCategory];
        }
        return [];
    }, [selectedMainFolder, selectedYear, selectedCategory, organizedData, isLoading]);

    // Handle page changes using context values
    const handlePageChange = (newPage) => {
        const status = folderStatusMap[selectedMainFolder];
        if (status) {
            fetchAchivedData({ 
                ArchivedStatus: status, 
                page: newPage,
                year: selectedYear,
                category: selectedCategoryId
            });
        }
    };

    // Reset to first page when filters change
    useEffect(() => {
        if (Archivedcurrentpage !== 1) {
            handlePageChange(1);
        }
    }, [selectedMainFolder, selectedYear, selectedCategoryId]);

    // Handlers
    const handleSelectMainFolder = (folderName) => {
        const status = folderStatusMap[folderName];
        if (status) {
            fetchAchivedData({ 
                ArchivedStatus: status, 
                page: 1  // Always start at page 1
            });
        }

        setSelectedMainFolder(folderName);
        setSelectedYear(null);
        setSelectedCategory(null);
        setSelectedCategoryId(null);
        setSelectedDocument(null);
    };

    const handleSelectYear = (year) => {
        setSelectedYear(year);
        setSelectedCategory(null);
        setSelectedCategoryId(null);
        setSelectedDocument(null);
        handlePageChange(1);
    };

    const handleSelectCategory = (category, categoryId) => {
        setSelectedCategory(category);
        setSelectedCategoryId(categoryId);
        setSelectedDocument(null);
        handlePageChange(1);
    };

    const handleBackToMainFolders = () => {
        setSelectedMainFolder(null);
        setSelectedYear(null);
        setSelectedCategory(null);
        setSelectedCategoryId(null);
        setSelectedDocument(null);
    };

    const handleBackToYears = () => {
        setSelectedYear(null);
        setSelectedCategory(null);
        setSelectedCategoryId(null);
        setSelectedDocument(null);
    };

    const toggleTag = (tag) => {
        setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    const clearAllFilters = () => {
        setSearchQuery("");
        setSelectedTags([]);
    };

    const handleRestore = (docId) => {
        alert(`Document ${docId} restored successfully!`);
        setSelectedDocument(null);
    };

    let content;
    if (isLoading) {
        if (!selectedMainFolder) {
            content = (
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                </div>
            );
        } else if (!selectedYear) {
            content = (
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                </div>
            );
        } else if (!selectedCategory) {
            content = (
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                    <SkeletonFolderCard />
                </div>
            );
        } else {
            content = (
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    <SkeletonDocumentCard />
                    <SkeletonDocumentCard />
                    <SkeletonDocumentCard />
                </div>
            );
        }
    } else if (selectedDocument) {
        content = (
            <DocumentDetailsPanel
                document={selectedDocument}
                onClose={() => setSelectedDocument(null)}
                onRestore={handleRestore}
            />
        );
    } else if (selectedMainFolder && selectedYear && selectedCategory) {
        // Find the current category in the isArchived array to get its pagination info
        const currentCategoryData = isArchived.find(
            cat => cat.categoryId === selectedCategoryId
        );
        
        // Use category-specific pagination if available, otherwise fall back to context values
        const totalPagesToShow = currentCategoryData?.totalPages || Archivedtotalpage;
        const currentPageToShow = currentCategoryData?.currentPage || Archivedcurrentpage;

        content = (
            <>
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                    {currentDocuments.length > 0 ? (
                        currentDocuments.map((doc) => (
                            <DocumentCard
                                key={doc._id || doc.id}
                                doc={doc}
                                onSelect={setSelectedDocument}
                            />
                        ))
                    ) : (
                        <div className="col-span-full">
                            <NoDataDisplay message="No documents found in this category." />
                        </div>
                    )}
                </div>

                {totalPagesToShow > 1 && (
                    <Pagination
                        currentPage={currentPageToShow}
                        totalPages={totalPagesToShow}
                        onPageChange={handlePageChange}
                    />
                )}
            </>
        );
    } else if (selectedMainFolder && selectedYear) {
        content = (
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentCategories.length > 0 ? (
                    currentCategories.map((category) => {
                        // Get documents for this category
                        const docs = organizedData[selectedMainFolder]?.[selectedYear]?.[category] || [];
                        
                        // Extract category ID from the first document (if exists)
                        const categoryId = docs.length > 0 ? docs[0].categoryID : null;
                        
                        return (
                            <FolderCard
                                key={category}
                                name={category}
                                onClick={() => handleSelectCategory(category, categoryId)}
                                icon="folder-open"
                                count={docs.length}
                            />
                        );
                    })
                ) : (
                    <div className="col-span-full">
                        <NoDataDisplay message="No categories found for this year." />
                    </div>
                )}
            </div>
        );
    } else if (selectedMainFolder) {
        content = (
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentYears.length > 0 ? (
                    currentYears.map((year) => (
                        <FolderCard
                            key={year}
                            name={year}
                            onClick={() => handleSelectYear(year)}
                            icon="calendar"
                            count={
                                organizedData[selectedMainFolder]?.[year] 
                                    ? Object.values(organizedData[selectedMainFolder][year]).flat().length 
                                    : 0
                            }
                        />
                    ))
                ) : (
                    <div className="col-span-full">
                        <NoDataDisplay message="No years found." />
                    </div>
                )}
            </div>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.keys(organizedData).length > 0 ? (
                    Object.keys(organizedData).map((folderName) => (
                        <FolderCard
                            key={folderName}
                            name={folderName}
                            onClick={() => handleSelectMainFolder(folderName)}
                            icon="folder"
                            count={
                                Object.values(organizedData[folderName])
                                    .flatMap(year => Object.values(year))
                                    .flat().length
                            }
                        />
                    ))
                ) : (
                    <div className="col-span-full">
                        <NoDataDisplay message="No archive folders available" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="font-inter min-h-screen">
            <div className="mx-auto rounded-xl bg-white shadow-lg dark:bg-gray-800">
                {/* Header and Navigation */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:border-gray-700 dark:from-blue-900/30 dark:to-purple-900/30">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <ArchiveNavigation
                                isLoading={isLoading}
                                selectedMainFolder={selectedMainFolder}
                                selectedYear={selectedYear}
                                selectedCategory={selectedCategory}
                                handleBackToMainFolders={handleBackToMainFolders}
                                handleBackToYears={handleBackToYears}
                            />
                            <ArchiveHeaderContent
                                isLoading={isLoading}
                                selectedMainFolder={selectedMainFolder}
                                selectedYear={selectedYear}
                                selectedCategory={selectedCategory}
                            />
                        </div>
                        <SearchAndFilter
                            isLoading={isLoading}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            allTags={allTags}
                            selectedTags={selectedTags}
                            toggleTag={toggleTag}
                            clearAllFilters={clearAllFilters}
                            isFilterOpen={isFilterOpen}
                            setIsFilterOpen={setIsFilterOpen}
                            showTagSuggestions={showTagSuggestions}
                            setShowTagSuggestions={setShowTagSuggestions}
                        />
                    </div>
                </div>
                <div className="min-h-[500px] p-6">{content}</div>
            </div>
        </div>
    );
};

export default ArchiveLayout;