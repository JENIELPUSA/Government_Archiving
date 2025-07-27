import React, { useState, useContext, useEffect } from "react";
import { Eye, Pencil, Trash, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import StatusVerification from "../../../ReusableFolder/StatusModal";
import LoadingOverlay from "../../../ReusableFolder/LoadingOverlay";
// Import ang bagong modal component
import DocumentDetailsModal from "./DocumentDetailModal";

const DocumentTable = ({ documents, onEdit }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const { MOveArchived } = useContext(FilesDisplayContext);

  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDocuments = documents.slice(startIndex, startIndex + itemsPerPage);

  const [isVerification, setVerification] = useState(false);
  const [isDeleteID, setIsDeleteId] = useState("");
  const [loading, setLoading] = useState(false);

  // State para sa clicked modal (dating hover modal)
  const [clickedDocument, setClickedDocument] = useState(null); // Pinalitan ang hoveredDocument
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    console.log("FindData", item);
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

  const handleCloseVerificationModal = () => { // Pinalitan ang pangalan para mas specific
    setVerification(false);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const result = await MOveArchived(isDeleteID, "Deleted");
      if (result.success) {
        handleCloseVerificationModal();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Click handler para sa modal
  const handleClickDocument = (document, event) => {
    // Kung ang document na kinlick ay pareho na sa nakabukas, isara ang modal
    if (clickedDocument && clickedDocument._id === document._id && isModalVisible) {
      setClickedDocument(null);
      setIsModalVisible(false);
    } else {
      setClickedDocument(document);
      const rect = event.currentTarget.getBoundingClientRect();
      setModalPosition({
        top: rect.top + window.scrollY + rect.height / 2,
        left: rect.right + window.scrollX + 10,
      });
      setIsModalVisible(true);
    }
  };

  // Function para isara ang DocumentDetailsModal
  const handleCloseDocumentDetailsModal = () => {
    setClickedDocument(null);
    setIsModalVisible(false);
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
          className="mx-1 rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          1
        </button>,
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="dots-start" className="mx-1 px-3 py-1 text-gray-500">
            ...
          </span>,
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
        </button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="dots-end" className="mx-1 px-3 py-1 text-gray-500">
            ...
          </span>,
        );
      }
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className="mx-1 rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          {totalPages}
        </button>,
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
          <br />
          Create a new document to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-200 text-sm uppercase leading-normal text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Author</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">File Name</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light text-gray-600 dark:text-gray-300">
            {currentDocuments.map((document) => (
              <tr
                key={document._id}
                className="border-b border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer" // Added cursor-pointer for better UX
                onClick={(e) => handleClickDocument(document, e)} // Binago mula onMouseEnter
              >
                <td className="whitespace-nowrap px-6 py-3 text-left">
                  <span className="text-sm font-light text-gray-700 dark:text-gray-300">
                    {document.title}
                  </span>
                </td>
                <td className="px-6 py-3 text-left">{document.author}</td>
                <td className="px-6 py-3 text-left">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      document.status === "Approved"
                        ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : ["Pending", "Draft"].includes(document.status)
                          ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                          : document.status === "Archived"
                            ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            : document.status === "Rejected"
                              ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100"
                              : ""
                    }`}
                  >
                    {document.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-left">{document.fileName}</td>
                <td className="px-6 py-3 text-left">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { // Added e.stopPropagation() to prevent row click from triggering
                        e.stopPropagation();
                        handleViewFile(document._id, document);
                      }}
                      className="rounded-full p-1 hover:bg-blue-100 dark:hover:bg-gray-600"
                      title="View File"
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                    </button>

                    <button
                      onClick={(e) => { // Added e.stopPropagation()
                        e.stopPropagation();
                        onEdit(document);
                      }}
                      className="rounded-full p-1 hover:bg-yellow-100 dark:hover:bg-gray-600"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-yellow-500" />
                    </button>

                    <button
                      onClick={(e) => { // Added e.stopPropagation()
                        e.stopPropagation();
                        handleDelete(document._id);
                      }}
                      className="rounded-full p-1 hover:bg-red-100 dark:hover:bg-gray-600"
                      title="Delete"
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end space-x-2 rounded-b-lg bg-white px-2 py-4 dark:bg-gray-800">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:opacity-50"
          >
            Prev
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <StatusVerification
        isOpen={isVerification}
        onConfirmDelete={handleConfirmDelete}
        onClose={handleCloseVerificationModal}
      />

      {/* Ang bagong modal na lalabas sa click */}
      <DocumentDetailsModal
        document={clickedDocument} // Pinalitan ang hoveredDocument
        position={modalPosition}
        isVisible={isModalVisible}
        onClose={handleCloseDocumentDetailsModal} // Idinagdag para may paraan isara ang modal
      />
    </div>
  );
};

export default DocumentTable;