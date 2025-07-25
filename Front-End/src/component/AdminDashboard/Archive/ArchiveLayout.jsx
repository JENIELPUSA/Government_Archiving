import React, { useState, useMemo, useEffect, useContext } from "react";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { Database, UserPlus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { SkeletonFolderCard, SkeletonDocumentCard, SkeletonDocumentDetails } from "./SkeletonComponent";
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

const ArchiveLayout = () => {
    const { isFile, isLoading } = useContext(FilesDisplayContext);
    const documents = isFile;

    const [selectedMainFolder, setSelectedMainFolder] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState(null); // New state for department
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [showTagSuggestions, setShowTagSuggestions] = useState(false);

    const allTags = useMemo(() => {
        if (isLoading) return [];

        const tagsSet = new Set();

        documents
            .filter((doc) => doc.ArchivedStatus !== "Active")
            .forEach((doc) => {
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
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (doc.tags && doc.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

            const matchesTags = selectedTags.length === 0 || (doc.tags && selectedTags.every((tag) => doc.tags.includes(tag)));

            return matchesSearch && matchesTags;
        });
    }, [documents, searchQuery, selectedTags, isLoading]);

    const organizedData = useMemo(() => {
        if (isLoading) {
            return {
                "Pending Deletion": {},
                "Restoration Queue": {},
                "Archived Files": {},
                "Public Documents": {},
            };
        }

        const organized = {
            "Pending Deletion": {},
            "Restoration Queue": {},
            "Archived Files": {},
            "Public Documents": {},
        };

        filteredDocuments.forEach((doc) => {
            const department = doc.department || "Unassigned"; // Get department
            const year = new Date(doc.createdAt).getFullYear().toString();
            const category = doc.category || "Uncategorized";

            let targetFolder = null;
            if (doc.ArchivedStatus === "For Restore") {
                targetFolder = organized["Restoration Queue"];
            } else if (doc.ArchivedStatus === "Active" && doc.status === "Approved") {
                targetFolder = organized["Public Documents"];
            } else if (doc.ArchivedStatus === "Deleted") {
                targetFolder = organized["Pending Deletion"];
            } else if (doc.ArchivedStatus === "Archived") {
                targetFolder = organized["Pending Deletion"];
            }

            if (targetFolder) {
                // Add department level
                if (!targetFolder[department]) {
                    targetFolder[department] = {};
                }
                if (!targetFolder[department][year]) {
                    targetFolder[department][year] = {};
                }
                if (!targetFolder[department][year][category]) {
                    targetFolder[department][year][category] = [];
                }
                targetFolder[department][year][category].push(doc);
            }
        });
        return organized;
    }, [filteredDocuments, isLoading]);

    // Get departments for current main folder
    const currentDepartments = useMemo(() => {
        if (isLoading) return [];
        if (selectedMainFolder && organizedData[selectedMainFolder]) {
            return Object.keys(organizedData[selectedMainFolder]).sort();
        }
        return [];
    }, [selectedMainFolder, organizedData, isLoading]);

    // Get years for current department
    const currentYears = useMemo(() => {
        if (isLoading) return [];
        if (selectedMainFolder && selectedDepartment && organizedData[selectedMainFolder][selectedDepartment]) {
            return Object.keys(organizedData[selectedMainFolder][selectedDepartment]).sort((a, b) => parseInt(b) - parseInt(a));
        }
        return [];
    }, [selectedMainFolder, selectedDepartment, organizedData, isLoading]);

    // Get categories for current year and department
    const currentCategories = useMemo(() => {
        if (isLoading) return [];
        if (
            selectedMainFolder &&
            selectedDepartment &&
            selectedYear &&
            organizedData[selectedMainFolder][selectedDepartment] &&
            organizedData[selectedMainFolder][selectedDepartment][selectedYear]
        ) {
            return Object.keys(organizedData[selectedMainFolder][selectedDepartment][selectedYear]).sort();
        }
        return [];
    }, [selectedMainFolder, selectedDepartment, selectedYear, organizedData, isLoading]);

    // Get documents for current category, year, and department
    const currentDocuments = useMemo(() => {
        if (isLoading) return [];
        if (
            selectedMainFolder &&
            selectedDepartment &&
            selectedYear &&
            selectedCategory &&
            organizedData[selectedMainFolder][selectedDepartment] &&
            organizedData[selectedMainFolder][selectedDepartment][selectedYear] &&
            organizedData[selectedMainFolder][selectedDepartment][selectedYear][selectedCategory]
        ) {
            return organizedData[selectedMainFolder][selectedDepartment][selectedYear][selectedCategory];
        }
        return [];
    }, [selectedMainFolder, selectedDepartment, selectedYear, selectedCategory, organizedData, isLoading]);

    // --- Handlers ---
    const handleSelectMainFolder = (folderName) => {
        setSelectedMainFolder(folderName);
        setSelectedDepartment(null);
        setSelectedYear(null);
        setSelectedCategory(null);
        setSelectedDocument(null);
    };

    const handleSelectDepartment = (department) => {
        setSelectedDepartment(department);
        setSelectedYear(null);
        setSelectedCategory(null);
        setSelectedDocument(null);
    };

    const handleSelectYear = (year) => {
        setSelectedYear(year);
        setSelectedCategory(null);
        setSelectedDocument(null);
    };

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        setSelectedDocument(null);
    };

    const handleBackToMainFolders = () => {
        setSelectedMainFolder(null);
        setSelectedDepartment(null);
        setSelectedYear(null);
        setSelectedCategory(null);
        setSelectedDocument(null);
    };

    const handleBackToDepartments = () => {
        setSelectedDepartment(null);
        setSelectedYear(null);
        setSelectedCategory(null);
        setSelectedDocument(null);
    };

    const handleBackToYears = () => {
        setSelectedYear(null);
        setSelectedCategory(null);
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
        console.log(`Restoring document: ${docId}`);
        alert(`Document ${docId} restored successfully!`);
        setSelectedDocument(null);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isFilterOpen && !e.target.closest(".filter-container")) {
                setIsFilterOpen(false);
            }
            if (showTagSuggestions && !e.target.closest(".search-container")) {
                setShowTagSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isFilterOpen, showTagSuggestions]);

    // --- Render Logic ---
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
        } else if (!selectedDepartment) {
            content = (
                <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    } else if (selectedMainFolder && selectedDepartment && selectedYear && selectedCategory) {
        content = (
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentDocuments.length > 0 ? (
                    currentDocuments.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            doc={doc}
                            onSelect={setSelectedDocument}
                        />
                    ))
                ) : (
                    <NoDataDisplay message="No documents found in this category." />
                )}
            </div>
        );
    } else if (selectedMainFolder && selectedDepartment && selectedYear) {
        content = (
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentCategories.length > 0 ? (
                    currentCategories.map((category) => (
                        <FolderCard
                            key={category}
                            name={category}
                            onClick={() => handleSelectCategory(category)}
                            icon="folder-open"
                            count={
                                organizedData[selectedMainFolder][selectedDepartment][selectedYear][category]
                                    ? organizedData[selectedMainFolder][selectedDepartment][selectedYear][category].length
                                    : 0
                            }
                        />
                    ))
                ) : (
                    <NoDataDisplay message="No categories found for this year." />
                )}
            </div>
        );
    } else if (selectedMainFolder && selectedDepartment) {
        content = (
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentYears.length > 0 ? (
                    currentYears.map((year) => (
                        <FolderCard
                            key={year}
                            name={year}
                            onClick={() => handleSelectYear(year)}
                            icon="calendar"
                            count={Object.values(organizedData[selectedMainFolder][selectedDepartment][year] || {}).flat().length}
                        />
                    ))
                ) : (
                    <NoDataDisplay message="No years found in this department." />
                )}
            </div>
        );
    } else if (selectedMainFolder) {
        content = (
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentDepartments.length > 0 ? (
                    currentDepartments.map((department) => (
                        <FolderCard
                            key={department}
                            name={department}
                            onClick={() => handleSelectDepartment(department)}
                            icon="folder-open"
                            count={
                                Object.values(organizedData[selectedMainFolder][department] || {})
                                    .flatMap((year) => Object.values(year))
                                    .flat().length
                            }
                        />
                    ))
                ) : (
                    <NoDataDisplay message="No departments found." />
                )}
            </div>
        );
    } else {
        content = (
            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Object.keys(organizedData).map((folderName) => (
                    <FolderCard
                        key={folderName}
                        name={folderName}
                        onClick={() => handleSelectMainFolder(folderName)}
                        icon="folder"
                        count={
                            Object.values(organizedData[folderName] || {})
                                .flatMap((dept) => Object.values(dept))
                                .flatMap((year) => Object.values(year))
                                .flat().length
                        }
                    />
                ))}
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
                                selectedDepartment={selectedDepartment}
                                selectedYear={selectedYear}
                                selectedCategory={selectedCategory}
                                handleBackToMainFolders={handleBackToMainFolders}
                                handleBackToDepartments={handleBackToDepartments}
                                handleBackToYears={handleBackToYears}
                            />
                            <ArchiveHeaderContent
                                isLoading={isLoading}
                                selectedMainFolder={selectedMainFolder}
                                selectedDepartment={selectedDepartment}
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

                {/* Main Content Area */}
                <div className="min-h-[500px] p-6">{content}</div>
            </div>
        </div>
    );
};

export default ArchiveLayout;
