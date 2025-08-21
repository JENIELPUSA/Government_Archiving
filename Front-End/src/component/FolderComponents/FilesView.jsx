import React, { useState } from "react";
import {
    ArrowLeft,
    Upload,
    Calendar,
    Search,
    ChevronLeft,
    ChevronRight,
    Folder,
    File,
    FileText,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
} from "lucide-react";
import EditDocumentModal from "../AdminDashboard/Document/EditDocumentModal";
import UploadDocumentModal from "./FormUpload/UploadDocuments";

const FilesView = ({
    openFolder,
    closeFolderWithEffect,
    handleUploadFiles,
    isfolderFiles,
    isLoadingFiles,
    fileSearchTerm,
    handleFileSearch,
    fileDateFrom,
    setFileDateFrom,
    fileDateTo,
    setFileDateTo,
    resetFileFilters,
    fileCurrentPage,
    fileTotalPages,
    fetchSpecificData,
    openFileMenu,
    setOpenFileMenu,
    handleViewPdf,
    handleDeleteFiles,
    getColorClasses,
    getFileTypeColor,
    getFileIcon,
    isUploadModalOpen,
    closeUploadModal,
    Success,
}) => {
    const colorClasses = getColorClasses(openFolder.color);
    const [isEditing, setIsEditing] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);

    const handleEditSave = (updatedDocument) => {
        // This would typically update the document in your backend
        console.log("Saving document:", updatedDocument);
        setIsEditing(false);
        setCurrentDocument(null);
        
        // Refetch data to update the UI
        fetchSpecificData(openFolder._id, {
            search: fileSearchTerm,
            type: "",
            dateFrom: fileDateFrom,
            dateTo: fileDateTo,
            page: fileCurrentPage,
        });
    };

    const handleEditClick = (file) => {
        setCurrentDocument(file);
        setIsEditing(true);
        setOpenFileMenu(null);
    };

    if (isLoadingFiles) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className={`${colorClasses.bg} border-b-2 ${colorClasses.border} shadow-sm`}>
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <div className="mb-8 flex items-center justify-between">
                            <button
                                onClick={closeFolderWithEffect}
                                className="flex transform items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Folders
                            </button>
                        </div>
                        <div className="flex items-center gap-8">
                            <div
                                className={`rounded-3xl bg-white p-6 shadow-xl ${colorClasses.border} transform border-2 transition-transform duration-200 hover:scale-105 dark:bg-gray-800`}
                            >
                                <Folder className={`h-20 w-20 ${colorClasses.icon}`} />
                            </div>
                            <div>
                                <h1 className="mb-3 text-5xl font-bold text-gray-900 dark:text-white">{openFolder.folderName}</h1>
                                <div className="flex items-center gap-8 text-gray-600 dark:text-gray-400">
                                    <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800">
                                        <Calendar className="h-5 w-5" />
                                        Loading files...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH SKELETON */}
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-1 flex-wrap items-center gap-4">
                            <div className="relative min-w-[250px] flex-1">
                                <div className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-full rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="h-4 w-12 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <div className="flex gap-2">
                                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FILES SKELETON */}
                <div className="mx-auto max-w-7xl px-6 pb-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="animate-pulse">
                            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                                <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                                <div className="mt-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {[...Array(5)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="p-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
                                                <div className="space-y-2">
                                                    <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                                                    <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Folder Header */}
            <div className={`${colorClasses.bg} border-b-2 ${colorClasses.border} shadow-sm`}>
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="mb-8 flex items-center justify-between">
                        <button
                            onClick={closeFolderWithEffect}
                            className="flex transform items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Folders
                        </button>
                        <button
                            onClick={handleUploadFiles}
                            className="flex transform items-center gap-3 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
                        >
                            <Upload className="h-5 w-5" />
                            Upload Files
                        </button>
                    </div>
                    <div className="flex items-center gap-8">
                        <div
                            className={`rounded-3xl bg-white p-6 shadow-xl ${colorClasses.border} transform border-2 transition-transform duration-200 hover:scale-105 dark:bg-gray-800`}
                        >
                            <Folder className={`h-20 w-20 ${colorClasses.icon}`} />
                        </div>
                        <div>
                            <h1 className="mb-3 text-5xl font-bold text-gray-900 dark:text-white">{openFolder.folderName}</h1>
                            <div className="flex items-center gap-8 text-gray-600 dark:text-gray-400">
                                <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800">
                                    <Calendar className="h-5 w-5" />
                                    Created {new Date(openFolder.createdAt).toLocaleDateString()}
                                </span>
                                <span className="rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800">{isfolderFiles.length} files</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Filter Controls */}
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    {/* Combined search and filter bar */}
                    <div className="flex flex-1 flex-wrap items-center gap-4">
                        {/* File Search Input */}
                        <div className="relative min-w-[250px] flex-1">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={fileSearchTerm}
                                onChange={(e) => handleFileSearch(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 py-2 pl-12 pr-4 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From:</label>
                            <input
                                type="date"
                                value={fileDateFrom}
                                onChange={(e) => setFileDateFrom(e.target.value)}
                                className="rounded-xl border border-gray-300 px-2 py-1 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To:</label>
                            <input
                                type="date"
                                value={fileDateTo}
                                onChange={(e) => setFileDateTo(e.target.value)}
                                className="rounded-xl border border-gray-300 px-2 py-1 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        {/* Reset Button */}
                        {(fileSearchTerm || fileDateFrom || fileDateTo) && (
                            <button
                                onClick={resetFileFilters}
                                className="rounded-lg px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Page {fileCurrentPage} of {fileTotalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    fetchSpecificData(openFolder._id, {
                                        search: fileSearchTerm,
                                        type: "",
                                        dateFrom: fileDateFrom,
                                        dateTo: fileDateTo,
                                        page: Math.max(fileCurrentPage - 1, 1),
                                    })
                                }
                                disabled={fileCurrentPage === 1}
                                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() =>
                                    fetchSpecificData(openFolder._id, {
                                        search: fileSearchTerm,
                                        type: "",
                                        dateFrom: fileDateFrom,
                                        dateTo: fileDateTo,
                                        page: Math.min(fileCurrentPage + 1, fileTotalPages),
                                    })
                                }
                                disabled={fileCurrentPage === fileTotalPages || fileTotalPages === 0}
                                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Folder Content */}
            <div className="mx-auto max-w-7xl px-6 pb-8">
                {isfolderFiles.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className={`h-32 w-32 ${colorClasses.bg} mx-auto mb-8 flex items-center justify-center rounded-3xl shadow-lg`}>
                            <Folder className={`h-16 w-16 ${colorClasses.icon}`} />
                        </div>
                        <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">No files found</h3>
                        <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                            {fileSearchTerm || fileDateFrom || fileDateTo ? "Try adjusting your filters" : "Add some files to get started"}
                        </p>

                        <button
                            onClick={handleUploadFiles}
                            className="mx-auto flex transform items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
                        >
                            <Upload className="h-5 w-5" />
                            Upload Files
                        </button>
                    </div>
                ) : (
                    <div className="overflow-visible rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Files in this folder</h2>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">Showing {isfolderFiles.length} files</p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {isfolderFiles.map((file, index) => {
                                const fileExtension = file.fileName?.split(".").pop()?.toLowerCase() || "";
                                const fileType = file.category || fileExtension;
                                const colorClasses = getFileTypeColor(fileType.toLowerCase());
                                const IconComponent = getFileIcon(fileType);

                                return (
                                    <div
                                        key={file._id}
                                        className="group p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div
                                                    className={`rounded-2xl p-4 ${colorClasses.bg} ${colorClasses.text} shadow-sm transition-transform duration-200 group-hover:scale-110`}
                                                >
                                                    <IconComponent className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                        {file.title || file.fileName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {file.category} • {file.fileSize} bytes • {new Date(file.uploadDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenFileMenu(openFileMenu === file._id ? null : file._id);
                                                    }}
                                                    className="rounded-xl p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                                                >
                                                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                </button>
                                                {openFileMenu === file._id && (
                                                    <div className="absolute right-0 top-full z-[999] mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewPdf(file);
                                                                setOpenFileMenu(null);
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                            <span>View</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditClick(file);
                                                            }}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFiles(file._id)}
                                                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination for files */}
                        {fileTotalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {fileCurrentPage} of {fileTotalPages}
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() =>
                                            fetchSpecificData(openFolder._id, {
                                                search: fileSearchTerm,
                                                type: "",
                                                dateFrom: fileDateFrom,
                                                dateTo: fileDateTo,
                                                page: Math.max(fileCurrentPage - 1, 1),
                                            })
                                        }
                                        disabled={fileCurrentPage === 1}
                                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </button>
                                    <button
                                        onClick={() =>
                                            fetchSpecificData(openFolder._id, {
                                                search: fileSearchTerm,
                                                type: "",
                                                dateFrom: fileDateFrom,
                                                dateTo: fileDateTo,
                                                page: Math.min(fileCurrentPage + 1, fileTotalPages),
                                            })
                                        }
                                        disabled={fileCurrentPage === fileTotalPages}
                                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                                    >
                                        Next <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* UPLOAD MODAL */}
            {isUploadModalOpen && (
                <UploadDocumentModal
                    isOpen={isUploadModalOpen}
                    onClose={closeUploadModal}
                    folderId={openFolder._id}
                    isSuccess={Success}
                />
            )}

            {/* EDIT DOCUMENT MODAL */}
            {isEditing && (
                <EditDocumentModal
                    show={isEditing}
                    onClose={() => setIsEditing(false)}
                    document={currentDocument}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
};


export default FilesView;