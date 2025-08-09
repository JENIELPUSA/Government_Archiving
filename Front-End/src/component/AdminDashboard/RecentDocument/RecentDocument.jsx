import React, { useContext, useEffect, useState } from "react";
import DocumentFilter from "./DocumentFilter";
import DocumentTable from "./DocumentTable";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";

const RecentDocument = () => {
    const { isFile, setIsFile, filters, setFilters, FetchFiles, currentPage,isActiveTags } = useContext(FilesDisplayContext);

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
            });

        if (!isEqual) {
            setFilters({
                title: newFilters.search,
                status: newFilters.status,
                category: newFilters.category,
                tags: newFilters.tags,
                dateFrom: newFilters.dateFrom,
                dateTo: newFilters.dateTo,
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
                        documents={isFile}
                        onPreview={() => {}}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
            </div>
        </div>
    );
};

const DocumentFilterSkeleton = () => (
    <div className="mb-6 animate-pulse">
        <div className="flex flex-wrap gap-4">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700 md:w-40"
                ></div>
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
                    <div
                        key={i}
                        className="h-4 rounded bg-gray-200 dark:bg-gray-600"
                    ></div>
                ))}
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[...Array(5)].map((_, rowIdx) => (
                    <div
                        key={rowIdx}
                        className="grid grid-cols-5 gap-4 px-6 py-4"
                    >
                        {[...Array(5)].map((_, colIdx) => (
                            <div
                                key={colIdx}
                                className={`h-4 rounded bg-gray-200 dark:bg-gray-700 ${colIdx === 4 ? "w-24" : ""}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default RecentDocument;
