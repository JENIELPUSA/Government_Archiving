import React, { useState, useMemo, useEffect, useContext } from "react";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { Database, X, ArrowLeft } from "lucide-react"; // Added ArrowLeft icon
import { FolderCard } from "./FolderCard";
import { DocumentCard } from "./DocumentCard";
import { SearchAndFilter } from "./SearchAndFilter";
import { ArchiveNavigation } from "./ArchiveNavigation";
import { ArchiveHeaderContent } from "./AtchiveHeaderContent";
import { DocumentDetailsPanel } from "./DocumentDetailPanel";

// Component for displaying no data message
const NoDataDisplay = ({ message }) => (
  <div className="col-span-full flex h-full min-h-[400px] flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed border-gray-300 p-12 dark:border-gray-600">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
      <Database className="h-8 w-8" />
    </div>
    <p className="text-center text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    if (totalPages <= 8) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const startPage = Math.max(2, currentPage - 3);
    const endPage = Math.min(totalPages - 1, currentPage + 3);
    pages.push(1);
    if (startPage > 2) pages.push("...");
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 1) pages.push("...");
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

      {pageNumbers.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-700">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={currentPage === page}
            className={`rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
              currentPage === page ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        )
      )}

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

// Skeleton Components
const SkeletonFolderCard = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex-1">
        <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="mt-1 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

const SkeletonDocumentCard = () => (
  <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-3"></div>
    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700 mb-4"></div>
    <div className="flex items-center space-x-3">
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="flex-1">
        <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700 mb-2"></div>
        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
    </div>
  </div>
);

const ArchiveLayout = () => {
  const {
    isLoading,
    fetchAchivedData,
    isArchived,
    Archivedtotalpage,
    Archivedcurrentpage,
    CountAll,
  } = useContext(FilesDisplayContext);

  const folderCountMap = useMemo(() => {
    if (!CountAll) return {};
    return {
      "Pending Deletion": CountAll.deleted || 0,
      "Restoration Queue": CountAll.forRestore || 0,
      "Archived Files": CountAll.archived || 0,
      "Public Documents": CountAll.public || 0,
    };
  }, [CountAll]);

  const [selectedMainFolder, setSelectedMainFolder] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const folderStatusMap = {
    "Pending Deletion": { ArchivedStatus: "Deleted" },
    "Restoration Queue": { ArchivedStatus: "For Restore" },
    "Archived Files": { ArchivedStatus: "Archived" },
    "Public Documents": { ArchivedStatus: "Active", status: "Approved" },
  };

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch data whenever filters or navigation change
  useEffect(() => {
    if (selectedMainFolder) {
      const baseParams = folderStatusMap[selectedMainFolder];
      const params = {
        ...baseParams,
        page: 1, // Reset to page 1 for new search/filter
        ...(selectedYear && { year: selectedYear }),
        ...(selectedCategoryId && { category: selectedCategoryId }),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(",") }),
      };
      fetchAchivedData(params);
    }
  }, [selectedMainFolder, selectedYear, selectedCategoryId, debouncedSearch, selectedTags]);

  // Extract all active tags from API response
  const activeTags = useMemo(() => {
    if (!isArchived || isLoading) return [];
    
    return isArchived.reduce((allTags, category) => {
      if (category.activeTags) {
        return [...new Set([...allTags, ...category.activeTags])];
      }
      return allTags;
    }, []);
  }, [isArchived, isLoading]);

  // Optimized logic for organizing and counting data
  const organizedData = useMemo(() => {
    const organized = {
      "Pending Deletion": { count: 0, years: {} },
      "Restoration Queue": { count: 0, years: {} },
      "Archived Files": { count: 0, years: {} },
      "Public Documents": { count: 0, years: {} },
    };
    if (isLoading || !isArchived) return organized;

    isArchived.forEach((category) => {
      category.files.forEach((doc) => {
        const year = doc.createdAt ? new Date(doc.createdAt).getFullYear().toString() : "Unknown";
        const categoryName = doc.category || "Uncategorized";

        let targetFolder = null;
        if (doc.ArchivedStatus === "For Restore") targetFolder = "Restoration Queue";
        else if (doc.status === "Approved") targetFolder = "Public Documents";
        else if (doc.ArchivedStatus === "Deleted") targetFolder = "Pending Deletion";
        else targetFolder = "Archived Files";

        if (!organized[targetFolder].years[year]) {
          organized[targetFolder].years[year] = { count: 0, categories: {} };
        }
        if (!organized[targetFolder].years[year].categories[categoryName]) {
          organized[targetFolder].years[year].categories[categoryName] = { count: 0, files: [] };
        }

        // Increment counts at all levels
        organized[targetFolder].count += 1;
        organized[targetFolder].years[year].count += 1;
        organized[targetFolder].years[year].categories[categoryName].count += 1;
        organized[targetFolder].years[year].categories[categoryName].files.push(doc);
      });
    });

    return organized;
  }, [isArchived, isLoading]);

  const currentYears = useMemo(() => {
    if (isLoading || !selectedMainFolder || !organizedData[selectedMainFolder]?.years) {
      return [];
    }
    return Object.keys(organizedData[selectedMainFolder].years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [selectedMainFolder, organizedData, isLoading]);

  const currentCategories = useMemo(() => {
    if (isLoading || !selectedMainFolder || !selectedYear || !organizedData[selectedMainFolder]?.years?.[selectedYear]?.categories) {
      return [];
    }
    return Object.keys(organizedData[selectedMainFolder].years[selectedYear].categories).sort();
  }, [selectedMainFolder, selectedYear, organizedData, isLoading]);

  const currentDocuments = useMemo(() => {
    if (isLoading || !selectedMainFolder || !selectedYear || !selectedCategory || !organizedData[selectedMainFolder]?.years?.[selectedYear]?.categories?.[selectedCategory]) {
      return [];
    }
    const documentsInCurrentCategory = organizedData[selectedMainFolder].years[selectedYear].categories[selectedCategory].files;
    if (selectedTags.length === 0) {
      return documentsInCurrentCategory;
    }
    return documentsInCurrentCategory.filter((doc) => 
      doc.tags?.some((tag) => selectedTags.includes(tag))
    );
  }, [selectedMainFolder, selectedYear, selectedCategory, organizedData, isLoading, selectedTags]);

  const handlePageChange = (newPage) => {
    if (!selectedMainFolder) return;
    const baseParams = folderStatusMap[selectedMainFolder];
    const params = {
      ...baseParams,
      page: newPage,
      ...(selectedYear && { year: selectedYear }),
      ...(selectedCategoryId && { category: selectedCategoryId }),
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(selectedTags.length > 0 && { tags: selectedTags.join(",") }),
    };
    fetchAchivedData(params);
  };

  const handleSelectMainFolder = (folderName) => {
    setSelectedMainFolder(folderName);
    setSelectedYear(null);
    setSelectedCategory(null);
    setSelectedCategoryId(null);
    setSelectedDocument(null);
    setSearchQuery("");
    setSelectedTags([]);
  };

  const handleSelectYear = (year) => {
    setSelectedYear(year);
    setSelectedCategory(null);
    setSelectedCategoryId(null);
    setSelectedDocument(null);
    setSearchQuery("");
    setSelectedTags([]);
  };

  const handleSelectCategory = (category, categoryId) => {
    setSelectedCategory(category);
    setSelectedCategoryId(categoryId);
    setSelectedDocument(null);
  };

  const handleBackToMainFolders = () => handleSelectMainFolder(null);
  const handleBackToYears = () => handleSelectYear(null);
  
  // New function: Handle back navigation from any view
  const handleBackNavigation = () => {
    if (selectedDocument) {
      // Back from document details to document list
      setSelectedDocument(null);
    } else if (selectedCategory) {
      // Back from category view to year view
      setSelectedCategory(null);
      setSelectedCategoryId(null);
    } else if (selectedYear) {
      // Back from year view to main folder view
      handleBackToYears();
    } else if (selectedMainFolder) {
      // Back from main folder view to root
      handleBackToMainFolders();
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => 
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
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

  if (selectedDocument) {
    content = <DocumentDetailsPanel document={selectedDocument} onClose={() => setSelectedDocument(null)} onRestore={handleRestore} />;
  } 
  else if (isLoading) {
    // Skeleton loading berdasarkan level navigasi
    if (selectedMainFolder && selectedYear && selectedCategory) {
      // Level dokumen
      content = (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonDocumentCard key={idx} />
          ))}
        </div>
      );
    } 
    else if (selectedMainFolder && selectedYear) {
      // Level kategori
      content = (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonFolderCard key={idx} />
          ))}
        </div>
      );
    } 
    else if (selectedMainFolder) {
      // Level tahun
      content = (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <SkeletonFolderCard key={idx} />
          ))}
        </div>
      );
    } 
    else {
      // Level folder utama
      content = (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <SkeletonFolderCard key={idx} />
          ))}
        </div>
      );
    }
  } 
  else {
    // Konten asli saat tidak loading
    if (selectedMainFolder && selectedYear && selectedCategory) {
      const currentCategoryData = isArchived?.find((cat) => cat.categoryId === selectedCategoryId);
      const totalPagesToShow = currentCategoryData?.totalPages || Archivedtotalpage;
      const currentPageToShow = currentCategoryData?.currentPage || Archivedcurrentpage;

      content = (
        <>
          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentDocuments.length > 0 ? (
              currentDocuments.map((doc) => <DocumentCard key={doc._id || doc.id} doc={doc} onSelect={setSelectedDocument} />)
            ) : (
              <NoDataDisplay message="No documents found with the selected filters." />
            )}
          </div>
          {totalPagesToShow > 1 && <Pagination currentPage={currentPageToShow} totalPages={totalPagesToShow} onPageChange={handlePageChange} />}
        </>
      );
    } 
    else if (selectedMainFolder && selectedYear) {
      const yearsData = organizedData[selectedMainFolder]?.years?.[selectedYear];
      const currentCategories = yearsData ? Object.keys(yearsData.categories).sort() : [];
      content = (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentCategories.length > 0 ? (
            currentCategories.map((category) => {
              const categoryData = organizedData[selectedMainFolder].years[selectedYear].categories[category];
              const docs = categoryData.files || [];
              const categoryId = docs.length > 0 ? docs[0].categoryID : null;
              return (
                <FolderCard
                  key={category}
                  name={category}
                  onClick={() => handleSelectCategory(category, categoryId)}
                  icon="folder-open"
                />
              );
            })
          ) : (
            <NoDataDisplay message="No categories found for this year." />
          )}
        </div>
      );
    } 
    else if (selectedMainFolder) {
      const currentYears = organizedData[selectedMainFolder]?.years ? Object.keys(organizedData[selectedMainFolder].years).sort((a, b) => parseInt(b) - parseInt(a)) : [];
      content = (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {currentYears.length > 0 ? (
            currentYears.map((year) => (
              <FolderCard
                key={year}
                name={year}
                onClick={() => handleSelectYear(year)}
                icon="calendar"
              />
            ))
          ) : (
            <NoDataDisplay message="No years found." />
          )}
        </div>
      );
    } 
    else {
      content = (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Object.keys(folderCountMap).length > 0 ? (
            Object.keys(folderCountMap).map((folderName) => (
              <FolderCard
                key={folderName}
                name={folderName}
                onClick={() => handleSelectMainFolder(folderName)}
                icon="folder"
                count={folderCountMap[folderName] || 0}
              />
            ))
          ) : (
            <NoDataDisplay message="No archive folders available" />
          )}
        </div>
      );
    }
  }

  const showSearchAndFilter = selectedMainFolder && selectedYear && selectedCategory;
  
  // Determine if back button should be visible
  const showBackButton = selectedMainFolder || selectedDocument;

  return (
    <div className="font-inter min-h-screen">
      <div className="mx-auto rounded-xl bg-white shadow-lg dark:bg-gray-800">
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:border-gray-700 dark:from-blue-900/30 dark:to-purple-900/30">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start">
              {/* Back Button - Visible when not at root level */}
              {showBackButton && (
                <button
                  onClick={handleBackNavigation}
                  className="mr-3 mt-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              
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
            </div>
            
            {showSearchAndFilter && (
              <SearchAndFilter
                isLoading={isLoading}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                allTags={activeTags}
                selectedTags={selectedTags}
                toggleTag={toggleTag}
                clearAllFilters={clearAllFilters}
                isFilterOpen={isFilterOpen}
                setIsFilterOpen={setIsFilterOpen}
                showTagSuggestions={showTagSuggestions}
                setShowTagSuggestions={setShowTagSuggestions}
              />
            )}
          </div>
        </div>
        <div className="min-h-[500px] p-6">{content}</div>
      </div>
    </div>
  );
};

export default ArchiveLayout;