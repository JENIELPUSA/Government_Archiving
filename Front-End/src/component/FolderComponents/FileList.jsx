import React, { useState, useEffect, useRef } from "react";
import {
    ArrowLeft,
    Upload,
    Filter,
    ChevronLeft,
    ChevronRight,
    Calendar,
    FileText,
    Image,
    Video,
    Music,
    Archive,
    File,
    MoreVertical,
    X,
    Folder,
    Search,
    Eye,
    Edit,
    Trash,
} from "lucide-react";
import UploadDocumentsModal from "./FormUpload/UploadDocuments";

const FileList = ({
    openFolder,
    closeFolder,
    getColorClasses,
    isfolderFiles,
    isLoadingFiles,
    handleUploadFiles,
    isUploadModalOpen,
    closeUploadModal,
    totalPages,
    currentPage,
    navigate,
    onPageChange, // Prop baru untuk menangani perubahan halaman
}) => {
    const [showFileFilters, setShowFileFilters] = useState(false);
    const [fileFilters, setFileFilters] = useState({
        type: "",
        dateFrom: "",
        dateTo: "",
    });
    const [fileTypeInput, setFileTypeInput] = useState("");
    const [suggestedTypes, setSuggestedTypes] = useState([]);
    const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // Track which file's menu is open
    const menuRef = useRef(null);
    const fileTypeOptions = ["ordinance", "image", "video", "audio", "archive"];

    const colorClasses = getColorClasses(openFolder.color);

    // Handle file type suggestions
    useEffect(() => {
        if (fileTypeInput.length > 0) {
            const filtered = fileTypeOptions.filter((type) => type.toLowerCase().includes(fileTypeInput.toLowerCase()));
            setSuggestedTypes(filtered);
            setShowTypeSuggestions(true);
        } else {
            setShowTypeSuggestions(false);
        }
    }, [fileTypeInput]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleTypeSelect = (type) => {
        setFileFilters({ ...fileFilters, type });
        setFileTypeInput("");
        setShowTypeSuggestions(false);
    };

    const resetFileFilters = () => {
        setFileFilters({
            type: "",
            dateFrom: "",
            dateTo: "",
        });
    };

    const getFileTypeColor = (type) => {
        switch (type) {
            case "ordinance":
            case "pdf":
                return "text-red-500 bg-red-50 dark:bg-red-950";
            default:
                return "text-gray-500 bg-gray-50 dark:bg-gray-950";
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case "Ordinance":
            case "pdf":
                return FileText;
            case "image":
            case "jpg":
            case "png":
            case "jpeg":
                return Image;
            case "video":
                return Video;
            case "audio":
                return Music;
            case "archive":
            case "zip":
            case "rar":
                return Archive;
            default:
                return File;
        }
    };

    const handleViewPdf = (file) => {
        navigate(`/dashboard/pdf-viewer/${file._id}`, { state: { fileData: file } });
    };

    const handleEditFile = (fileId) => {
        console.log("Edit file:", fileId);
        // Add your edit functionality here
        setActiveMenu(null); // Close menu after action
    };

    const handleDeleteFile = (fileId) => {
        console.log("Delete file:", fileId);
        // Add your delete functionality here
        setActiveMenu(null); // Close menu after action
    };

    // Filter files
    const filterFiles = (files) => {
        if (!files || !Array.isArray(files)) return [];

        return files.filter((file) => {
            if (fileFilters.type && file.category.toLowerCase() !== fileFilters.type.toLowerCase()) {
                return false;
            }
            const fileDate = new Date(file.created_at);
            if (fileFilters.dateFrom && new Date(fileFilters.dateFrom) > fileDate) {
                return false;
            }
            if (fileFilters.dateTo && new Date(fileFilters.dateTo) < fileDate) {
                return false;
            }
            return true;
        });
    };

    const filteredFiles = filterFiles(isfolderFiles);

    // Gunakan semua file yang diterima (sudah dipaginasi di backend)
    const currentFiles = isfolderFiles;

    if (isLoadingFiles) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className={`${colorClasses.bg} border-b-2 ${colorClasses.border} shadow-sm`}>
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <div className="mb-8 flex items-center justify-between">
                            <button
                                onClick={closeFolder}
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

                {/* LOADING CONTENT */}
                <div className="mx-auto max-w-7xl px-6 py-8">
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
                            onClick={closeFolder}
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
                                    Created {new Date().toLocaleDateString()}
                                </span>
                                <span className="rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800">{filteredFiles.length} files</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Filter Controls */}
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => setShowFileFilters(!showFileFilters)}
                        className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        <Filter className="h-4 w-4" />
                        {showFileFilters ? "Hide Filters" : "Show Filters"}
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced File Filters */}
                {showFileFilters && (
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Advanced File Filters</h3>
                            <button
                                onClick={resetFileFilters}
                                className="rounded-lg px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                            >
                                Reset Filters
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {/* File Type Filter with Search and Tags */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">File Type</label>
                                <div className="relative">
                                    <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
                                        <Search className="h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={fileTypeInput}
                                            onChange={(e) => setFileTypeInput(e.target.value)}
                                            placeholder="Search file types..."
                                            className="flex-1 bg-transparent text-sm outline-none dark:text-white"
                                        />
                                    </div>

                                    {/* Type Suggestions */}
                                    {showTypeSuggestions && suggestedTypes.length > 0 && (
                                        <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            {suggestedTypes.map((type, index) => (
                                                <div
                                                    key={index}
                                                    className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={() => handleTypeSelect(type)}
                                                >
                                                    <span className="capitalize">{type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Type Display */}
                                {fileFilters.type && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <div className="flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                            {fileFilters.type}
                                            <X
                                                className="h-3 w-3 cursor-pointer"
                                                onClick={() => {
                                                    setFileFilters({ ...fileFilters, type: "" });
                                                    setFileTypeInput("");
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                                <input
                                    type="date"
                                    value={fileFilters.dateFrom}
                                    onChange={(e) => setFileFilters({ ...fileFilters, dateFrom: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                                <input
                                    type="date"
                                    value={fileFilters.dateTo}
                                    onChange={(e) => setFileFilters({ ...fileFilters, dateTo: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Folder Content */}
            <div className="mx-auto max-w-7xl px-6 pb-8">
                {filteredFiles.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className={`h-32 w-32 ${colorClasses.bg} mx-auto mb-8 flex items-center justify-center rounded-3xl shadow-lg`}>
                            <Folder className={`h-16 w-16 ${colorClasses.icon}`} />
                        </div>
                        <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">No files found</h3>
                        <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                            {Object.values(fileFilters).some((val) => val) ? "Try adjusting your filters" : "Add some files to get started"}
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
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Files in this folder</h2>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Showing {currentFiles.length} files on this page
                            </p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {currentFiles.map((file, index) => {
                                const fileExtension = file.fileName?.split(".").pop()?.toLowerCase() || "";
                                const fileType = file.category || fileExtension;
                                const colorClasses = getFileTypeColor(fileType.toLowerCase());
                                const IconComponent = getFileIcon(fileType);

                                return (
                                    <div
                                        key={file._id}
                                        className="group cursor-pointer p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                        onClick={(e) => {
                                            // Only trigger view if not clicking on menu
                                            if (!e.target.closest(".file-actions")) {
                                                handleViewPdf(file);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <div
                                                    className={`rounded-2xl p-4 ${colorClasses} shadow-sm transition-transform duration-200 group-hover:scale-110`}
                                                >
                                                    <IconComponent className="h-8 w-8" />
                                                </div>
                                                <div>
                                                    <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                        {file.title || file.fileName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {file.category} • {file.fileSize} bytes
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className="file-actions relative"
                                                ref={menuRef}
                                            >
                                                <button
                                                    className="rounded-xl p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === file._id ? null : file._id);
                                                    }}
                                                >
                                                    <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                </button>

                                                {/* Three-dots dropdown menu */}
                                                {activeMenu === file._id && (
                                                    <div className="absolute right-0 z-10 mt-1 w-48 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                        <button
                                                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleViewPdf(file);
                                                                setActiveMenu(null);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" /> View
                                                        </button>
                                                        <button
                                                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditFile(file._id);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" /> Edit
                                                        </button>
                                                        <button
                                                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteFile(file._id);
                                                            }}
                                                        >
                                                            <Trash className="h-4 w-4" /> Delete
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
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => onPageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                                    >
                                        <ChevronLeft className="h-4 w-4" /> Previous
                                    </button>
                                    <span className="text-sm font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => onPageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
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
                <UploadDocumentsModal
                    isOpen={isUploadModalOpen}
                    onClose={closeUploadModal}
                    folderId={openFolder._id}
                />
            )}
        </div>
    );
};

export default FileList;