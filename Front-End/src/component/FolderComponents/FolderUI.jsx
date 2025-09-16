import React, { useState, useContext, useEffect, useCallback } from "react";
import { Folder, File, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FolderContext } from "../../contexts/FolderContext/FolderContext";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import FoldersView from "./FoldersView";
import CategoryFolder from "./CategoryFolder";
import StatusVerification from "../../ReusableFolder/StatusModal";
import FilesView from "./FilesView";

const FolderCreationUI = () => {
    const {
        AddFolder,
        isFolder: foldersToDisplay,
        deleteFolder,
        updateFolder,
        fetchSpecificData,
        isfolderFiles,
        isLoadingFolders,
        isTags,
        isLoadingFiles,
        setIsLoadingFiles,
        currentPage: fileCurrentPage,
        totalPages: fileTotalPages,
        fetchfolder,
        currentFolderPage: folderCurrentPage,
        totalFolderPages: folderTotalPages,
        setCurrentFolderPage: setFolderCurrentPage,
        fetchSpecifiCategory,
        isCategoryFolder,
        show,
        setShow,
        fetchFilterTags,
    } = useContext(FolderContext);

    const { MOveArchived } = useContext(FilesDisplayContext);
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("grid");
    const [selectedColor, setSelectedColor] = useState("blue");
    const [openFolder, setOpenFolder] = useState(null);
    const [openCategory, setOpenCategory] = useState(null); // Bagong state para sa Category Folder
    const [isOpening, setIsOpening] = useState(false);
    const [openingFolderId, setOpeningFolderId] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [editedFolderName, setEditedFolderName] = useState("");
    const [editedFolderColor, setEditedFolderColor] = useState("");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [fileSearchTerm, setFileSearchTerm] = useState("");
    const [fileTypeInput, setFileTypeInput] = useState("");
    const [suggestedTypes, setSuggestedTypes] = useState([]);
    const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
    const [fileDateFrom, setFileDateFrom] = useState("");
    const [fileDateTo, setFileDateTo] = useState("");
    const [openFileMenu, setOpenFileMenu] = useState(null);
    const navigate = useNavigate();
    const [isVerification, setVerification] = useState(false);
    const [isDeleteID, setIsDeleteId] = useState("");
    const fileTypeOptions = ["ordinance", "image", "video", "audio", "archive", "pdf", "document", "spreadsheet"];
    const [searchTimer, setSearchTimer] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const [isTagsDropdownOpen, setIsTagsDropdownOpen] = useState(false);
    const handleFolderSearch = (value) => {
        setSearchTerm(value);
    };

    const handleFileSearch = (value) => {
        setFileSearchTerm(value);
    };

    useEffect(() => {
        if (fileTypeInput.length > 0) {
            const filtered = fileTypeOptions.filter((type) => type.toLowerCase().includes(fileTypeInput.toLowerCase()));
            setSuggestedTypes(filtered);
            setShowTypeSuggestions(true);
        } else {
            setShowTypeSuggestions(false);
        }
    }, [fileTypeInput]);

    const Success = () => {
        fetchSpecificData();
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchfolder({
                search: searchTerm,
                page: folderCurrentPage,
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, folderCurrentPage]);

    useEffect(() => {
        if (openCategory) {
            // Inayos para gamitin ang openCategory
            const timer = setTimeout(() => {
                fetchSpecificData(openCategory._id, {
                    search: fileSearchTerm,
                    type: fileTypeInput,
                    dateFrom: fileDateFrom,
                    dateTo: fileDateTo,
                });
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [fileSearchTerm, fileTypeInput, fileDateFrom, fileDateTo, openCategory]);

    const handleViewPdf = (file) => {
        const fileId = file._id;
        if (!fileId) return;
        console.log(`Viewing PDF: ${file.fileName}`);
        navigate(`/dashboard/pdf-viewer/${fileId}`, { state: { fileData: file } });
    };

    // Ito ang function para sa Main Folder
    const openFolderWithEffect = (folder) => {
        setIsOpening(true);
        setOpeningFolderId(folder._id);
        setFileSearchTerm("");
        setFileTypeInput("");
        setFileDateFrom("");
        setFileDateTo("");
        fetchSpecifiCategory(folder._id);
        setOpenFolder(folder);
        setTimeout(() => {
            setIsOpening(false);
            setOpeningFolderId(null);
        }, 800);
    };

    // Ito ang function para sa Category Folder
    const openFiles = (folder) => {
        setIsOpening(true);
        setOpeningFolderId(folder._id);
        setFileSearchTerm("");
        setFileTypeInput("");
        setFileDateFrom("");
        setFileDateTo("");
        fetchSpecificData(folder._id, {
            categoryId,
            search: "",
            type: "",
            dateFrom: "",
            dateTo: "",
        });
        setOpenCategory(folder);
        setTimeout(() => {
            setIsOpening(false);
            setOpeningFolderId(null);
        }, 800);
    };

    const closeFolderWithEffect = () => {
        setIsOpening(true);
        setTimeout(() => {
            if (openCategory) {
                // Kung nasa FilesView, bumalik sa CategoryFolder
                setOpenCategory(null);
            } else {
                // Kung nasa CategoryFolder, bumalik sa FoldersView
                setOpenFolder(null);
            }
            setIsOpening(false);
            setFileSearchTerm("");
            setFileTypeInput("");
            setFileDateFrom("");
            setFileDateTo("");
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
            fetchfolder({
                search: searchTerm,
                page: folderCurrentPage,
            });
        }
    };

    const hanndledeleteFolder = async (e, id) => {
        e.stopPropagation();
        await deleteFolder(id);
        fetchfolder({
            search: searchTerm,
            page: folderCurrentPage,
        });
    };

    const handleCloseVerificationModal = () => {
        setVerification(false);
    };

    const handleConfirmDelete = async () => {
        setIsLoadingFiles(true);
        setVerification(false);
        try {
            const result = await MOveArchived(isDeleteID, "Deleted");
            if (result.success) {
                fetchSpecificData();
            }
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsLoadingFiles(false);
            setIsDeleteId("");
        }
    };

    const handleDeleteFiles = async (id) => {
        setIsDeleteId(id);
        setVerification(true);
    };

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
            default:
                return "text-gray-500 bg-gray-50 dark:bg-gray-950";
        }
    };

    const getFileIcon = (type) => {
        switch (type) {
            case "Ordinance":
            case "pdf":
                return FileText;
            default:
                return File;
        }
    };

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
            fetchfolder({
                search: searchTerm,
                page: folderCurrentPage,
            });
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

    const resetFileFilters = () => {
        setFileSearchTerm("");
        setFileTypeInput("");
        setFileDateFrom("");
        setFileDateTo("");
        fetchSpecificData(openCategory._id, {
            search: "",
            type: "",
            dateFrom: "",
            dateTo: "",
            page: 1,
        });
    };

    const resetFolderFilters = () => {
        setSearchTerm("");
        setFolderCurrentPage(1);
    };

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

    if (isLoadingFolders) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="mx-auto flex h-32 w-32 animate-pulse items-center justify-center rounded-3xl border border-gray-300 bg-gray-200 shadow-lg dark:border-gray-600 dark:bg-gray-700">
                            <Folder className="h-16 w-16 animate-bounce text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="absolute -inset-6 animate-ping rounded-full border-4 border-gray-200 opacity-30 dark:border-gray-700"></div>
                        <div className="absolute -inset-3 animate-ping rounded-full border-2 border-gray-300 opacity-20 delay-200 dark:border-gray-600"></div>
                    </div>
                    <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">Loading Folders...</h2>
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
            {openCategory ? ( // Kung may category na na-click, ipakita ang FilesView
                <FilesView
                    openFolder={openCategory}
                    closeFolderWithEffect={closeFolderWithEffect}
                    handleUploadFiles={handleUploadFiles}
                    isfolderFiles={isfolderFiles}
                    isLoadingFiles={isLoadingFiles}
                    fileSearchTerm={fileSearchTerm}
                    handleFileSearch={handleFileSearch}
                    fileDateFrom={fileDateFrom}
                    setFileDateFrom={setFileDateFrom}
                    fileDateTo={fileDateTo}
                    setFileDateTo={setFileDateTo}
                    resetFileFilters={resetFileFilters}
                    fileCurrentPage={fileCurrentPage}
                    fileTotalPages={fileTotalPages}
                    fetchSpecificData={fetchSpecificData}
                    openFileMenu={openFileMenu}
                    setOpenFileMenu={setOpenFileMenu}
                    handleViewPdf={handleViewPdf}
                    handleDeleteFiles={handleDeleteFiles}
                    getColorClasses={getColorClasses}
                    getFileTypeColor={getFileTypeColor}
                    getFileIcon={getFileIcon}
                    show={show}
                    setShow={setShow}
                    isUploadModalOpen={isUploadModalOpen}
                    closeUploadModal={closeUploadModal}
                    isCategoryFolder={isCategoryFolder}
                    Success={Success}
                />
            ) : openFolder ? ( // Kung may main folder na na-click, ipakita ang CategoryFolder
                <CategoryFolder
                isTagsDropdownOpen={isTagsDropdownOpen}
                setIsTagsDropdownOpen={setIsTagsDropdownOpen}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                    fetchFilterTags={fetchFilterTags}
                    isTags={isTags}
                    openFolder={openFolder}
                    closeFolderWithEffect={closeFolderWithEffect}
                    handleUploadFiles={handleUploadFiles}
                    isfolderFiles={isfolderFiles}
                    isLoadingFiles={isLoadingFiles}
                    fileSearchTerm={fileSearchTerm}
                    handleFileSearch={handleFileSearch}
                    fileDateFrom={fileDateFrom}
                    setFileDateFrom={setFileDateFrom}
                    fileDateTo={fileDateTo}
                    setFileDateTo={setFileDateTo}
                    resetFileFilters={resetFileFilters}
                    fileCurrentPage={fileCurrentPage}
                    fileTotalPages={fileTotalPages}
                    fetchSpecificData={fetchSpecificData}
                    openFileMenu={openFileMenu}
                    setOpenFileMenu={setOpenFileMenu}
                    handleViewPdf={handleViewPdf}
                    handleDeleteFiles={handleDeleteFiles}
                    getColorClasses={getColorClasses}
                    getFileTypeColor={getFileTypeColor}
                    getFileIcon={getFileIcon}
                    setFileSearchTerm={setFileSearchTerm}
                    isUploadModalOpen={isUploadModalOpen}
                    closeUploadModal={closeUploadModal}
                    isCategoryFolder={isCategoryFolder}
                    Success={Success}
                    openFiles={openFiles}
                    show={show}
                    setShow={setShow}
                />
            ) : (
                // Kung walang folder na bukas, ipakita ang FoldersView
                <FoldersView
                    foldersToDisplay={foldersToDisplay}
                    searchTerm={searchTerm}
                    handleFolderSearch={handleFolderSearch}
                    resetFolderFilters={resetFolderFilters}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isCreating={isCreating}
                    setIsCreating={setIsCreating}
                    newFolderName={newFolderName}
                    setNewFolderName={setNewFolderName}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    openFolderWithEffect={openFolderWithEffect}
                    openFiles={openFiles}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    editedFolderName={editedFolderName}
                    setEditedFolderName={setEditedFolderName}
                    editedFolderColor={editedFolderColor}
                    setEditedFolderColor={setEditedFolderColor}
                    handleEditClick={handleEditClick}
                    saveEdit={saveEdit}
                    cancelEdit={cancelEdit}
                    hanndledeleteFolder={hanndledeleteFolder}
                    folderCurrentPage={folderCurrentPage}
                    folderTotalPages={folderTotalPages}
                    setFolderCurrentPage={setFolderCurrentPage}
                    colors={colors}
                    getColorClasses={getColorClasses}
                    handleKeyPress={handleKeyPress}
                    createFolder={createFolder}
                />
            )}

            <StatusVerification
                isOpen={isVerification}
                onConfirmDelete={handleConfirmDelete}
                onClose={handleCloseVerificationModal}
            />
        </div>
    );
};

export default FolderCreationUI;
