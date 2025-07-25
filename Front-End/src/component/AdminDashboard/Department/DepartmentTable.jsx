import React, { useContext, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DepartmentContext } from "../../../contexts/DepartmentContext/DepartmentContext";

const itemsPerPage = 5;

const DepartmentTable = ({ departments = [], onEditDepartment }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const { DeleteDepartment } = useContext(DepartmentContext); // ✅ Corrected

  const totalPages = Math.ceil((departments?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDepartments = departments.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleEdit = (department) => {
    onEditDepartment(department);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this department?"
    );
    if (confirmDelete) {
      await DeleteDepartment(id); // ✅ Corrected
      toast.success("Department deleted successfully", { autoClose: 2000 });
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-xl shadow-md bg-white dark:bg-gray-800">
        <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-100">
          <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentDepartments.length > 0 ? (
              currentDepartments.map((dept) => (
                <tr
                  key={dept._id || dept.id}
                  className="border-b dark:border-gray-600"
                >
                  <td className="px-4 py-2">{dept._id || dept.id}</td>
                  <td className="px-4 py-2">{dept.department}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="p-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-600"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept._id || dept.id)}
                        className="p-1 rounded hover:bg-red-200 dark:hover:bg-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="px-4 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentTable;
