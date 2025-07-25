import React, { useContext, useState, useEffect } from "react";
import DraftFilter from "./DraftFilter";
import Table from "./Table";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import EditDocumentModal from "../AdminDashboard/Document/EditDocumentModal";
const DraftLayout = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalDetails, setModalDetails] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterTags, setFilterTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [documentsPerPage] = useState(10);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);

    const { isFile, updateFile, MOveArchived, UpdateStatus, setIsFile } = useContext(FilesDisplayContext) || {
        isFile: [],
        updateFile: () => {},
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleCloseEditForm = () => {
        setIsEditing(false);
        setCurrentDocument(null);
    };

    const handleSaveEditedDocument = (updatedDoc) => {
        const updatedDocuments = isFile.map((doc) => (doc._id === updatedDoc._id ? updatedDoc : doc));
        setIsFile(updatedDocuments);
        setIsEditing(false);
    };

    const openModal = (document) => {
        setModalTitle(document.title);

        const createdAt = new Date(document.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        const updatedAt = document.updatedAt
            ? new Date(document.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              })
            : "—";

        const details = `
      Author: ${document.author}<br>
      department: ${document.department}<br>
      Status: ${document.status}<br>
      Uploaded: ${createdAt}<br>
      Last Modified: ${updatedAt}
    `;

        setModalDetails(details);
        setShowModal(true);
    };

    const handleFilterChange = ({ search, status, department, tags, dateFrom, dateTo }) => {
        setSearchTerm(search);
        setFilterStatus(status);
        setFilterDepartment(department);
        setFilterTags(tags);
        setFilterDateFrom(dateFrom);
        setFilterDateTo(dateTo);
        setCurrentPage(1);
    };

    const onDelete = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this document?");
        if (!confirmDelete) return;

        const updatedDocuments = isFile.filter((doc) => doc._id !== id);
        setIsFile(updatedDocuments);
    };

    const onEdit = (doc) => {
        setCurrentDocument(doc);
        setIsEditing(true);
    };

    const handleEditSave = (updatedDocument) => {
        const documentIndex = isFile.findIndex((doc) => doc._id === updatedDocument._id);
        if (documentIndex !== -1) {
            const updatedFiles = [...isFile];
            updatedFiles[documentIndex] = updatedDocument;
            setIsFile(updatedFiles);
        }
        setIsEditing(false);
        setCurrentDocument(null);
    };

    const filteredDocuments = isFile?.filter((doc) => {
        if (doc.Archived === true || doc.status !== "Draft") return false;

        const matchSearch =
            searchTerm === "" ||
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.author.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = filterStatus === "" || doc.status === filterStatus;
        const matchDepartment = filterDepartment === "" || doc.department === filterDepartment;
        const matchTags = filterTags.length === 0 || (doc.tags && filterTags.every((tag) => doc.tags.includes(tag)));

        const docDate = new Date(doc.createdAt);
        const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
        const toDate = filterDateTo ? new Date(filterDateTo) : null;
        const matchDateFrom = !fromDate || docDate >= fromDate;
        const matchDateTo = !toDate || docDate <= toDate;

        return matchSearch && matchStatus && matchDepartment && matchTags && matchDateFrom && matchDateTo;
    });

    const indexOfLastDocument = currentPage * documentsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
    const currentDocuments = filteredDocuments?.slice(indexOfFirstDocument, indexOfLastDocument);

    const totalPages = Math.ceil((filteredDocuments?.length || 0) / documentsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const renderSkeleton = () => (
        <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <div className="mb-6 flex animate-pulse items-center justify-between">
                <div className="h-10 w-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="mb-6 animate-pulse">
                <div className="flex flex-wrap gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="h-12 w-32 rounded-lg bg-gray-200 dark:bg-gray-700"
                        ></div>
                    ))}
                </div>
            </div>
            <div className="animate-pulse">
                <div className="mb-4 flex justify-between border-b pb-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-6 w-24 rounded bg-gray-200 dark:bg-gray-700"
                        ></div>
                    ))}
                </div>
                {[...Array(5)].map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className="flex items-center justify-between border-b py-4"
                    >
                        {[...Array(5)].map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700"
                            ></div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="mt-6 flex animate-pulse justify-center">
                <div className="h-10 w-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
            </div>
        </div>
    );

    return (
        <div>
            {isLoading ? (
                renderSkeleton()
            ) : (
                <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-gray-100">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="flex items-center text-3xl font-bold text-gray-800 dark:text-gray-100">
                            <i className="fas fa-folder-open mr-3 text-blue-600 dark:text-blue-400"></i>
                            Draft Documents
                        </h1>
                    </div>

                    <DraftFilter
                        documents={currentDocuments || []}
                        onFilterChange={handleFilterChange}
                    />

                    <Table
                        documents={currentDocuments}
                        onPreview={openModal}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />

                    {totalPages > 1 && (
                        <nav className="mt-4 flex justify-center">
                            <ul className="inline-flex items-center -space-x-px">
                                <li>
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="rounded-l-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200 dark:disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                </li>
                                {pageNumbers.map((number) => (
                                    <li key={number}>
                                        <button
                                            onClick={() => paginate(number)}
                                            className={`border border-gray-300 px-3 py-2 leading-tight hover:bg-gray-100 hover:text-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-200 ${
                                                currentPage === number
                                                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 dark:hover:text-blue-100"
                                                    : "bg-white text-gray-500 dark:bg-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            {number}
                                        </button>
                                    </li>
                                ))}
                                <li>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="rounded-r-lg border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-gray-200 dark:disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>
            )}

            <EditDocumentModal
                show={isEditing}
                onClose={() => setIsEditing(false)}
                document={currentDocument}
                onSave={handleEditSave}
            />
        </div>
    );
};

export default DraftLayout;
