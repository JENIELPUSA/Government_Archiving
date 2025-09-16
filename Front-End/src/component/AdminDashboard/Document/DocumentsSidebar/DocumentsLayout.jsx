import React, { useContext, useEffect, useState } from "react";
import DocumentFilter from "../DocumentFilter";
import DocumentTable from "../DocumentTable";
import { FilesDisplayContext } from "../../../../contexts/FileContext/FileContext";
import EditDocumentModal from "../EditDocumentModal";
import DocumentFilterSkeleton from "./DocumentFilterSkeleton"; // Import the new component
import DocumentTableSkeleton from "./DocumentTableSkeleton"; // Import the new component

const DocumentLayout = () => {
    const { isFile, setIsFile, filters, setFilters, FetchFiles, currentPage, isActiveTags } = useContext(FilesDisplayContext);

    const [isEditing, setIsEditing] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        FetchFiles(currentPage, filters);
    }, [FetchFiles, currentPage, filters]);

    const handleFilterChange = (newFilters) => {
        const isEqual =
            JSON.stringify(filters) ===
            JSON.stringify({
                title: newFilters.search,
                status: newFilters.status,
                category: newFilters.category,
                tags: newFilters.tags,
                dateFrom: newFilters.dateFrom,
                dateTo: newFilters.dateTo,
                limit: newFilters.limit,
            });

        if (!isEqual) {
            setFilters({
                title: newFilters.search,
                status: newFilters.status,
                category: newFilters.category,
                tags: newFilters.tags,
                dateFrom: newFilters.dateFrom,
                dateTo: newFilters.dateTo,
                limit: newFilters.limit,
            });
        }
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
                        documents={isFile}
                        onFilterChange={handleFilterChange}
                        isActiveTags={isActiveTags}
                    />
                )}

                {loading ? (
                    <DocumentTableSkeleton />
                ) : (
                    <DocumentTable
                        documents={isFile.filter((doc) => doc.ArchivedStatus === "Active")}
                        onPreview={() => {}}
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
