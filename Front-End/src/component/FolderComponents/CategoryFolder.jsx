import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Upload, Calendar, Folder } from "lucide-react";
import FilesView from "./FilesView";
import UploadDocumentModal from "./FormUpload/UploadDocuments";

const CategoryFolder = ({
  openFolder,
  closeFolderWithEffect,
  isfolderFiles,
  isLoadingFiles,
  fileSearchTerm,
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
  isUploadModalOpen,
  closeUploadModal,
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <button
                onClick={closeFolderWithEffect}
                className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 w-full sm:w-auto justify-center sm:justify-start"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Folders
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div
                className={`rounded-3xl border-2 p-4 sm:p-6 shadow-xl dark:bg-gray-800 ${colorClasses.border} bg-white self-center sm:self-auto`}
              >
                <Folder className={`h-16 w-16 sm:h-20 sm:w-20 ${colorClasses.icon}`} />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="mb-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white break-words">
                  {openFolder.folderName}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800 w-full sm:w-auto justify-center">
                    <Calendar className="h-5 w-5" />
                    Loading files...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search skeleton */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 flex-wrap items-center gap-4">
              <div className="relative w-full sm:min-w-[250px] flex-1">
                <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-10 w-full sm:w-32 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-10 w-full sm:w-32 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <button
              onClick={isCategoryView ? closeFolderWithEffect : handleBackToCategories}
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 w-full sm:w-auto justify-center sm:justify-start"
            >
              <ArrowLeft className="h-4 w-4" />
              {isCategoryView ? "Back to Folders" : "Back to Categories"}
            </button>
            <button
              onClick={handleOpenUploadModal}
              className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 font-medium text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl w-full sm:w-auto justify-center"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              Upload Files
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div
              className={`rounded-3xl border-2 p-4 sm:p-6 shadow-xl dark:bg-gray-800 ${colorClasses.border} bg-white self-center sm:self-auto`}
            >
              <Folder className={`h-16 w-16 sm:h-20 sm:w-20 ${colorClasses.icon}`} />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="mb-3 text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white break-words">
                {openFolder.folderName}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800 w-full sm:w-auto justify-center">
                  <Calendar className="h-5 w-5" />
                  Created {new Date(openFolder.created_at).toLocaleDateString()}
                </span>
                <span className="rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800 w-full sm:w-auto text-center">
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {isCategoryFolder.length === 0 ? (
            <div className="py-12 sm:py-20 text-center">
              <div className={`h-24 w-24 sm:h-32 sm:w-32 ${colorClasses.bg} mx-auto mb-6 sm:mb-8 flex items-center justify-center rounded-3xl shadow-lg`}>
                <Folder className={`h-10 w-10 sm:h-16 sm:w-16 ${colorClasses.icon}`} />
              </div>
              <h3 className="mb-3 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">No categories found</h3>
              <p className="text-gray-500 dark:text-gray-400">Add some categories to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6">
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
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      {folder.category}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{folder.totalFiles} files</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // FILES VIEW
        <FilesView
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
          setFileSearchTerm={setFileSearchTerm}
          Success={Success}
          selectedCategory={selectedCategory}
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