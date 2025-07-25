import React, { useState, useContext, useEffect } from "react";
import { Eye, Pencil, Trash, Database } from "lucide-react"; // Added Database icon
import { useNavigate } from "react-router-dom";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import StatusVerification from "../../ReusableFolder/StatusModal";

const Table = ({ documents = [], onPreview, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const { DeleteFiles } = useContext(FilesDisplayContext);

  const totalPages = Math.ceil(documents.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = documents.slice(startIndex, startIndex + itemsPerPage);

  const [isVerification, setVerification] = useState(false);
  const [isDeleteID, setIsDeleteId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    } else if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewFile = (fileId, item) => {
    if (!fileId) return;
    navigate(`/dashboard/pdf-viewer/${fileId}`, { state: { fileData: item } });
  };

  const handleDelete = (item) => {
    try {
      setLoading(true);
      setIsDeleteId(item);
      setVerification(true);
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setVerification(false);
  };

  const handleConfirmDelete = async () => {
    await DeleteFiles(isDeleteID);
    handleCloseModal();
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className="mx-1 rounded-md px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="dots-start" className="mx-1 px-3 py-1 text-gray-500">...</span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`mx-1 rounded-md px-3 py-1 ${
            currentPage === i
              ? "bg-indigo-500 text-white dark:bg-indigo-700 dark:text-white"
              : "bg-gray-100 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="dots-end" className="mx-1 px-3 py-1 text-gray-500">...</span>
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="mx-1 rounded-md px-3 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 shadow-md dark:border-gray-600 dark:bg-gray-800">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
          <Database className="h-10 w-10" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
          No Documents Available
        </h3>
        <p className="text-center text-gray-500 dark:text-gray-400">
          There are no documents to display in the database.
          <br />Create a new document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-indigo-600 text-sm uppercase leading-normal text-white dark:bg-indigo-800">
            <tr>
              <th className="rounded-tl-lg px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Summary</th>
              <th className="px-6 py-3 text-left">Author</th>
              <th className="px-6 py-3 text-left">Department</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Uploaded</th>
              <th className="rounded-tr-lg px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light text-gray-600 dark:text-gray-300">
            {currentDocuments.map((document) => (
              <tr
                key={document._id}
                className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                <td className="whitespace-nowrap px-6 py-3 text-left">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {document.title}
                  </span>
                  {document.tags && document.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {document.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-800/50 dark:text-indigo-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-3 text-left max-w-xs overflow-hidden text-ellipsis">
                  <p className="text-gray-700 dark:text-gray-300">
                    {document.summary}
                  </p>
                </td>
                <td className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  {document.author}
                </td>
                <td className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  {document.department || <em className="text-gray-400">No Dept</em>}
                </td>
                <td className="px-6 py-3 text-left">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      document.status === "Approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-100"
                        : ["Pending", "Draft"].includes(document.status)
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-100"
                        : document.status === "Archived"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        : document.status === "Reject"
                        ? "bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-100"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-100"
                    }`}
                  >
                    {document.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-left text-gray-700 dark:text-gray-300">
                  {document.createdAt
                    ? new Date(document.createdAt).toLocaleDateString("en-US", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : "N/A"}
                </td>
                <td className="px-6 py-3 text-left">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewFile(document._id, document)}
                      className="rounded-full p-2 transition-colors hover:bg-blue-100 dark:hover:bg-gray-600"
                      title="View File"
                    >
                      <Eye className="h-5 w-5 text-blue-500" />
                    </button>

                    <button
                      onClick={() => onEdit(document)}
                      className="rounded-full p-2 transition-colors hover:bg-yellow-100 dark:hover:bg-gray-600"
                      title="Edit"
                    >
                      <Pencil className="h-5 w-5 text-yellow-500" />
                    </button>

                    <button
                      onClick={() => handleDelete(document._id)}
                      className="rounded-full p-2 transition-colors hover:bg-red-100 dark:hover:bg-gray-600"
                      title="Delete"
                    >
                      <Trash className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-b-lg bg-white px-6 py-4 dark:bg-gray-800">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, documents.length)} of {documents.length} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-md bg-gray-200 px-3 py-1 text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Prev
            </button>
            
            <div className="flex flex-wrap items-center justify-center">
              {renderPageNumbers()}
            </div>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded-md bg-gray-200 px-3 py-1 text-gray-700 transition-colors hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <StatusVerification
        isOpen={isVerification}
        onConfirmDelete={handleConfirmDelete}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Table;