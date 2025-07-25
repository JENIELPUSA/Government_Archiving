import React, { useState, useEffect, useContext, useRef } from "react";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { useNavigate } from "react-router-dom";
import StatusVerification from "../../../ReusableFolder/StatusModal";
import EditFormFile from "./../Document/EditForm";
import { XCircle, ArchiveRestore, Eye } from "lucide-react";

function ArchvingView() {
    const navigate = useNavigate();
    const { isFile, MOveArchived, UpdateStatus, updateFile } = useContext(FilesDisplayContext);
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
    const [selectedTags, setSelectedTags] = useState(new Set());
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPath, setCurrentPath] = useState([]);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const [showTags, setShowTags] = useState(false);
    const searchInputRef = useRef(null);

    const allTags = Array.from(new Set(isFile.flatMap((doc) => doc.tags || [])));
    const allCategories = Array.from(new Set(isFile.map((doc) => doc.category || "")));

    useEffect(() => {
        let docsToFilter = isFile;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const startDateTime = startDate ? new Date(startDate) : null;
        const endDateTime = endDate ? new Date(endDate) : null;

        if (endDateTime) {
            endDateTime.setHours(23, 59, 59, 999);
        }

        const newFilteredDocuments = docsToFilter.filter((doc) => {
            if (doc.Archived !== true) return false;

            const matchesSearch =
                lowerCaseSearchTerm === "" ||
                doc.title?.toLowerCase().includes(lowerCaseSearchTerm) ||
                doc.description?.toLowerCase().includes(lowerCaseSearchTerm) ||
                doc.tags?.some((tag) => tag.toLowerCase().includes(lowerCaseSearchTerm)) ||
                doc.author?.toLowerCase().includes(lowerCaseSearchTerm) ||
                (doc.archivedMetadata &&
                    Object.values(doc.archivedMetadata).some((meta) => String(meta).toLowerCase().includes(lowerCaseSearchTerm)));

            const itemDate = doc.createdAt ? new Date(doc.createdAt) : null;
            const matchesDate =
                (!startDateTime || (itemDate && itemDate >= startDateTime)) && (!endDateTime || (itemDate && itemDate <= endDateTime));

            const matchesTags = selectedTags.size === 0 || doc.tags?.some((tag) => selectedTags.has(tag));

            const matchesCategory = selectedCategory === "" || doc.category === selectedCategory;

            const matchesStatus = selectedStatus === "" || doc.status === selectedStatus;

            return matchesSearch && matchesDate && matchesTags && matchesCategory && matchesStatus;
        });

        setFilteredData(newFilteredDocuments);
        setCurrentPage(1);
    }, [searchTerm, startDate, endDate, isFile, selectedTags, selectedCategory, selectedStatus]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData?.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };
    const handleConfirmDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            await MOveArchived(isDeleteID);
            console.log("Document archived/deleted:", isDeleteID);
            handleCloseModal();
        } catch (err) {
            setError("Failed to archive/delete document.");
            console.error("Delete failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setVerification(false);
        setIsDeleteId("");
    };

    const handdlerestore = (item) => {
        setCurrentDocument(item);
    };

    const handleCloseEditForm = () => {
        setIsEditing(false);
        setCurrentDocument(null);
    };

    const handleSaveEditedDocument = async (updatedDoc) => {
        setLoading(true);
        setError(null);
        try {
            await updateFile(updatedDoc._id, updatedDoc);
            console.log("Saving edited document:", updatedDoc);
            setIsEditing(false);
            setCurrentDocument(null);
        } catch (err) {
            setError("Failed to save edited document.");
            console.error("Edit save failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewFile = (fileId, item) => {
        if (!fileId) {
            setError("Invalid file ID");
            return;
        }
        navigate(`/dashboard/pdf-viewer/${fileId}`, { state: { fileData: item } });
    };

    const handleTagClick = (tag) => {
        const newSelectedTags = new Set(selectedTags);
        if (newSelectedTags.has(tag)) {
            newSelectedTags.delete(tag);
        } else {
            newSelectedTags.add(tag);
        }
        setSelectedTags(newSelectedTags);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedTags(new Set());
        setSelectedCategory("");
        setSelectedStatus("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
        setShowTags(false);
    };

    const getVisibleItems = (docs, path) => {
        const currentPathString = path.join("/");
        const items = new Set();
        const documentsInCurrentView = [];

        docs.forEach((doc) => {
            const docFolderPath = doc.folder || "";
            const docPathSegments = docFolderPath.split("/").filter((segment) => segment !== "");

            if (docFolderPath === currentPathString) {
                documentsInCurrentView.push(doc);
            } else if (docFolderPath.startsWith(currentPathString + (currentPathString ? "/" : ""))) {
                const remainingPath = docFolderPath.substring(currentPathString.length + (currentPathString ? 1 : 0));
                const nextSegment = remainingPath.split("/")[0];
                if (nextSegment) {
                    items.add(nextSegment);
                }
            }
        });

        if (items.size > 0) {
            return { type: "folders", data: Array.from(items).sort() };
        } else {
            return { type: "documents", data: documentsInCurrentView };
        }
    };

    const handleFolderClick = (folderName) => {
        setCurrentPath([...currentPath, folderName]);
        setSelectedDocument(null);
        setCurrentPage(1);
    };

    const handleBreadcrumbClick = (index) => {
        setCurrentPath(currentPath.slice(0, index + 1));
        setSelectedDocument(null);
        setCurrentPage(1);
    };
    const handleBackToDocuments = () => {
        setSelectedDocument(null);
    };

    const currentViewContent = getVisibleItems(filteredData, currentPath);
    const displayContent =
        currentViewContent.type === "documents"
            ? { ...currentViewContent, data: currentItems.filter((doc) => (doc.folder || "") === currentPath.join("/")) }
            : currentViewContent;

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

                {selectedDocument ? (
                    <div className="p-6">
                        <button
                            className="mb-4 flex items-center rounded-md bg-blue-500 px-4 py-2 text-white transition duration-200 hover:bg-blue-600"
                            onClick={handleBackToDocuments}
                        >
                            <svg
                                className="mr-2 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                ></path>
                            </svg>
                            Back to Documents
                        </button>
                        <h2 className="mb-4 text-3xl font-bold text-blue-700">{selectedDocument.title}</h2>
                        <p className="mb-4 text-gray-700">{selectedDocument.description}</p>

                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-800">Details</h3>
                                <p className="text-gray-600">
                                    <strong>Category:</strong> {selectedDocument.category}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Date Uploaded:</strong>{" "}
                                    {selectedDocument.createdAt ? new Date(selectedDocument.createdAt).toLocaleDateString() : "N/A"}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Author:</strong> {selectedDocument.author || "N/A"}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Status:</strong>{" "}
                                    <span
                                        className={`${selectedDocument.status === "Approved" ? "text-green-600" : selectedDocument.status === "Pending" ? "text-yellow-600" : selectedDocument.status === "Archived" ? "text-gray-600" : "text-red-600"} font-medium`}
                                    >
                                        {selectedDocument.status}
                                    </span>
                                </p>
                            </div>
                            {selectedDocument.archivedMetadata && (
                                <div>
                                    <h3 className="mb-2 text-lg font-semibold text-gray-800">Archived Details</h3>
                                    <div className="rounded-md border border-gray-200 bg-gray-100 p-3">
                                        <p className="text-sm text-gray-600">
                                            <strong>Archived Date:</strong>{" "}
                                            {selectedDocument.archivedMetadata.dateArchived
                                                ? new Date(selectedDocument.archivedMetadata.dateArchived).toLocaleString()
                                                : "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Archived By:</strong> {selectedDocument.archivedMetadata.archivedBy || "N/A"}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Notes:</strong> {selectedDocument.archivedMetadata.notes || "N/A"}
                                        </p>
                                        {selectedDocument.archivedMetadata.originalAuthor && (
                                            <p className="text-sm text-gray-600">
                                                <strong>Original Author:</strong> {selectedDocument.archivedMetadata.originalAuthor}
                                            </p>
                                        )}
                                        {selectedDocument.archivedMetadata.originalVersion && (
                                            <p className="text-sm text-gray-600">
                                                <strong>Original Version:</strong> {selectedDocument.archivedMetadata.originalVersion}
                                            </p>
                                        )}
                                        {selectedDocument.archivedMetadata.originalClassification && (
                                            <p className="text-sm text-gray-600">
                                                <strong>Original Classification:</strong> {selectedDocument.archivedMetadata.originalClassification}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-2 text-lg font-semibold text-gray-800">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {(selectedDocument.tags || []).map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-md border border-gray-200 bg-gray-100 p-6">
                            <h3 className="mb-2 text-lg font-semibold text-gray-800">Document Content Preview</h3>
                            <p className="italic text-gray-600">
                                This is a placeholder for the actual document content or a preview. In a real application, this would load the
                                document file (e.g., PDF, Word) or its rendered text.
                            </p>
                            <p className="mt-2 text-sm text-gray-500">(Simulated content based on summary: {selectedDocument.summary})</p>
                        </div>
                    </div>
                ) : (
                    <>
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
                                    ref={searchInputRef}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                                    placeholder="Search by title, category, author..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setShowTags(true)}
                                    onBlur={(e) => {
                                        setTimeout(() => {
                                            if (!searchTerm && selectedTags.size === 0) {
                                                setShowTags(false);
                                            }
                                        }, 100);
                                    }}
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
                            <div className="min-w-[150px]">
                                <label
                                    htmlFor="category-filter"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Category
                                </label>
                                <select
                                    id="category-filter"
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {allCategories.map((cat) => (
                                        <option
                                            key={cat}
                                            value={cat}
                                        >
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="min-w-[150px]">
                                <label
                                    htmlFor="status-filter"
                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Status
                                </label>
                                <select
                                    id="status-filter"
                                    className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Draft">Rejected</option>
                                </select>
                            </div>
                            {showTags && (
                                <div className="min-w-[150px]">
                                    <h3 className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</h3>
                                    <div
                                        id="tags-container"
                                        className="flex flex-wrap gap-1"
                                    >
                                        {allTags.map((tag) => (
                                            <span
                                                key={tag}
                                                className={`tag-pill cursor-pointer rounded-full px-2 py-0.5 text-xs transition duration-200 ${selectedTags.has(tag) ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"}`}
                                                onClick={() => handleTagClick(tag)}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="flex-none">
                                <button
                                    className="mt-auto rounded-md bg-gray-300 px-4 py-2 text-gray-800 transition duration-200 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                    onClick={clearFilters}
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-indigo-600 text-white">
                                    <tr>
                                        <th className="rounded-tl-lg px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Summary</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Author</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Upload Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Date Archived</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">View File</th>
                                        <th className="rounded-tr-lg px-5 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:text-gray-300">
                                    {displayContent.type === "folders" && displayContent.data.length > 0 ? (
                                        displayContent.data.map((folderName, index) => (
                                            <tr
                                                key={`folder-${folderName}`}
                                                className="cursor-pointer border-b border-gray-100 transition duration-200 ease-in-out hover:bg-blue-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                                onClick={() => handleFolderClick(folderName)}
                                            >
                                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                                                    <svg
                                                        className="mr-2 inline-block h-5 w-5 text-blue-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
                                                    </svg>
                                                    {folderName}
                                                </td>
                                                <td
                                                    colSpan="10"
                                                    className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400"
                                                >
                                                    Folder (
                                                    {
                                                        isFile.filter(
                                                            (doc) => doc.folder && doc.folder.startsWith([...currentPath, folderName].join("/")),
                                                        ).length
                                                    }{" "}
                                                    items)
                                                </td>
                                            </tr>
                                        ))
                                    ) : displayContent.type === "documents" && displayContent.data.length > 0 ? (
                                        displayContent.data.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className="border-b border-gray-100 transition duration-200 ease-in-out hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700"
                                            >
                                                {" "}
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-blue-600 dark:text-blue-400">
                                                    {indexOfFirstItem + index + 1}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">
                                                    {item.title}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {item.category}
                                                </td>
                                                <td className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {item.summary}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {item.author || "N/A"}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    {item.archivedMetadata?.dateArchived
                                                        ? new Date(item.archivedMetadata.dateArchived).toLocaleDateString()
                                                        : "N/A"}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                            item.status === "Approved"
                                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                : item.status === "Pending"
                                                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                  : item.status === "Draft"
                                                                    ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                        }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewFile(item._id, item);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="View File"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-3 text-left text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handdlerestore(item);
                                                            }}
                                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            title="Edit"
                                                        >
                                                            <ArchiveRestore className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="11"
                                                className="px-5 py-3 text-center text-sm text-gray-500 dark:text-gray-400"
                                            >
                                                No documents or folders found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination controls */}
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                                        <span className="font-medium">{Math.min(indexOfLastItem, filteredData.length)}</span> of{" "}
                                        <span className="font-medium">{filteredData.length}</span> results
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label
                                        htmlFor="items-per-page"
                                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                    >
                                        Items per page:
                                    </label>
                                    <select
                                        id="items-per-page"
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                    >
                                        <option value="5">5</option>
                                        <option value="10">10</option>
                                        <option value="20">20</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                                <div>
                                    <nav
                                        className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                        aria-label="Pagination"
                                    >
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => paginate(i + 1)}
                                                aria-current={currentPage === i + 1 ? "page" : undefined}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                    currentPage === i + 1
                                                        ? "z-10 bg-indigo-600 text-white focus:outline-offset-0"
                                                        : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-300 dark:ring-gray-600 dark:hover:bg-gray-700"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        {isVerification && (
                            <StatusVerification
                                text="Are you sure you want to move this document to archive?"
                                confirmText="Yes, archive it!"
                                cancelText="No, keep it."
                                onConfirm={handleConfirmDelete}
                                onCancel={handleCloseModal}
                            />
                        )}

                        {isEditing && (
                            <EditFormFile
                                documentData={currentDocument}
                                onClose={handleCloseEditForm}
                                onSave={handleSaveEditedDocument}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ArchvingView;
