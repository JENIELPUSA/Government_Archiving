import React, { useEffect, useContext } from "react";
import { Eye,Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";

const DocumentTable = ({ documents }) => {
    const navigate = useNavigate();
    const { FetchFiles, totalPages, currentPage, setCurrentPage } = useContext(FilesDisplayContext);

    useEffect(() => {
        // Reset to page 1 if out of bounds
        if ((currentPage > totalPages && totalPages > 0) || (totalPages === 0 && currentPage !== 1)) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        FetchFiles?.(page);
    };

    const handleViewFile = (fileId, item) => {
        if (!fileId) return;
        navigate(`/dashboard/pdf-viewer/${fileId}`, {
            state: { fileData: item },
        });
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

    if (!documents || documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 shadow-md dark:border-gray-600 dark:bg-gray-800">
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
                            <th className="px-6 py-3 text-left">Notes</th>
                            <th className="px-6 py-3 text-left">Uploaded</th>
                            <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm font-light text-gray-600 dark:text-gray-300">
                        {documents.map((doc) => (
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Always show pagination controls */}
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
        </div>
    );
};

export default DocumentTable;
