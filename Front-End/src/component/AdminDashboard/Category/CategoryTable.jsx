import React, { useContext, useState, useEffect } from "react";
import { Edit, Trash, Plus, ChevronLeft, ChevronRight, X } from "lucide-react";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import AddCategoryForm from "./AddCategoryForm";
import "react-toastify/dist/ReactToastify.css";
import SuccessFailed from "../../../ReusableFolder/SuccessandField";

const ITEMS_PER_PAGE = 5;

const CategoryRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
    </td>
    <td className="px-6 py-4 text-center">
      <div className="flex justify-center gap-3">
        <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 w-6 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </td>
  </tr>
);

const PaginationSkeleton = () => (
  <div className="flex animate-pulse items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 w-8 rounded-md bg-gray-200 dark:bg-gray-700"></div>
      ))}
    </div>
  </div>
);

const CategoryTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddCategoryModal, setAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const { deleteCategory, isCategory, customError, setCustomError } = useContext(CategoryContext);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [isLoading, setIsLoading] = useState(true);
  const [isPageChanging, setIsPageChanging] = useState(false);

  const totalPages = Math.ceil((isCategory?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentisCategory = (isCategory || []).slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const skeletonCount = window.innerHeight > 800 ? 8 : 6;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    
    setIsPageChanging(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsPageChanging(false);
    }, 500);
  };

  const handleEdit = (category) => {
    setCustomError("");
    setEditingCategory(category);
    setAddCategoryModal(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      await deleteCategory(id);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Category Management</h2>
        <button
          onClick={() => {
            setCustomError("");
            setEditingCategory(null);
            setAddCategoryModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Category
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <CategoryRowSkeleton key={i} />
              ))
            ) : isPageChanging ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <CategoryRowSkeleton key={i} />
              ))
            ) : currentisCategory.length > 0 ? (
              currentisCategory.map((cat) => (
                <tr
                  key={cat.id || cat._id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {cat.id || cat._id}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{cat.category}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id || cat._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                    <div className="h-16 w-16 rounded-xl border-2 border-dashed bg-gray-200 dark:bg-gray-700" />
                    <p className="mt-3 font-medium">No isCategory found</p>
                    <p className="text-sm">Add a new category to get started</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (isPageChanging ? (
          <PaginationSkeleton />
        ) : (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, isCategory?.length || 0)} of {isCategory?.length || 0}{" "}
              isCategory
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || isPageChanging}
                className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                <ChevronLeft size={16} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToPage(i + 1)}
                  disabled={isPageChanging}
                  className={`h-8 w-8 rounded-md text-sm ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white dark:text-white"
                      : "border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                  } ${isPageChanging ? "cursor-not-allowed" : ""}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || isPageChanging}
                className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => {
                setEditingCategory(null);
                setAddCategoryModal(false);
              }}
              className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>

            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <AddCategoryForm
                editableCategory={editingCategory}
                onCancel={() => {
                  setEditingCategory(null);
                  setAddCategoryModal(false);
                }}
                onSuccess={() => {
                  setEditingCategory(null);
                  setAddCategoryModal(false);
                }}
              />

              <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;