import React, { useState, useContext, useEffect } from "react";
import {
    Folder,
    FolderPlus,
    Trash2,
    X,
    Check,
    Search,
    Grid,
    List,
    Calendar,
    ArrowLeft,
    File,
    Image,
    FileText,
    Video,
    Music,
    Archive,
    MoreVertical,
    Upload,
    Edit,
    Filter,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FolderContext } from "../../contexts/FolderContext/FolderContext";
import UploadDocumentsModal from "./FormUpload/UploadDocuments";

const FolderCreationUI = () => {
    const { 
        AddFolder, 
        isFolder, 
        deleteFolder, 
        updateFolder, 
        fetchSpecificData, 
        isfolderFiles,
        isLoadingFolders, 
        isLoadingFiles     
    } = useContext(FolderContext);
    
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [selectedColor, setSelectedColor] = useState("blue");
    const [openFolder, setOpenFolder] = useState(null);
    const [isOpening, setIsOpening] = useState(false);
    const [openingFolderId, setOpeningFolderId] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [editedFolderName, setEditedFolderName] = useState("");
    const [editedFolderColor, setEditedFolderColor] = useState("");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
        const navigate = useNavigate();
    // Advanced filter states for folders
    const [showFolderFilters, setShowFolderFilters] = useState(false);
    const [folderFilters, setFolderFilters] = useState({
        color: "",
        dateFrom: "",
        dateTo: ""
    });
    
    // Advanced filter states for files
    const [showFileFilters, setShowFileFilters] = useState(false);
    const [fileFilters, setFileFilters] = useState({
        type: "",
        dateFrom: "",
        dateTo: ""
    });
    
    // Pagination states for folders
    const [currentFolderPage, setCurrentFolderPage] = useState(1);
    const [foldersPerPage] = useState(8);
    
    // Pagination states for files
    const [currentFilePage, setCurrentFilePage] = useState(1);
    const [filesPerPage] = useState(5);

    // New states for file type search
    const [fileTypeInput, setFileTypeInput] = useState('');
    const [suggestedTypes, setSuggestedTypes] = useState([]);
    const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
    const fileTypeOptions = ['ordinance', 'image', 'video', 'audio', 'archive'];

    const foldersToDisplay = isFolder && Array.isArray(isFolder) ? isFolder : [];



    // Handle file type suggestions
    useEffect(() => {
        if (fileTypeInput.length > 0) {
            const filtered = fileTypeOptions.filter(type => 
                type.toLowerCase().includes(fileTypeInput.toLowerCase())
            );
            setSuggestedTypes(filtered);
            setShowTypeSuggestions(true);
        } else {
            setShowTypeSuggestions(false);
        }
    }, [fileTypeInput]);

    const handleTypeSelect = (type) => {
        setFileFilters({...fileFilters, type});
        setFileTypeInput('');
        setShowTypeSuggestions(false);
    };

    const handleViewPdf=(file)=>{
        const fileId=file._id;
       if (!fileId) return;
        navigate(`/dashboard/pdf-viewer/${fileId}`, { state: { fileData: file } });
    }

    const colors = [
        {
            name: "blue",
            bg: "bg-blue-50 dark:bg-blue-950",
            accent: "bg-blue-500",
            border: "border-blue-200 dark:border-blue-700",
            icon: "text-blue-600 dark:text-blue-400",
            hover: "hover:bg-blue-100 dark:hover:bg-blue-900",
        },
        {
            name: "green",
            bg: "bg-green-50 dark:bg-green-950",
            accent: "bg-green-500",
            border: "border-green-200 dark:border-green-700",
            icon: "text-green-600 dark:text-green-400",
            hover: "hover:bg-green-100 dark:hover:bg-green-900",
        },
        {
            name: "purple",
            bg: "bg-purple-50 dark:bg-purple-950",
            accent: "bg-purple-500",
            border: "border-purple-200 dark:border-purple-700",
            icon: "text-purple-600 dark:text-purple-400",
            hover: "hover:bg-purple-100 dark:hover:bg-purple-900",
        },
        {
            name: "orange",
            bg: "bg-orange-50 dark:bg-orange-950",
            accent: "bg-orange-500",
            border: "border-orange-200 dark:border-orange-700",
            icon: "text-orange-600 dark:text-orange-400",
            hover: "hover:bg-orange-100 dark:hover:bg-orange-900",
        },
        {
            name: "pink",
            bg: "bg-pink-50 dark:bg-pink-950",
            accent: "bg-pink-500",
            border: "border-pink-200 dark:border-pink-700",
            icon: "text-pink-600 dark:text-pink-400",
            hover: "hover:bg-pink-100 dark:hover:bg-pink-900",
        },
        {
            name: "indigo",
            bg: "bg-indigo-50 dark:bg-indigo-950",
            accent: "bg-indigo-500",
            border: "border-indigo-200 dark:border-indigo-700",
            icon: "text-indigo-600 dark:text-indigo-400",
            hover: "hover:bg-indigo-100 dark:hover:bg-indigo-900",
        },
    ];

    const getColorClasses = (colorName) => {
        return colors.find((c) => c.name === colorName) || colors[0];
    };

    const getFileTypeColor = (type) => {
        switch (type) {
            case "ordinance":
            case "pdf":
                return "text-red-500 bg-red-50 dark:bg-red-950";
            case "image":
            case "jpg":
            case "png":
            case "jpeg":
                return "text-green-500 bg-green-50 dark:bg-green-950";
            case "video":
                return "text-purple-500 bg-purple-50 dark:bg-purple-950";
            case "audio":
                return "text-orange-500 bg-orange-50 dark:bg-orange-950";
            case "archive":
            case "zip":
            case "rar":
                return "text-gray-500 bg-gray-50 dark:bg-gray-950";
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

    const openFolderWithEffect = (folder) => {
        setIsOpening(true);
        setOpeningFolderId(folder._id);
        fetchSpecificData(folder._id);
        setOpenFolder(folder);
        setTimeout(() => {
            setIsOpening(false);
            setOpeningFolderId(null);
        }, 800);
    };

    const closeFolderWithEffect = () => {
        setIsOpening(true);
        setTimeout(() => {
            setOpenFolder(null);
            setIsOpening(false);
            // Reset file filters when closing folder
            setFileFilters({
                type: "",
                dateFrom: "",
                dateTo: ""
            });
            setCurrentFilePage(1);
        }, 300);
    };

    const createFolder = async () => {
        if (newFolderName.trim()) {
            const newFolder = {
                name: newFolderName.trim(),
                color: selectedColor,
            };
            await AddFolder(newFolder);
            setNewFolderName("");
            setIsCreating(false);
            setSelectedColor("blue");
            setCurrentFolderPage(1);
        }
    };

    const hanndledeleteFolder = async (e, id) => {
        e.stopPropagation();
        await deleteFolder(id);
        // Reset to first page if deleting last item on page
        if (filteredFolders.length <= 1) {
            setCurrentFolderPage(1);
        }
    };

    // Filter folders with advanced filters
    const filteredFolders = foldersToDisplay.filter((folder) => {
        // Basic search filter
        if (searchTerm && !folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        
        // Color filter
        if (folderFilters.color && folder.color !== folderFilters.color) {
            return false;
        }
        
        // Date range filter
        const folderDate = new Date(folder.created_at);
        if (folderFilters.dateFrom && new Date(folderFilters.dateFrom) > folderDate) {
            return false;
        }
        if (folderFilters.dateTo && new Date(folderFilters.dateTo) < folderDate) {
            return false;
        }
        
        return true;
    });

    // Pagination for folders
    const indexOfLastFolder = currentFolderPage * foldersPerPage;
    const indexOfFirstFolder = indexOfLastFolder - foldersPerPage;
    const currentFolders = filteredFolders.slice(indexOfFirstFolder, indexOfLastFolder);
    const totalFolderPages = Math.ceil(filteredFolders.length / foldersPerPage);

    // Filter files with advanced filters
    const filterFiles = (files) => {
        if (!files || !Array.isArray(files)) return [];
        
        return files.filter(file => {
            // Type filter
            if (fileFilters.type && file.category.toLowerCase() !== fileFilters.type.toLowerCase()) {
                return false;
            }
            
            // Date range filter
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
    
    // Pagination for files
    const indexOfLastFile = currentFilePage * filesPerPage;
    const indexOfFirstFile = indexOfLastFile - filesPerPage;
    const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
    const totalFilePages = Math.ceil(filteredFiles.length / filesPerPage);

    const handleKeyPress = (e, action) => {
        if (e.key === "Enter") {
            action();
        } else if (e.key === "Escape") {
            if (action === createFolder) {
                setIsCreating(false);
                setNewFolderName("");
            } else if (action === saveEdit) {
                cancelEdit();
            }
        }
    };

    const handleEditClick = (e, folder) => {
        e.stopPropagation();
        setIsEditing(folder._id);
        setEditedFolderName(folder.folderName);
        setEditedFolderColor(folder.color);
    };

    const saveEdit = async (e, folderId) => {
        e.stopPropagation();
        if (editedFolderName.trim()) {
            const updatedData = {
                _id: folderId,
                folderName: editedFolderName.trim(),
                color: editedFolderColor,
            };

            await updateFolder(updatedData);

            setIsEditing(null);
            setEditedFolderName("");
            setEditedFolderColor("");
        }
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setEditedFolderName("");
        setEditedFolderColor("");
    };

    const handleUploadFiles = () => {
        setIsUploadModalOpen(true);
    };

    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
    };

    // Reset folder filters
    const resetFolderFilters = () => {
        setFolderFilters({
            color: "",
            dateFrom: "",
            dateTo: ""
        });
        setCurrentFolderPage(1);
    };

    // Reset file filters
    const resetFileFilters = () => {
        setFileFilters({
            type: "",
            dateFrom: "",
            dateTo: ""
        });
        setCurrentFilePage(1);
    };

    // Loading screen when opening folder
    if (isOpening && openingFolderId) {
        const folder = foldersToDisplay.find((f) => f._id === openingFolderId);
        const colorClasses = getColorClasses(folder?.color);
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div
                            className={`h-32 w-32 ${colorClasses.bg} mx-auto flex animate-pulse items-center justify-center rounded-3xl border shadow-lg ${colorClasses.border}`}
                        >
                            <Folder className={`h-16 w-16 ${colorClasses.icon} animate-bounce`} />
                        </div>
                        <div className="absolute -inset-6 animate-ping rounded-full border-4 border-blue-200 opacity-30 dark:border-blue-700"></div>
                        <div className="absolute -inset-3 animate-ping rounded-full border-2 border-blue-300 opacity-20 delay-200 dark:border-blue-600"></div>
                    </div>
                    <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">Opening {folder?.folderName}...</h2>
                    <div className="mb-8 flex items-center justify-center gap-2">
                        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
                        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 delay-150"></div>
                        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 delay-300"></div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Loading folder contents...</div>
                </div>
            </div>
        );
    }

    // Loading state kapag wala pang folders
    if (isLoadingFolders) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="h-32 w-32 bg-gray-200 dark:bg-gray-700 mx-auto flex animate-pulse items-center justify-center rounded-3xl border border-gray-300 dark:border-gray-600 shadow-lg">
                            <Folder className="h-16 w-16 text-gray-400 dark:text-gray-500 animate-bounce" />
                        </div>
                        <div className="absolute -inset-6 animate-ping rounded-full border-4 border-gray-200 opacity-30 dark:border-gray-700"></div>
                        <div className="absolute -inset-3 animate-ping rounded-full border-2 border-gray-300 opacity-20 delay-200 dark:border-gray-600"></div>
                    </div>
                    <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text白色">Loading Folders...</h2>
                    <div className="mb-8 flex items-center justify-center gap-2">
                        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></div>
                        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 delay-150"></div>
                        <div className="h-3 w-3 animate-bounce rounded-full bg-blue-500 delay-300"></div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Fetching your folders</div>
                </div>
            </div>
        );
    }

    if (openFolder) {
        const colorClasses = getColorClasses(openFolder.color);
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
                                        <div key={index} className="p-6">
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
                            {showFileFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentFilePage} of {totalFilePages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentFilePage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentFilePage === 1}
                                    className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentFilePage(prev => Math.min(prev + 1, totalFilePages))}
                                    disabled={currentFilePage === totalFilePages || totalFilePages === 0}
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
                                                        setFileFilters({...fileFilters, type: ''});
                                                        setFileTypeInput('');
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Date filters remain unchanged */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                                    <input
                                        type="date"
                                        value={fileFilters.dateFrom}
                                        onChange={(e) => setFileFilters({...fileFilters, dateFrom: e.target.value})}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                                    <input
                                        type="date"
                                        value={fileFilters.dateTo}
                                        onChange={(e) => setFileFilters({...fileFilters, dateTo: e.target.value})}
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
                                {Object.values(fileFilters).some(val => val) 
                                    ? "Try adjusting your filters" 
                                    : "Add some files to get started"}
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
                                    Showing {currentFiles.length} of {filteredFiles.length} files
                                </p>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {currentFiles.map((file, index) => {
                                    const fileExtension = file.fileName?.split('.').pop()?.toLowerCase() || "";
                                    const fileType = file.category || fileExtension;
                                    const colorClasses = getFileTypeColor(fileType.toLowerCase());
                                    const IconComponent = getFileIcon(fileType);
                                    
                                    return (
                                        <div
                                            key={file._id}
                                            className="group cursor-pointer p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700"
                                            style={{ animationDelay: `${index * 100}ms` }}
                                             onClick={() => handleViewPdf(file)}
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
                                                <div className="translate-x-4 transform opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
                                                    <button className="rounded-xl p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
                                                        <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Pagination for files */}
                            {totalFilePages > 1 && (
                                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {indexOfFirstFile + 1} to {Math.min(indexOfLastFile, filteredFiles.length)} of {filteredFiles.length} files
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setCurrentFilePage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentFilePage === 1}
                                            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                                        >
                                            <ChevronLeft className="h-4 w-4" /> Previous
                                        </button>
                                        <span className="text-sm font-medium">
                                            Page {currentFilePage} of {totalFilePages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentFilePage(prev => Math.min(prev + 1, totalFilePages))}
                                            disabled={currentFilePage === totalFilePages}
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
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Old Files Management</h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Create and organize your folders efficiently</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search folders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-72 rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            
                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFolderFilters(!showFolderFilters)}
                                className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                <Filter className="h-5 w-5" />
                                {showFolderFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                            
                            {/* View Toggle */}
                            <div className="flex rounded-xl bg-gray-100 p-1 shadow-inner dark:bg-gray-700">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`rounded-lg p-3 transition-all duration-200 ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400" : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"}`}
                                >
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`rounded-lg p-3 transition-all duration-200 ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm dark:bg-gray-600 dark:text-blue-400" : "text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600"}`}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                            
                            {/* Create Button */}
                            <button
                                onClick={() => setIsCreating(true)}
                                className="flex transform items-center gap-3 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
                            >
                                <FolderPlus className="h-5 w-5" />
                                New Folder
                            </button>
                        </div>
                    </div>
                    
                    {/* Advanced Folder Filters */}
                    {showFolderFilters && (
                        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Advanced Folder Filters</h3>
                                <button
                                    onClick={resetFolderFilters}
                                    className="rounded-lg px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
                                >
                                    Reset Filters
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Folder Color</label>
                                    <select
                                        value={folderFilters.color}
                                        onChange={(e) => setFolderFilters({...folderFilters, color: e.target.value})}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">All Colors</option>
                                        {colors.map(color => (
                                            <option key={color.name} value={color.name}>
                                                {color.name.charAt(0).toUpperCase() + color.name.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                                    <input
                                        type="date"
                                        value={folderFilters.dateFrom}
                                        onChange={(e) => setFolderFilters({...folderFilters, dateFrom: e.target.value})}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                                    <input
                                        type="date"
                                        value={folderFilters.dateTo}
                                        onChange={(e) => setFolderFilters({...folderFilters, dateTo: e.target.value})}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create Folder Modal */}
                {isCreating && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-gray-800">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Folder</h2>
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewFolderName("");
                                        setSelectedColor("blue");
                                    }}
                                    className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Folder Name</label>
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyPress={(e) => handleKeyPress(e, createFolder)}
                                        placeholder="Enter folder name..."
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Choose Color</label>
                                    <div className="flex gap-3">
                                        {colors.map((color) => {
                                            const colorClasses = getColorClasses(color.name);
                                            return (
                                                <button
                                                    key={color.name}
                                                    onClick={() => setSelectedColor(color.name)}
                                                    className={`h-12 w-12 rounded-2xl ${colorClasses.accent} shadow-md transition-all duration-200 hover:scale-110 ${
                                                        selectedColor === color.name ? "ring-4 ring-gray-400 ring-offset-2 dark:ring-gray-300" : ""
                                                    }`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => {
                                        setIsCreating(false);
                                        setNewFolderName("");
                                        setSelectedColor("blue");
                                    }}
                                    className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createFolder}
                                    disabled={!newFolderName.trim()}
                                    className="flex-1 transform rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Folders Grid/List */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    {filteredFolders.length === 0 ? (
                        <div className="py-16 text-center">
                            <Folder className="mx-auto mb-6 h-20 w-20 text-gray-300 dark:text-gray-600" />
                            <h3 className="mb-3 text-xl font-medium text-gray-900 dark:text-white">
                                {searchTerm || Object.values(folderFilters).some(val => val) ? "No folders found" : "No folders yet"}
                            </h3>
                            <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
                                {searchTerm || Object.values(folderFilters).some(val => val) 
                                    ? "Try adjusting your search or filter terms" 
                                    : "Create your first folder to get started"}
                            </p>
                            {!searchTerm && !Object.values(folderFilters).some(val => val) && (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="mx-auto flex transform items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
                                >
                                    <FolderPlus className="h-6 w-6" />
                                    Create Folder
                                </button>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {filteredFolders.length} {filteredFolders.length === 1 ? "Folder" : "Folders"}
                                </h2>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                    {searchTerm && (
                                        <span className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                            Search: "{searchTerm}"
                                        </span>
                                    )}
                                    
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Page {currentFolderPage} of {totalFolderPages}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentFolderPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentFolderPage === 1}
                                                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentFolderPage(prev => Math.min(prev + 1, totalFolderPages))}
                                                disabled={currentFolderPage === totalFolderPages || totalFolderPages === 0}
                                                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {viewMode === "grid" ? (
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {currentFolders.map((folder, index) => {
                                        const colorClasses = getColorClasses(folder.color);
                                        return (
                                            <div
                                                key={folder._id}
                                                className="group relative transform cursor-pointer transition-all duration-200 hover:scale-105"
                                                onClick={() => openFolderWithEffect(folder)}
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                {/* Edit mode vs Normal mode */}
                                                {isEditing === folder._id ? (
                                                    <div
                                                        className={`relative rounded-2xl p-6 ${colorClasses.bg} ${colorClasses.border} border-2 shadow-lg transition-shadow duration-200`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Edit Folder</h3>
                                                        <input
                                                            type="text"
                                                            value={editedFolderName}
                                                            onChange={(e) => setEditedFolderName(e.target.value)}
                                                            onKeyPress={(e) => handleKeyPress(e, (event) => saveEdit(event, folder._id))}
                                                            className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                            autoFocus
                                                        />
                                                        <div className="mt-4 flex gap-3">
                                                            {colors.map((color) => (
                                                                <button
                                                                    key={color.name}
                                                                    onClick={() => setEditedFolderColor(color.name)}
                                                                    className={`h-8 w-8 rounded-full ${color.accent} transition-all duration-200 hover:scale-110 ${
                                                                        editedFolderColor === color.name ? "ring-2 ring-gray-400 ring-offset-2" : ""
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div className="mt-6 flex gap-2">
                                                            <button
                                                                onClick={(e) => cancelEdit(e)}
                                                                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={(e) => saveEdit(e, folder._id)}
                                                                disabled={!editedFolderName.trim()}
                                                                className="flex-1 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`flex h-48 flex-col justify-between rounded-2xl border-2 p-6 transition-all duration-200 ${colorClasses.bg} ${colorClasses.border} shadow-lg group-hover:shadow-xl`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div
                                                                className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${colorClasses.accent}`}
                                                            >
                                                                <Folder className={`h-6 w-6 text-white`} />
                                                            </div>
                                                            <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={(e) => handleEditClick(e, folder)}
                                                                        className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                                                    >
                                                                        <Edit className="h-5 w-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => hanndledeleteFolder(e, folder._id)}
                                                                        className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-gray-700"
                                                                    >
                                                                        <Trash2 className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="mb-1 text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                                {folder.folderName}
                                                            </h3>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {currentFolders.map((folder, index) => {
                                        const colorClasses = getColorClasses(folder.color);
                                        return (
                                            <div
                                                key={folder._id}
                                                className={`group relative flex cursor-pointer items-center justify-between p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700`}
                                                onClick={() => openFolderWithEffect(folder)}
                                                style={{ animationDelay: `${index * 100}ms` }}
                                            >
                                                {isEditing === folder._id ? (
                                                    <div
                                                        className="flex w-full items-center gap-4"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colorClasses.accent}`}>
                                                            <Folder className={`h-6 w-6 text-white`} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={editedFolderName}
                                                                onChange={(e) => setEditedFolderName(e.target.value)}
                                                                onKeyPress={(e) => handleKeyPress(e, (event) => saveEdit(event, folder._id))}
                                                                className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => saveEdit(e, folder._id)}
                                                                disabled={!editedFolderName.trim()}
                                                                className="rounded-xl p-2 text-green-500 transition-colors hover:bg-green-100 disabled:opacity-50 dark:hover:bg-gray-700"
                                                            >
                                                                <Check className="h-5 w-5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => cancelEdit(e)}
                                                                className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-gray-700"
                                                            >
                                                                <X className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex w-full items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${colorClasses.accent}`}>
                                                                <Folder className={`h-6 w-6 text-white`} />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
                                                                    {folder.folderName}
                                                                </h3>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>{new Date(folder.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={(e) => handleEditClick(e, folder)}
                                                                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                                                >
                                                                    <Edit className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => hanndledeleteFolder(e, folder._id)}
                                                                    className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-100 dark:hover:bg-gray-700"
                                                                >
                                                                    <Trash2 className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            
                            {/* Pagination for folders */}
                            {totalFolderPages > 1 && (
                                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {indexOfFirstFolder + 1} to {Math.min(indexOfLastFolder, filteredFolders.length)} of {filteredFolders.length} folders
                                    </span>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setCurrentFolderPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentFolderPage === 1}
                                            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
                                        >
                                            <ChevronLeft className="h-4 w-4" /> Previous
                                        </button>
                                        <span className="text-sm font-medium">
                                            Page {currentFolderPage} of {totalFolderPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentFolderPage(prev => Math.min(prev + 1, totalFolderPages))}
                                            disabled={currentFolderPage === totalFolderPages}
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
            </div>
        </div>
    );
};

export default FolderCreationUI;