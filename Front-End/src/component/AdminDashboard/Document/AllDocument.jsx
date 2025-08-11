import React, { useState, useContext } from "react";
import {
  ArrowLeft,
  Plus,
  X,
  Tag,
  FileText,
  Folder,
  LayoutGrid,
  MoreVertical,
  ListTodo,
  Building2
} from "lucide-react";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import { DepartmentContext } from "../../../contexts/DepartmentContext/DepartmentContext"; 
import ViewOnly from "../../PdfViewer/ViewOnly";
import CategoryTable from "../Category/CategoryTable";
import AddCategoryForm from "../Category/AddCategoryForm";
import DepartmentTable from "../Department/DepartmentTable";
import AddDepartmentForm from "../Department/AddDepartmentForm";

const transformData = (data) => {
  const groupedData = {};

  data.forEach((doc) => {
    const department = doc.department || "Uncategorized";
    const category = doc.category || "Uncategorized";

    if (!groupedData[department]) {
      groupedData[department] = {};
    }

    if (!groupedData[department][category]) {
      groupedData[department][category] = {
        categoryMeta: {
          name: category,
          id: `${department}-${category}`,
          description: `Documents for ${category} under ${department}`,
        },
        documents: [],
      };
    }

    const date = new Date(doc.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    groupedData[department][category].documents.push({
      id: doc._id,
      categoryId: `${department}-${category}`,
      department: department,
      title: doc.title,
      metadata: {
        date: date,
        author: doc.author,
        status: doc.status,
      },
      tags: doc.tags || [],
      content: doc.summary || "No summary available.",
      pdfUrl: doc.fileUrl,
    });
  });

  return groupedData;
};

const DocumentDetailView = ({ document, onBack }) => {
  if (!document) return null;

  return (
    <div className="min-h-screen p-4 md:p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Documents
        </button>

        <div className="flex items-center">
          <FileText size={28} className="mr-2 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate max-w-[300px] md:max-w-md">
            {document.title}
          </h2>
        </div>

        <button
          onClick={onBack}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg mb-6 shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white pb-2 border-b dark:border-gray-700">
          Document Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
          <div>
            <p className="font-medium">Title</p>
            <p className="mt-1">{document.title}</p>
          </div>
          <div>
            <p className="font-medium">Date</p>
            <p className="mt-1">{document.metadata.date}</p>
          </div>
          <div>
            <p className="font-medium">Author</p>
            <p className="mt-1">{document.metadata.author}</p>
          </div>
          <div>
            <p className="font-medium">Status</p>
            <p className="mt-1">{document.metadata.status}</p>
          </div>

          <div className="md:col-span-2 mt-2">
            <p className="font-medium mb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {document.tags.length > 0 ? (
                document.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full flex items-center"
                  >
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  No tags
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-2 mt-4">
            <p className="font-medium mb-2">Summary</p>
            <p className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-sm">
              {document.content}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex-1 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <LayoutGrid className="mr-2 text-blue-500" size={20} />
            PDF Viewer
          </h3>
        </div>
        <div className="h-[500px] overflow-auto">
          {document.pdfUrl ? (
            <ViewOnly fileData={document} fileId={document.id} />
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-gray-600 dark:text-gray-400">
              No PDF available for this document
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentView = ({
  groupedDocuments,
  selectedCategoryId,
  setSelectedCategoryId,
  onHandleViewFile
}) => {
  const [expandedDepartments, setExpandedDepartments] = useState({});

  const toggleDepartment = (department) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [department]: !prev[department]
    }));
  };

  return (
    <div className="space-y-6 mt-4">
      {Object.entries(groupedDocuments).map(([department, categories]) => (
        <div key={department} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <button
            onClick={() => toggleDepartment(department)}
            className="w-full p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center">
              <Folder className="mr-3 text-blue-500" size={20} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {department}
              </h3>
              <span className="ml-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {Object.keys(categories).length} categories
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {expandedDepartments[department] ? '▲' : '▼'}
            </div>
          </button>

          {expandedDepartments[department] && (
            <div className="p-4 border-t dark:border-gray-700">
              {Object.entries(categories).map(([category, categoryData]) => {
                const isSelected = selectedCategoryId === categoryData.categoryMeta.id;
                return (
                  <div
                    key={categoryData.categoryMeta.id}
                    className={`mb-6 last:mb-0 p-4 rounded-lg ${
                      isSelected
                        ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800 dark:text-white flex items-center">
                        <Tag className="mr-2 text-blue-500" size={16} />
                        {category}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {categoryData.documents.length} documents
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      {categoryData.categoryMeta.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryData.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800"
                          onClick={() => onHandleViewFile(doc.id, doc)}
                        >
                          <div className="flex justify-between">
                            <h5 className="font-medium text-gray-800 dark:text-white truncate">
                              {doc.title}
                            </h5>
                          </div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {doc.metadata.date} • {doc.metadata.author}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {doc.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{doc.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const AllDocument = () => {
  const { isCategory, UpdateCategory } = useContext(CategoryContext);
  const { isDepartment, UpdateDepartment } = useContext(DepartmentContext);
  const { isFile } = useContext(FilesDisplayContext);

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [showManageCategoryModal, setShowManageCategoryModal] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [editableCategory, setEditableCategory] = useState(null);

  const [showManageDepartmentModal, setShowManageDepartmentModal] = useState(false);
  const [showAddDepartmentForm, setShowAddDepartmentForm] = useState(false);
  const [editableDepartment, setEditableDepartment] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);

  const filteredFiles = isFile?.filter((file) => file.ArchivedStatus === "Active") || [];
  const groupedDocuments = transformData(filteredFiles);

  const handleViewFile = (fileId, item) => {
    if (!item) return;
    setViewingDocument(item);
  };

  const handleBackToDocumentsList = () => {
    setViewingDocument(null);
  };

  const handleEditCategory = (categoryToEdit) => {
    setEditableCategory(categoryToEdit);
    setShowAddCategoryForm(true);
  };

  const handleUpdateCategory = async (updatedCategory) => {
    await UpdateCategory(updatedCategory);
    setEditableCategory(null);
    setShowAddCategoryForm(false);
  };

  const handleManageCategoryClick = () => {
    setShowManageCategoryModal(true);
    setShowDropdown(false);
  };

  const handleEditDepartment = (departmentToEdit) => {
    setEditableDepartment(departmentToEdit);
    setShowAddDepartmentForm(true);
  };

  const handleUpdateDepartment = async (updatedDepartment) => {
    await UpdateDepartment(updatedDepartment);
    setEditableDepartment(null);
    setShowAddDepartmentForm(false);
  };

  const handleManageDepartmentClick = () => {
    setShowManageDepartmentModal(true);
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col font-sans min-h-screen">
      <div className="flex-1 w-full max-w-7xl mx-auto rounded-lg bg-white dark:bg-gray-800 shadow-md overflow-hidden">
        {!viewingDocument ? (
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                <LayoutGrid className="mr-2 text-blue-500" size={24} />
                Documents by Department
              </h2>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                  aria-label="Manage options"
                >
                  <MoreVertical size={24} />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleManageCategoryClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <ListTodo size={16} className="mr-2" />
                      Manage Categories
                    </button>
                    <button
                      onClick={handleManageDepartmentClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <Building2 size={16} className="mr-2" />
                      Manage Departments
                    </button>
                  </div>
                )}
              </div>
            </div>

            <DocumentView
              groupedDocuments={groupedDocuments}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              onHandleViewFile={handleViewFile}
            />
          </div>
        ) : (
          <DocumentDetailView
            document={viewingDocument}
            onBack={handleBackToDocumentsList}
          />
        )}
      </div>

      {showManageCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                <Folder className="inline-block mr-2 text-blue-500" size={20} />
                Manage Categories
              </h3>
              <button
                onClick={() => {
                  setShowManageCategoryModal(false);
                  setShowAddCategoryForm(false);
                  setEditableCategory(null);
                }}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {showAddCategoryForm ? (
                <AddCategoryForm
                  onCancel={() => {
                    setShowAddCategoryForm(false);
                    setEditableCategory(null);
                  }}
                  editableCategory={editableCategory}
                  onUpdateCategory={handleUpdateCategory}
                />
              ) : (
                <div className="mb-4">
                  <button
                    onClick={() => setShowAddCategoryForm(true)}
                    className="flex items-center gap-2 mb-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
                  >
                    <Plus size={18} />
                    Add New Category
                  </button>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-white pb-2 border-b dark:border-gray-700">
                  Existing Categories
                </h4>
                <CategoryTable
                  categories={isCategory}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={(id) => console.log("Delete category:", id)}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowManageCategoryModal(false);
                  setShowAddCategoryForm(false);
                  setEditableCategory(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showManageDepartmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                <Building2 className="inline-block mr-2 text-blue-500" size={20} />
                Manage Departments
              </h3>
              <button
                onClick={() => {
                  setShowManageDepartmentModal(false);
                  setShowAddDepartmentForm(false);
                  setEditableDepartment(null);
                }}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {showAddDepartmentForm ? (
                <AddDepartmentForm
                  onCancel={() => {
                    setShowAddDepartmentForm(false);
                    setEditableDepartment(null);
                  }}
                  editableDepartment={editableDepartment}
                  onUpdateDepartment={handleUpdateDepartment}
                />
              ) : (
                <div className="mb-4">
                  <button
                    onClick={() => setShowAddDepartmentForm(true)}
                    className="flex items-center gap-2 mb-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition"
                  >
                    <Plus size={18} />
                    Add New Department
                  </button>
                </div>
              )}

              <div className="mt-4">
                <h4 className="text-md font-semibold mb-3 text-gray-800 dark:text-white pb-2 border-b dark:border-gray-700">
                  Existing Departments
                </h4>
                <DepartmentTable
                  departments={isDepartment}
                  onEditDepartment={handleEditDepartment}
                  onDeleteDepartment={(id) => console.log("Delete department:", id)}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowManageDepartmentModal(false);
                  setShowAddDepartmentForm(false);
                  setEditableDepartment(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDocument;