import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Upload, Calendar, Folder } from "lucide-react";
import FilesView from "./FilesView";
import UploadDocumentModal from "./FormUpload/UploadDocuments";

const CategoryFolder = ({
    openFolder,
    selectedTags,
    setSelectedTags,
    isTags,
    closeFolderWithEffect,
    isfolderFiles,
    setIsTagsDropdownOpen,
    isTagsDropdownOpen,
    isLoadingFiles,
    fetchFilterTags,
    fileSearchTerm,
    show,
    setShow,
    setFileSearchTerm,
    handleFileSearch,
    fileDateFrom,
    setFileDateFrom,
    fileDateTo,
    setFileDateTo,
    resetFileFilters,
    fileCurrentPage,
    fileTotalPages,
    openFileMenu,
    setOpenFileMenu,
    fetchSpecificData,
    getColorClasses,
    Success,
    isCategoryFolder,
    getFileIcon,
    handleViewPdf,
    handleDeleteFiles,
    getFileTypeColor,
}) => {
    const colorClasses = getColorClasses(openFolder.color);
    const [isCategoryView, setIsCategoryView] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleCategoryFolderClick = useCallback(
        (category) => {
            setSelectedCategory(category);
            setIsCategoryView(false);
            fetchSpecificData(openFolder._id, { categoryId: category.categoryID });
            fetchFilterTags(openFolder._id, { categoryId: category.categoryID });
        },
        [fetchSpecificData, openFolder],
    );

    const handleBackToCategories = () => {
        setIsCategoryView(true);
        setSelectedCategory(null);
    };

    const handleOpenUploadModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseUploadModal = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        setIsCategoryView(true);
        setSelectedCategory(null);
    }, [openFolder]);

    if (isLoadingFiles) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className={`${colorClasses.bg} border-b-2 ${colorClasses.border} shadow-sm`}>
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                onClick={closeFolderWithEffect}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 sm:w-auto sm:justify-start"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Folders
                            </button>
                        </div>
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                            <div
                                className={`rounded-3xl border-2 p-4 shadow-xl dark:bg-gray-800 sm:p-6 ${colorClasses.border} self-center bg-white sm:self-auto`}
                            >
                                <Folder className={`h-16 w-16 sm:h-20 sm:w-20 ${colorClasses.icon}`} />
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="mb-3 break-words text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
                                    {openFolder.folderName}
                                </h1>
                                <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-400 sm:flex-row sm:gap-8">
                                    <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800 sm:w-auto">
                                        <Calendar className="h-5 w-5" />
                                        Loading files...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search skeleton */}
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-1 flex-wrap items-center gap-4">
                            <div className="relative w-full flex-1 sm:min-w-[250px]">
                                <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700 sm:w-32"></div>
                            </div>
                            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                                <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700 sm:w-32"></div>
                            </div>
                        </div>
                        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
                            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex gap-2">
                                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Folder Header */}
            <div className={`${colorClasses.bg} border-b-2 ${colorClasses.border} shadow-sm`}>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            onClick={isCategoryView ? closeFolderWithEffect : handleBackToCategories}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 sm:w-auto sm:justify-start"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {isCategoryView ? "Back to Folders" : "Back to Categories"}
                        </button>
                        <button
                            onClick={handleOpenUploadModal}
                            className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl sm:w-auto sm:px-6 sm:py-3"
                        >
                            <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                            Upload Files
                        </button>
                    </div>
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                        <div
                            className={`rounded-3xl border-2 p-4 shadow-xl dark:bg-gray-800 sm:p-6 ${colorClasses.border} self-center bg-white sm:self-auto`}
                        >
                            <Folder className={`h-16 w-16 sm:h-20 sm:w-20 ${colorClasses.icon}`} />
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="mb-3 break-words text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
                                {openFolder.folderName}
                            </h1>
                            <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-400 sm:flex-row sm:gap-8">
                                <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800 sm:w-auto">
                                    <Calendar className="h-5 w-5" />
                                    Created {new Date(openFolder.created_at).toLocaleDateString()}
                                </span>
                                <span className="w-full rounded-xl bg-white px-4 py-2 text-center shadow-sm dark:bg-gray-800 sm:w-auto">
                                    {isCategoryView ? `${isCategoryFolder.length} categories` : `${isfolderFiles.length} files`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content area based on view state */}
            {isCategoryView ? (
                // CATEGORY FOLDERS VIEW
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {isCategoryFolder.length === 0 ? (
                        <div className="py-12 text-center sm:py-20">
                            <div
                                className={`h-24 w-24 sm:h-32 sm:w-32 ${colorClasses.bg} mx-auto mb-6 flex items-center justify-center rounded-3xl shadow-lg sm:mb-8`}
                            >
                                <Folder className={`h-10 w-10 sm:h-16 sm:w-16 ${colorClasses.icon}`} />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">No categories found</h3>
                            <p className="text-gray-500 dark:text-gray-400">Add some categories to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6 lg:grid-cols-3 xl:grid-cols-4">
                            {isCategoryFolder.map((folder) => (
                                <div
                                    key={folder.categoryID}
                                    onClick={() => handleCategoryFolderClick(folder)}
                                    className={`relative flex cursor-pointer items-center gap-4 rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md dark:border-gray-700 ${colorClasses.bg} ${colorClasses.hover_bg_light}`}
                                >
                                    <div className="flex-shrink-0">
                                        <div className={`rounded-xl p-3 ${colorClasses.bg} ${colorClasses.dark_bg}`}>
                                            <Folder className={`h-6 w-6 sm:h-8 sm:w-8 ${colorClasses.icon}`} />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                                            {folder.category}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{folder.totalFiles} files</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // FILES VIEW
                <FilesView
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    isTags={isTags}
                    openFolder={openFolder}
                    isfolderFiles={isfolderFiles}
                    isLoadingFiles={isLoadingFiles}
                    fileSearchTerm={fileSearchTerm}
                    handleFileSearch={handleFileSearch}
                    fileDateFrom={fileDateFrom}
                    setFileDateFrom={setFileDateFrom}
                    fileDateTo={fileDateTo}
                    setFileDateTo={setFileDateTo}
                    resetFileFilters={resetFileFilters}
                    fileCurrentPage={fileCurrentPage}
                    fileTotalPages={fileTotalPages}
                    fetchSpecificData={fetchSpecificData}
                    openFileMenu={openFileMenu}
                    setOpenFileMenu={setOpenFileMenu}
                    handleViewPdf={handleViewPdf}
                    handleDeleteFiles={handleDeleteFiles}
                    getColorClasses={getColorClasses}
                    getFileTypeColor={getFileTypeColor}
                    getFileIcon={getFileIcon}
                    show={show}
                    setShow={setShow}
                    fetchFilterTags={fetchFilterTags}
                    setFileSearchTerm={setFileSearchTerm}
                    Success={Success}
                    selectedCategory={selectedCategory}
                    isTagsDropdownOpen={isTagsDropdownOpen}
                    setIsTagsDropdownOpen={setIsTagsDropdownOpen}
                />
            )}

            {/* UPLOAD MODAL */}
            <UploadDocumentModal
                isOpen={isModalOpen}
                onClose={handleCloseUploadModal}
                folderId={openFolder._id}
                isSuccess={Success}
            />
        </div>
    );
};

export default CategoryFolder;
