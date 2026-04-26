import React, { useState } from "react";
import {
  Folder,
  ArrowLeft,
  LayoutGrid,
  List,
} from "lucide-react";
import DocumentCard from "./DocumentCard";
import DocumentListItem from "./DocumentListItem";

const DocumentView = ({
  groupedDocuments,
  selectedCategoryId,
  setSelectedCategoryId,
  onHandleViewFile,
}) => {
  const [documentDisplayMode, setDocumentDisplayMode] = useState("grid");
  const [viewMode, setViewMode] = useState("departments");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const handleBack = () => {
    if (viewMode === "documents") {
      setSelectedCategoryId(null);
      setViewMode("categories");
    } else if (viewMode === "categories") {
      setSelectedDepartment(null);
      setViewMode("departments");
    }
  };

  const currentCategoryName = selectedCategoryId
    ? Object.values(groupedDocuments[selectedDepartment] || {})
        .find((cat) => cat.categoryMeta.id === selectedCategoryId)?.categoryMeta.name
    : null;

  const filteredDocuments = selectedCategoryId
    ? Object.values(groupedDocuments[selectedDepartment] || {})
        .find((cat) => cat.categoryMeta.id === selectedCategoryId)?.documents || []
    : [];

  return (
    <div className="flex h-full flex-1 flex-col rounded-r-lg bg-gray-100 p-6 shadow-lg dark:bg-gray-900 dark:shadow-xl">
      {viewMode === "departments" && (
        <>
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-800 dark:text-white">
            <Folder className="mr-3 inline-block text-blue-600 dark:text-blue-400" size={28} />
            Select Department
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.keys(groupedDocuments).map((department) => (
              <div
                key={department}
                onClick={() => {
                  setSelectedDepartment(department);
                  setViewMode("categories");
                }}
                className="cursor-pointer rounded-lg bg-white p-6 text-center shadow-md transition hover:shadow-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                <h3 className="text-lg font-semibold">{department}</h3>
              </div>
            ))}
          </div>
        </>
      )}

      {viewMode === "categories" && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Departments
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Categories in {selectedDepartment}
            </h2>
            <div></div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.values(groupedDocuments[selectedDepartment] || {}).map(
              ({ categoryMeta }) => (
                <div
                  key={categoryMeta.id}
                  onClick={() => {
                    setSelectedCategoryId(categoryMeta.id);
                    setViewMode("documents");
                  }}
                  className="cursor-pointer rounded-lg bg-white p-6 text-center shadow-md transition hover:shadow-lg dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <h3 className="text-lg font-semibold">{categoryMeta.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {categoryMeta.description}
                  </p>
                </div>
              )
            )}
          </div>
        </>
      )}

      {viewMode === "documents" && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Categories
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {currentCategoryName}
            </h2>
            <div className="ml-auto flex items-center space-x-2">
              <button
                onClick={() => setDocumentDisplayMode("grid")}
                className={`rounded-lg p-2 transition-colors duration-200 ${
                  documentDisplayMode === "grid"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setDocumentDisplayMode("list")}
                className={`rounded-lg p-2 transition-colors duration-200 ${
                  documentDisplayMode === "list"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>
          </div>

          <div
            className={`flex-grow overflow-y-auto pr-2 ${
              documentDisplayMode === "grid"
                ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-4"
            }`}
          >
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) =>
                documentDisplayMode === "grid" ? (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onHandleViewFile={onHandleViewFile}
                  />
                ) : (
                  <DocumentListItem
                    key={doc.id}
                    document={doc}
                    onHandleViewFile={onHandleViewFile}
                  />
                )
              )
            ) : (
              <p className="col-span-full py-10 text-center text-gray-600 dark:text-gray-400">
                No documents found in this category.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentView;
