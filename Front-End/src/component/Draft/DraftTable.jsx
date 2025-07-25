import React, { useState, useEffect, useContext } from "react";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import EditFormFile from "../../component/AdminDashboard/Document/EditForm";
import { useNavigate } from "react-router-dom";
import StatusVerification from "../../ReusableFolder/StatusModal";
import { CheckCircle, XCircle, Trash2, Pencil, Eye } from "lucide-react";

import axios from "axios";

const Draft = () => {
    const navigate = useNavigate();
    const { isFile, updateFile, MOveArchived, UpdateStatus } = useContext(FilesDisplayContext) || { isFile: [], updateFile: () => {} };
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
useEffect(() => {
    let currentFilteredData = isFile?.filter((item) => {
        const notArchived = item.Archived === false;
        const isDraft = item.status === 'Draft';
        const matchesSearch =
            item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.author?.toLowerCase().includes(searchTerm.toLowerCase());

        const itemDate = item.createdAt ? new Date(item.createdAt) : null;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (end) {
            end.setHours(23, 59, 59, 999);
        }

        const matchesDate =
            (!start || (itemDate && itemDate >= start)) &&
            (!end || (itemDate && itemDate <= end));

        return notArchived && isDraft && matchesSearch && matchesDate; // Idinagdag ang 'isDraft' sa return statement
    });

    setFilteredData(currentFilteredData);
    setCurrentPage(1);
}, [searchTerm, startDate, endDate, isFile]);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
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

    const handleConfirmDelete = async () => {
        console.log("ID to Delete",isDeleteID)
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setVerification(false);
    };

    const handleEdit = (item) => {
        setCurrentDocument(item);
        setIsEditing(true);
    };

    const handleCloseEditForm = () => {
        setIsEditing(false);
        setCurrentDocument(null);
    };

    const handleSaveEditedDocument = (updatedDoc) => {
        console.log("Saving edited document:", updatedDoc);
        updateFile(updatedDoc._id, updatedDoc);
        setIsEditing(false);
        setCurrentDocument(null);
    };

    const handleViewFile = (fileId, item) => {
        if (!fileId) {
            setError("Invalid file ID");
            return;
        }
        navigate(`/dashboard/pdf-viewer/${fileId}`, { state: { fileData: item } });
    };

    return (
        <div className="flex min-h-screen items-start justify-center rounded-2xl bg-gray-300 p-4 font-sans dark:bg-gray-900 sm:p-6 lg:p-8">
            <div className="table-container w-full max-w-7xl overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-800 dark:shadow-xl">
                <h1 className="border-b border-gray-200 p-6 text-3xl font-bold text-gray-800 dark:border-gray-700 dark:text-white">
                    Document Archive
                </h1>

                {error && (
                    <div
                        className="relative m-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
                        role="alert"
                    >
                        <span className="block sm:inline">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="absolute right-0 top-0 px-4 py-3"
                            aria-label="Close alert"
                        >
                            <svg
                                className="h-6 w-6 fill-current text-red-500"
                                role="button"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M14.348 5.652a1 1 0 00-1.414 0L10 8.586 7.066 5.652a1 1 0 10-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 11.414l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934a1 1 0 000-1.414z" />
                            </svg>
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center p-6">
                        <svg
                            className="h-8 w-8 animate-spin text-indigo-600"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 p-6 shadow-sm dark:border-gray-700">
                    <div className="min-w-[200px] flex-1">
                        <label
                            htmlFor="search"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Search
                        </label>
                        <input
                            type="text"
                            id="search"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                            placeholder="Search by title, department, author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <label
                            htmlFor="startDate"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            From Date
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="min-w-[150px]">
                        <label
                            htmlFor="endDate"
                            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            To Date
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-indigo-600 text-white">
                            <tr>
                                <th className="rounded-tl-lg px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">department</th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Summary</th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Author</th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Upload Date</th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">View File</th>
                                <th className="rounded-tr-lg px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr
                                        key={item._id}
                                        className="border-b border-gray-100 transition duration-200 ease-in-out hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                    >
                                        <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {indexOfFirstItem + index + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {item.title}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{item.department}</td>
                                        <td className="max-w-xs overflow-hidden text-ellipsis whitespace-normal px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {item.summary}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">{item.author}</td>
                                        <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${
                                                    item.status === "Approved"
                                                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                                                        : item.status === "Pending"
                                                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                                                          : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-sm text-blue-600 dark:text-blue-400">
                                            <button
                                                onClick={() => handleViewFile(item._id, item)}
                                                className="flex items-center justify-center rounded-full p-2 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:hover:bg-blue-900"
                                                aria-label={`View PDF for ${item.title}`}
                                            >
                                                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                            </button>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="inline-flex items-center rounded-full border border-transparent bg-gray-600 p-2 text-white shadow-sm transition duration-150 ease-in-out hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-800"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="inline-flex items-center rounded-full border border-transparent bg-blue-600 p-2 text-white shadow-sm transition duration-150 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-offset-gray-800"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="10"
                                        className="px-5 py-6 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No data available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="itemsPerPage"
                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Show
                        </label>
                        <select
                            id="itemsPerPage"
                            value={itemsPerPage}
                            onChange={handleItemsPerPageChange}
                            className="block rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </select>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">entries</span>
                    </div>

                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <nav
                        className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                        aria-label="Pagination"
                    >
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => paginate(i + 1)}
                                className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-600 ${currentPage === i + 1 ? "z-10 border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-900 dark:text-indigo-200" : "bg-white text-gray-700 hover:bg-indigo-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            </div>

            <EditFormFile
                isOpen={isEditing}
                document={currentDocument}
                onClose={handleCloseEditForm}
                onSave={handleSaveEditedDocument}
            />

            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default Draft;
