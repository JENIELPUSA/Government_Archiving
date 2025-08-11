import React, { useEffect, useContext, useState } from "react";
import { Eye, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";

// Skeleton component for table rows
const DocumentTableRowSkeleton = () => (
    <tr className="border-b border-gray-200 dark:border-gray-700">
        <td className="px-6 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
        </td>
        <td className="px-6 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
        </td>
        <td className="px-6 py-3">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
        </td>
        <td className="px-6 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        </td>
        <td className="px-6 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </td>
        <td className="px-6 py-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse"></div>
        </td>
    </tr>
);

// Skeleton component for pagination
const PaginationSkeleton = () => (
    <div className="flex items-center space-x-2 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </div>
);

const DocumentTable = ({ documents }) => {
    const navigate = useNavigate();
    const { FetchFiles, totalPages, currentPage, setCurrentPage } = useContext(FilesDisplayContext);
    const [loading, setLoading] = useState(false);
    const [displayedDocuments, setDisplayedDocuments] = useState([]);
    
    useEffect(() => {
        // Save current displayed documents
        if (documents.length > 0 && !loading) {
            setDisplayedDocuments(documents);
        }
    }, [documents, loading]);

    useEffect(() => {
        // Reset to page 1 if out of bounds
        if ((currentPage > totalPages && totalPages > 0) || (totalPages === 0 && currentPage !== 1)) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const goToPage = async (page) => {
        if (page < 1 || page > totalPages) return;

        setLoading(true);
        setCurrentPage(page);

        try {
            await FetchFiles?.(page);
        } catch (error) {
            console.error("FetchFiles error:", error);
        }

        setLoading(false);
    };

    const handleViewFile = (fileId, item) => {
        if (!fileId) return;
        navigate(`/dashboard/pdf-viewer/${fileId}`, {
            state: { fileData: item },
        });
    };

    const renderPageNumbers = () => {
        if (loading) return <PaginationSkeleton />;
        
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
                    key="first"
                    onClick={() => goToPage(1)}
                    className="mx-1 rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                    1
                </button>,
            );
            if (startPage > 2) {
                pageNumbers.push(
                    <span
                        key="dots-start"
                        className="mx-1 px-3 py-1 text-gray-500"
                    >
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
                            ? "bg-indigo-500 text-white dark:bg-indigo-700"
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
                    <span
                        key="dots-end"
                        className="mx-1 px-3 py-1 text-gray-500"
                    >
                        ...
                    </span>,
                );
            }
            pageNumbers.push(
                <button
                    key="last"
                    onClick={() => goToPage(totalPages)}
                    className="mx-1 rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                    {totalPages}
                </button>,
            );
        }

        return pageNumbers;
    };

    const renderTableContent = () => {
        if (loading) {
            return Array.from({ length: displayedDocuments.length || 5 }).map((_, index) => (
                <DocumentTableRowSkeleton key={`skeleton-${index}`} />
            ));
        }

        if (!documents || documents.length === 0) {
            return (
                <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <Database className="h-10 w-10" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">No Documents Available</h3>
                            <p className="text-center text-gray-500 dark:text-gray-400">
                                There are no documents to display in the database.
                                <br />
                                Create a new document to get started.
                            </p>
                        </div>
                    </td>
                </tr>
            );
        }

        return documents.map((doc) => (
            <tr
                key={doc._id}
                className="border-b border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
            >
                <td className="px-6 py-3">{doc.title}</td>
                <td className="px-6 py-3">{doc.author}</td>
                <td className="px-6 py-3">
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            doc.status === "Approved"
                                ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100"
                                : ["Pending", "Draft"].includes(doc.status)
                                  ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                  : doc.status === "Archived"
                                    ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                    : doc.status === "Rejected"
                                      ? "bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100"
                                      : ""
                        }`}
                    >
                        {doc.status}
                    </span>
                </td>
                <td className="px-6 py-3">{doc.suggestion}</td>
                <td className="px-6 py-3">{new Date(doc.createdAt).toLocaleDateString("en-US")}</td>
                <td className="px-6 py-3">
                    <button
                        onClick={() => handleViewFile(doc._id, doc)}
                        className="rounded-full p-1 hover:bg-blue-100 dark:hover:bg-gray-600"
                        title="View File"
                    >
                        <Eye className="h-4 w-4 text-blue-500" />
                    </button>
                </td>
            </tr>
        ));
    };

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-200 text-sm uppercase leading-normal text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-6 py-3 text-left">Author</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Notes</th>
                            <th className="px-6 py-3 text-left">Uploaded</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-light text-gray-600 dark:text-gray-300">
                        {renderTableContent()}
                    </tbody>
                </table>
            </div>

            {/* Always show pagination controls if there are pages */}
            {totalPages > 0 && (
                <div className="mt-4 flex items-center justify-end space-x-2 rounded-b-lg bg-white px-2 py-4 dark:bg-gray-800">
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:opacity-50"
                    >
                        Previous
                    </button>
                    {renderPageNumbers()}
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DocumentTable;