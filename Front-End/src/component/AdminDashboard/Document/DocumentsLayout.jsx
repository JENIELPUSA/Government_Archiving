import React, { useContext, useState, useEffect } from "react";
import DocumentFilter from "./DocumentFilter";
import DocumentTable from "./DocumentTable";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import EditDocumentModal from "./EditDocumentModal";

const DocumentLayout = () => {
    const [filterStatus, setFilterStatus] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterTags, setFilterTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [loading, setLoading] = useState(true);

    const { isFile, setIsFile } = useContext(FilesDisplayContext) || {
        isFile: [],
        setIsFile: () => {},
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

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
          Category: ${document.category}<br>
          Status: ${document.status}<br>
          Uploaded: ${createdAt}<br>
          Last Modified: ${updatedAt}
        `;

        setModalDetails(details);
        setShowModal(true);
    };

    const handleFilterChange = ({ search, status, category, tags, dateFrom, dateTo }) => {
        setSearchTerm(search);
        setFilterStatus(status);
        setFilterCategory(category);
        setFilterTags(tags);
        setFilterDateFrom(dateFrom);
        setFilterDateTo(dateTo);
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
        const documentIndex = isFile.findIndex(doc => doc._id === updatedDocument._id);
        if (documentIndex !== -1) {
            const updatedFiles = [...isFile];
            updatedFiles[documentIndex] = updatedDocument;
            setIsFile(updatedFiles);
        }
        setIsEditing(false);
        setCurrentDocument(null);
    };

    const filteredDocuments = isFile?.filter((doc) => {
        if (
            doc.ArchivedStatus === "Archived" ||
            doc.ArchivedStatus === "Deleted" ||
            doc.ArchivedStatus === "For Restore" ||
            doc.status === "Draft"
        ) return false;

        const matchSearch =
            searchTerm === "" ||
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.author.toLowerCase().includes(searchTerm.toLowerCase());

        const matchStatus = filterStatus === "" || doc.status === filterStatus;
        const matchCategory = filterCategory === "" || doc.category === filterCategory;
        const matchTags = filterTags.length === 0 || (doc.tags && filterTags.every(tag => doc.tags.includes(tag)));

        const docDate = new Date(doc.createdAt);
        const fromDate = filterDateFrom ? new Date(filterDateFrom) : null;
        const toDate = filterDateTo ? new Date(filterDateTo) : null;
        const matchDateFrom = !fromDate || docDate >= fromDate;
        const matchDateTo = !toDate || docDate <= toDate;

        return matchSearch && matchStatus && matchCategory && matchTags && matchDateFrom && matchDateTo;
    });

    const DocumentFilterSkeleton = () => (
        <div className="mb-6 animate-pulse">
            <div className="flex flex-wrap gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-10 w-full rounded bg-gray-200 md:w-40 dark:bg-gray-700"></div>
                ))}
            </div>
        </div>
    );

    const DocumentTableSkeleton = () => (
        <div className="animate-pulse">
            <div className="mb-4 flex items-center justify-between">
                <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-10 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-5 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-700">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 rounded bg-gray-200 dark:bg-gray-600"></div>
                    ))}
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[...Array(5)].map((_, rowIdx) => (
                        <div key={rowIdx} className="grid grid-cols-5 gap-4 px-6 py-4">
                            {[...Array(5)].map((_, colIdx) => (
                                <div
                                    key={colIdx}
                                    className={`h-4 rounded bg-gray-200 dark:bg-gray-700 ${colIdx === 4 ? 'w-24' : ''}`}
                                ></div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-gray-100">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="flex items-center text-3xl font-bold text-gray-800 dark:text-gray-100">
                        <i className="fas fa-folder-open mr-3 text-blue-600 dark:text-blue-400"></i>
                        Documents List
                    </h1>
                </div>

                {loading ? (
                    <DocumentFilterSkeleton />
                ) : (
                    <DocumentFilter
                        documents={filteredDocuments || []}
                        onFilterChange={handleFilterChange}
                    />
                )}

                {loading ? (
                    <DocumentTableSkeleton />
                ) : (
                    <DocumentTable
                        documents={filteredDocuments}
                        onPreview={openModal}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
            </div>

            <EditDocumentModal
                show={isEditing}
                onClose={() => setIsEditing(false)}
                document={currentDocument}
                onSave={handleEditSave}
            />
        </div>
    );
};

export default DocumentLayout;
