import React, { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocumentTable = ({ documents }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();

    const totalPages = Math.ceil(documents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDocuments = documents.slice(startIndex, startIndex + itemsPerPage);

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
        return <div className="p-6 text-center text-gray-500 dark:text-gray-400">No documents available.</div>;
    }

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gray-200 text-sm uppercase leading-normal text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left">Title</th>
                            <th className="px-6 py-3 text-left">Summary</th>
                            <th className="px-6 py-3 text-left">Author</th>
                            <th className="px-6 py-3 text-left">Department</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-left">Notes</th>
                            <th className="px-6 py-3 text-left">Uploaded</th>
                            <th className="px-6 py-3 text-left">File Name</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-light text-gray-600 dark:text-gray-300">
                        {currentDocuments.map((document) => (
                            <tr
                                key={document._id}
                                className="border-b border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                <td className="whitespace-nowrap px-6 py-3 text-left">
                                    <span className="text-sm font-light text-gray-700 dark:text-gray-300">{document.title}</span>
                                    {document.tags && document.tags.length > 0 && (
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {document.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="mr-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">{document.summary}</td>

                                <td className="px-6 py-3 text-left">{document.author}</td>
                                <td className="px-6 py-3 text-left">{document.department}</td>
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
                                <td className="px-6 py-3 text-left">{document.suggestion}</td>
                                <td className="px-6 py-3 text-left">{new Date(document.createdAt).toLocaleDateString("en-US")}</td>
                                <td className="px-6 py-3 text-left">{document.fileName}</td>
                                <td className="px-6 py-3 text-left">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewFile(document._id, document)}
                                            className="rounded-full p-1 hover:bg-blue-100 dark:hover:bg-gray-600"
                                            title="View File"
                                        >
                                            <Eye className="h-4 w-4 text-blue-500" />
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
                        Previous
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
        </div>
    );
};

export default DocumentTable;