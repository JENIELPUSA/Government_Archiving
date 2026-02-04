import React, { useState, useRef, useContext, useEffect } from "react";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { AuthContext } from "../../../contexts/AuthContext";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import { FiUploadCloud, FiFileText, FiBook, FiTag, FiCalendar, FiX, FiCheckSquare, FiPlus, FiHash, FiChevronDown } from "react-icons/fi";
import PdfPreviewModal from "./PDFReview";
import AuthorModal from "./AuthorComponents";
import { FolderContext } from "../../../contexts/FolderContext/FolderContext";

const UploadDocumentModal = ({ isOpen, onClose, folderId, isSuccess }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const { isDropdown, AddSbData } = useContext(SbMemberDisplayContext);
    const { AddFiles } = useContext(FilesDisplayContext);
    const { linkId } = useContext(AuthContext);
    const { isCategory } = useContext(CategoryContext);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [summary, setSummary] = useState("");
    const [dateOfResolution, setDateOfResolution] = useState("");
    const [fileError, setFileError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [isFormLoading, setFormLoading] = useState(true);
    const [resolutionNumber, setResolutionNumber] = useState("");
    const [resolutionNumberError, setResolutionNumberError] = useState("");
    const [checkboxError, setCheckboxError] = useState("");
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const { fetchSpecificData, fetchSpecifiCategory } = useContext(FolderContext);

    // ARRAY STRUCTURE - Changed from single values to arrays
    const [chairpersons, setChairpersons] = useState([]); // Array para sa chairpersons
    const [viceChairpersons, setViceChairpersons] = useState([]); // Array para sa vice chairpersons
    const [members, setMembers] = useState([]); // Array para sa regular members

    const [chairpersonError, setChairpersonError] = useState("");
    const [viceChairpersonError, setViceChairpersonError] = useState("");
    const [membersError, setMembersError] = useState("");

    const [isChairpersonDropdownOpen, setIsChairpersonDropdownOpen] = useState(false);
    const [isViceChairpersonDropdownOpen, setIsViceChairpersonDropdownOpen] = useState(false);
    const [isMembersDropdownOpen, setIsMembersDropdownOpen] = useState(false);

    const chairpersonDropdownRef = useRef(null);
    const viceChairpersonDropdownRef = useRef(null);
    const membersDropdownRef = useRef(null);

    const [includeChairperson, setIncludeChairperson] = useState(false);
    const [includeViceChairperson, setIncludeViceChairperson] = useState(false);
    const [includeMembers, setIncludeMembers] = useState(false);

    const [showChairpersonModal, setShowChairpersonModal] = useState(false);
    const [showViceChairpersonModal, setShowViceChairpersonModal] = useState(false);

    const [customChairperson, setCustomChairperson] = useState("");
    const [customViceChairperson, setCustomViceChairperson] = useState("");

    const [currentModalType, setCurrentModalType] = useState("");
    const [currentFormData, setCurrentFormData] = useState({
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        position: "",
    });

    const ALLOWED_FILE_TYPES = ["application/pdf"];

    useEffect(() => {
        const timer = setTimeout(() => {
            setFormLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chairpersonDropdownRef.current && !chairpersonDropdownRef.current.contains(event.target)) {
                setIsChairpersonDropdownOpen(false);
            }
            if (viceChairpersonDropdownRef.current && !viceChairpersonDropdownRef.current.contains(event.target)) {
                setIsViceChairpersonDropdownOpen(false);
            }
            if (membersDropdownRef.current && !membersDropdownRef.current.contains(event.target)) {
                setIsMembersDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        return () => {
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
            }
        };
    }, [pdfPreviewUrl]);

    const selectedCategory = isCategory?.find((cat) => cat._id === category);
    const isResolution = selectedCategory?.category === "Resolution";
    const isOrdinance = selectedCategory?.category === "Ordinance";

    useEffect(() => {
        if (!(isResolution || isOrdinance)) {
            setIncludeChairperson(false);
            setIncludeViceChairperson(false);
            setIncludeMembers(false);
            setChairpersons([]);
            setViceChairpersons([]);
            setMembers([]);
            setCustomChairperson("");
            setCustomViceChairperson("");
            setChairpersonError("");
            setViceChairpersonError("");
            setMembersError("");
        }
    }, [category, isOrdinance, isResolution]);

    useEffect(() => {
        setCheckboxError("");
    }, [category]);

    const handleCheckboxChange = (checkboxType) => {
        switch (checkboxType) {
            case "chairperson":
                setIncludeChairperson(!includeChairperson);
                if (!includeChairperson) {
                    setChairpersons([]);
                    setCustomChairperson("");
                    setChairpersonError("");
                }
                break;
            case "viceChairperson":
                setIncludeViceChairperson(!includeViceChairperson);
                if (!includeViceChairperson) {
                    setViceChairpersons([]);
                    setCustomViceChairperson("");
                    setViceChairpersonError("");
                }
                break;
            case "members":
                setIncludeMembers(!includeMembers);
                if (!includeMembers) {
                    setMembers([]);
                    setMembersError("");
                }
                break;
            default:
                break;
        }
    };

    const handleFile = (file) => {
        setFileError("");
        if (!file) {
            setFileError("Please select a document to upload.");
            setSelectedFile(null);
            return;
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setFileError("Invalid file type. Only PDF documents are allowed.");
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
        setUploadMessage("");
    };

    const handleCloseAuthorModal = () => {
        setShowChairpersonModal(false);
        setShowViceChairpersonModal(false);
        setCurrentFormData({
            firstName: "",
            lastName: "",
            middleName: "",
            email: "",
            position: "",
        });
    };

    const openModalForType = (type) => {
        setCurrentModalType(type);
        setCurrentFormData({
            firstName: "",
            lastName: "",
            middleName: "",
            email: "",
            position: "",
        });

        switch (type) {
            case "chairperson":
                setShowChairpersonModal(true);
                break;
            case "viceChairperson":
                setShowViceChairpersonModal(true);
                break;
            default:
                break;
        }
    };

    const handleFileChange = (e) => handleFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length > 1) {
            setFileError("Only one file allowed.");
            setSelectedFile(null);
        } else {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setFileError("");
        setTitleError("");
        setResolutionNumberError("");
        setCheckboxError("");
        setUploadMessage("");
        setChairpersonError("");
        setViceChairpersonError("");
        setMembersError("");

        let valid = true;
        if (!selectedFile) {
            setFileError("Please select a file.");
            valid = false;
        }
        if (!title.trim()) {
            setTitleError("Title is required.");
            valid = false;
        }

        if (isResolution && !resolutionNumber.trim()) {
            setResolutionNumberError("Resolution number is required");
            valid = false;
        }

        // Updated validation for arrays
        if (includeChairperson && chairpersons.length === 0 && !customChairperson) {
            setChairpersonError("Please select or add at least one chairperson.");
            valid = false;
        }

        if (includeViceChairperson && viceChairpersons.length === 0 && !customViceChairperson) {
            setViceChairpersonError("Please select or add at least one vice chairperson.");
            valid = false;
        }

        if (includeMembers && members.length === 0) {
            setMembersError("Please select at least one committee member.");
            valid = false;
        }

        if (!valid) return;

        setIsPdfLoading(true);
        try {
            const url = URL.createObjectURL(selectedFile);
            setPdfPreviewUrl(url);
            setShowPdfModal(true);
        } catch (error) {
            console.error("Error creating PDF preview:", error);
            setUploadMessage("Failed to generate preview. Please try again.");
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        setShowPdfModal(false);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", title);
        formData.append("category", category);
        formData.append("summary", summary);
        formData.append("admin", linkId);
        formData.append("folderID", folderId);
        formData.append("oldFile", true);
        formData.append("dateOfResolution", dateOfResolution);

        if (isResolution) {
            formData.append("resolutionNumber", resolutionNumber);
        }

        // Send arrays instead of single values
        if (includeChairperson && chairpersons.length > 0) {
            formData.append("chairpersons", JSON.stringify(chairpersons));
        } else if (includeChairperson && customChairperson) {
            // If custom, send as array with custom object
            const customChairpersonObj = {
                id: "custom",
                full_name: customChairperson,
                custom: true,
            };
            formData.append("chairpersons", JSON.stringify([customChairpersonObj]));
        }

        if (includeViceChairperson && viceChairpersons.length > 0) {
            formData.append("viceChairpersons", JSON.stringify(viceChairpersons));
        } else if (includeViceChairperson && customViceChairperson) {
            // If custom, send as array with custom object
            const customViceChairpersonObj = {
                id: "custom",
                full_name: customViceChairperson,
                custom: true,
            };
            formData.append("viceChairpersons", JSON.stringify([customViceChairpersonObj]));
        }

        if (includeMembers && members.length > 0) {
            formData.append("members", JSON.stringify(members));
        }

        if (isResolution) {
            console.log("Resolution Number:", resolutionNumber);
        }

        if (includeChairperson) {
            console.log("Chairpersons:", chairpersons);
            if (customChairperson) console.log("Custom Chairperson:", customChairperson);
        }

        if (includeViceChairperson) {
            console.log("Vice Chairpersons:", viceChairpersons);
            if (customViceChairperson) console.log("Custom Vice Chairperson:", customViceChairperson);
        }

        if (includeMembers) {
            console.log("Members:", members);
        }

        // Log FormData content
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            setLoading(true);
            setUploadMessage(`Uploading "${selectedFile.name}"...`);

            const result = await AddFiles(formData);
            if (result.success) {
                fetchSpecifiCategory(result.data.folderID, {});
                fetchSpecificData(result.data.folderID, { categoryId: result.data.category });
                setUploadMessage("File uploaded successfully.");
                isSuccess();
                setSelectedFile(null);
                setTitle("");
                setCategory("");
                setSummary("");
                setDateOfResolution("");
                setResolutionNumber("");
                setIncludeChairperson(false);
                setIncludeViceChairperson(false);
                setIncludeMembers(false);
                setChairpersons([]);
                setViceChairpersons([]);
                setMembers([]);
                setCustomChairperson("");
                setCustomViceChairperson("");
                setModalStatus("success");
                setShowModal(true);
                onClose();
            }
        } catch (err) {
            console.error("Upload error:", err);
            setUploadMessage("Upload failed. Try again.");
        } finally {
            setLoading(false);
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
                setPdfPreviewUrl("");
            }
        }
    };

    const handleAddNewPerson = async () => {
        const { firstName, lastName, middleName, email, position } = currentFormData;

        if (!firstName.trim() || !lastName.trim()) {
            return;
        }

        let displayName = `${firstName} ${lastName}`;
        if (middleName.trim()) {
            displayName = `${firstName} ${middleName} ${lastName}`;
        }

        if (position.trim()) {
            displayName += ` - ${position.trim()}`;
        }

        if (email.trim()) {
            displayName += ` | ${email.trim()}`;
        }

        const personData = {
            full_name: displayName,
            first_name: firstName,
            last_name: lastName,
            middle_name: middleName,
            email: email,
            Position: position,
        };

        console.log("=== ADDING NEW PERSON ===");
        console.log("Person Data:", personData);
        console.log("Modal Type:", currentModalType);

        const result = await AddSbData(personData);

        switch (currentModalType) {
            case "chairperson":
                if (result && result._id) {
                    // Add to chairpersons array
                    setChairpersons((prev) => [...prev, result._id]);
                } else {
                    // If no ID returned, use custom
                    setCustomChairperson(displayName);
                }
                setChairpersonError("");
                break;
            case "viceChairperson":
                if (result && result._id) {
                    // Add to vice chairpersons array
                    setViceChairpersons((prev) => [...prev, result._id]);
                } else {
                    // If no ID returned, use custom
                    setCustomViceChairperson(displayName);
                }
                setViceChairpersonError("");
                break;
            default:
                break;
        }

        setCurrentFormData({
            firstName: "",
            lastName: "",
            middleName: "",
            email: "",
            position: "",
        });

        handleCloseAuthorModal();
    };

    // Functions to handle array operations for chairpersons
    const handleChairpersonToggle = (memberId) => {
        if (chairpersons.includes(memberId)) {
            setChairpersons(chairpersons.filter((id) => id !== memberId));
        } else {
            setChairpersons([...chairpersons, memberId]);
        }
    };

    const handleRemoveChairperson = (memberId) => {
        setChairpersons(chairpersons.filter((id) => id !== memberId));
    };

    const handleClearAllChairpersons = () => {
        setChairpersons([]);
        setCustomChairperson("");
    };

    // Functions to handle array operations for vice chairpersons
    const handleViceChairpersonToggle = (memberId) => {
        if (viceChairpersons.includes(memberId)) {
            setViceChairpersons(viceChairpersons.filter((id) => id !== memberId));
        } else {
            setViceChairpersons([...viceChairpersons, memberId]);
        }
    };

    const handleRemoveViceChairperson = (memberId) => {
        setViceChairpersons(viceChairpersons.filter((id) => id !== memberId));
    };

    const handleClearAllViceChairpersons = () => {
        setViceChairpersons([]);
        setCustomViceChairperson("");
    };

    // Updated CommitteeMemberDropdown to handle arrays
    const CommitteeMemberDropdown = ({
        label,
        selectedItems, // Now accepts array
        customValue,
        onToggle, // Toggle function for arrays
        onClearAll,
        error,
        isOpen,
        setIsOpen,
        dropdownRef,
        modalType,
        isMultiple = true, // Can be single or multiple selection
    }) => {
        return (
            <div className="flex flex-col">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {!isMultiple && <span className="text-red-500">*</span>}
                </label>

                {/* Selected Items Display */}
                {(selectedItems.length > 0 || customValue) && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {selectedItems.map((memberId) => {
                            const member = isDropdown?.find((m) => m._id === memberId);
                            return member ? (
                                <div
                                    key={memberId}
                                    className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs dark:bg-blue-900/30"
                                >
                                    <span className="max-w-[200px] truncate">{member.full_name}</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (label.includes("Chairperson")) {
                                                handleRemoveChairperson(memberId);
                                            } else {
                                                handleRemoveMember(memberId);
                                            }
                                        }}
                                        className="text-red-500 transition-colors hover:text-red-700"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ) : null;
                        })}
                        {customValue && (
                            <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs dark:bg-green-900/30">
                                <span className="max-w-[200px] truncate">{customValue}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (label.includes("Chairperson")) {
                                            setCustomChairperson("");
                                        } else {
                                            setCustomViceChairperson("");
                                        }
                                    }}
                                    className="text-red-500 transition-colors hover:text-red-700"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        )}
                        {(selectedItems.length > 0 || customValue) && (
                            <button
                                type="button"
                                onClick={onClearAll}
                                className="text-xs text-red-600 transition-colors hover:text-red-800 dark:text-red-400"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                )}

                <div
                    className="relative"
                    ref={dropdownRef}
                >
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-left text-sm transition-all focus:outline-none focus:ring-2 ${
                            error
                                ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600"
                        } dark:bg-gray-700/50 dark:text-gray-200`}
                    >
                        <div className="truncate">
                            {selectedItems.length > 0 ? (
                                <span className="font-medium">
                                    {selectedItems.length} {label.toLowerCase()}
                                    {selectedItems.length > 1 ? "s" : ""} selected
                                </span>
                            ) : customValue ? (
                                <span className="font-medium">Custom {label}</span>
                            ) : (
                                <span className="text-gray-500 dark:text-gray-400">
                                    Select {label} {isMultiple ? "(Multiple)" : ""}
                                </span>
                            )}
                        </div>
                        <FiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""} text-gray-400`} />
                    </button>

                    {isOpen && (
                        <div className="absolute z-[999] mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                            {isDropdown && isDropdown.length > 0 ? (
                                <>
                                    <div className="sticky top-0 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select {label}</span>
                                            {(selectedItems.length > 0 || customValue) && (
                                                <button
                                                    type="button"
                                                    onClick={onClearAll}
                                                    className="text-xs text-red-600 transition-colors hover:text-red-800 dark:text-red-400"
                                                >
                                                    Clear All
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {isDropdown.map((member) => {
                                        const isSelected = selectedItems.includes(member._id);
                                        return (
                                            <div
                                                key={member._id}
                                                onClick={() => onToggle(member._id)}
                                                className="flex cursor-pointer items-center justify-between border-b border-gray-100 px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                                            >
                                                <div className="truncate pr-2">{member.full_name}</div>
                                                {isSelected && (
                                                    <FiCheckSquare
                                                        className="flex-shrink-0 text-blue-600"
                                                        size={16}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500">No members available</div>
                            )}

                            <div className="border-t border-gray-200 p-3 dark:border-gray-600">
                                <button
                                    type="button"
                                    onClick={() => {
                                        openModalForType(modalType);
                                        setIsOpen(false);
                                    }}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                >
                                    <FiPlus size={12} />
                                    Add New {label}
                                </button>
                            </div>
                        </div>
                    )}
                    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
                </div>
            </div>
        );
    };

    // Function to handle member selection/deselection
    const handleMemberToggle = (memberId) => {
        if (members.includes(memberId)) {
            setMembers(members.filter((id) => id !== memberId));
        } else {
            setMembers([...members, memberId]);
        }
    };

    // Function to remove a member from selected members
    const handleRemoveMember = (memberId) => {
        setMembers(members.filter((id) => id !== memberId));
    };

    // Function to clear all selected members
    const handleClearAllMembers = () => {
        setMembers([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
            <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-800 sm:max-h-[95vh]">
                {/* Modal Header */}
                <div className="flex-shrink-0 border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Upload Document</h2>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Fill details and select document file</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Modal Content - Scrollable Area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                    <form
                        onSubmit={handleUpload}
                        className="w-full"
                    >
                        {isLoading && (
                            <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm dark:bg-gray-900/95">
                                <div className="relative">
                                    <div className="border-3 h-16 w-16 animate-spin rounded-full border-gray-500 border-t-transparent"></div>
                                    <FiUploadCloud className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl text-blue-600" />
                                </div>
                                <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</p>
                            </div>
                        )}

                        {/* Two Column Layout for Desktop, Single Column for Mobile */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Left Column */}
                            <div className="space-y-4">
                                {/* Title */}
                                {/* Title - Same as Summary (Textarea) */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    {isFormLoading ? (
                                        <div className="h-32 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                    ) : (
                                        <div className="relative">
                                            <textarea
                                                value={title}
                                                onChange={(e) => {
                                                    setTitle(e.target.value);
                                                    setTitleError("");
                                                }}
                                                className={`min-h-[120px] w-full resize-none rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                    titleError
                                                        ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                                                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600"
                                                } dark:bg-gray-700/50 dark:text-gray-200`}
                                                placeholder="Document title..."
                                                rows={4}
                                            />
                                            {titleError && <p className="mt-1.5 text-xs text-red-500">{titleError}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Category and Resolution Number */}
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                        {isFormLoading ? (
                                            <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                                                >
                                                    <option value="">Select Category</option>
                                                    {isCategory &&
                                                        isCategory.map((cat) => (
                                                            <option
                                                                key={cat._id}
                                                                value={cat._id}
                                                            >
                                                                {cat.category}
                                                            </option>
                                                        ))}
                                                </select>
                                                <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {(isResolution || isOrdinance) && (
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Resolution No. <span className="text-red-500">*</span>
                                            </label>
                                            {isFormLoading ? (
                                                <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={resolutionNumber}
                                                        onChange={(e) => {
                                                            setResolutionNumber(e.target.value);
                                                            setResolutionNumberError("");
                                                        }}
                                                        className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                                                            resolutionNumberError
                                                                ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600"
                                                        } dark:bg-gray-700/50 dark:text-gray-200`}
                                                        placeholder={`e.g., ${new Date().getFullYear()}-001`}
                                                    />
                                                    {resolutionNumberError && <p className="mt-1.5 text-xs text-red-500">{resolutionNumberError}</p>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Committee Members Checkboxes */}
                                {(isResolution || isOrdinance) && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
                                        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Committee Members</h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={includeChairperson}
                                                    onChange={() => handleCheckboxChange("chairperson")}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Chairperson(s)</span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={includeViceChairperson}
                                                    onChange={() => handleCheckboxChange("viceChairperson")}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Vice Chairperson(s)</span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={includeMembers}
                                                    onChange={() => handleCheckboxChange("members")}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Members</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Chairperson - Now supports multiple */}
                                {includeChairperson && (
                                    <CommitteeMemberDropdown
                                        label="Chairperson"
                                        selectedItems={chairpersons}
                                        customValue={customChairperson}
                                        onToggle={handleChairpersonToggle}
                                        onClearAll={handleClearAllChairpersons}
                                        error={chairpersonError}
                                        isOpen={isChairpersonDropdownOpen}
                                        setIsOpen={setIsChairpersonDropdownOpen}
                                        dropdownRef={chairpersonDropdownRef}
                                        modalType="chairperson"
                                        isMultiple={true} // Can be multiple
                                    />
                                )}

                                {/* Vice Chairperson - Now supports multiple */}
                                {includeViceChairperson && (
                                    <CommitteeMemberDropdown
                                        label="Vice Chairperson"
                                        selectedItems={viceChairpersons}
                                        customValue={customViceChairperson}
                                        onToggle={handleViceChairpersonToggle}
                                        onClearAll={handleClearAllViceChairpersons}
                                        error={viceChairpersonError}
                                        isOpen={isViceChairpersonDropdownOpen}
                                        setIsOpen={setIsViceChairpersonDropdownOpen}
                                        dropdownRef={viceChairpersonDropdownRef}
                                        modalType="viceChairperson"
                                        isMultiple={true} // Can be multiple
                                    />
                                )}

                                {/* Members */}
                                {includeMembers && (
                                    <CommitteeMemberDropdown
                                        label="Committee Members"
                                        selectedItems={members}
                                        customValue=""
                                        onToggle={handleMemberToggle}
                                        onClearAll={handleClearAllMembers}
                                        error={membersError}
                                        isOpen={isMembersDropdownOpen}
                                        setIsOpen={setIsMembersDropdownOpen}
                                        dropdownRef={membersDropdownRef}
                                        modalType="members"
                                        isMultiple={true}
                                    />
                                )}

                                {/* Date of Resolution */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Resolution</label>
                                    {isFormLoading ? (
                                        <div className="h-11 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateOfResolution}
                                                onChange={(e) => setDateOfResolution(e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                {/* Summary */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Summary</label>
                                    {isFormLoading ? (
                                        <div className="h-32 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                    ) : (
                                        <textarea
                                            value={summary}
                                            onChange={(e) => setSummary(e.target.value)}
                                            className="min-h-[120px] w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                                            placeholder="Document summary..."
                                            rows={4}
                                        />
                                    )}
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Upload File <span className="text-red-500">*</span>
                                    </label>
                                    {isFormLoading ? (
                                        <div className="h-36 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                    ) : (
                                        <div
                                            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all ${
                                                isDragging
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : fileError
                                                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                                      : "border-gray-300 bg-white hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700/30 dark:hover:border-blue-400"
                                            }`}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setIsDragging(true);
                                            }}
                                            onDragLeave={() => setIsDragging(false)}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept=".pdf"
                                            />
                                            {selectedFile ? (
                                                <div className="text-center text-sm text-gray-700 dark:text-gray-300">
                                                    <FiFileText className="mx-auto mb-3 text-3xl text-blue-500" />
                                                    <p className="truncate text-base font-medium">{selectedFile.name}</p>
                                                    <p className="mt-1 text-xs text-gray-500">Click to change file</p>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500">
                                                    <FiUploadCloud className="mx-auto mb-3 text-4xl" />
                                                    <p className="text-sm">
                                                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="mt-1 text-xs">PDF files only (max 10MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {fileError && <p className="mt-1.5 text-xs text-red-500">{fileError}</p>}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Modal Footer - Fixed at Bottom */}
                <div className="flex-shrink-0 border-t border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6">
                    <div className="flex flex-col justify-end gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleUpload}
                            disabled={isPdfLoading || isLoading}
                            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            {isPdfLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Generating Preview...
                                </span>
                            ) : (
                                "Upload & Preview"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showPdfModal && (
                <PdfPreviewModal
                    showPdfModal={showPdfModal}
                    setShowPdfModal={setShowPdfModal}
                    pdfPreviewUrl={pdfPreviewUrl}
                    setPdfPreviewUrl={setPdfPreviewUrl}
                    isPdfLoading={isPdfLoading}
                    title={title}
                    selectedFile={selectedFile}
                    fileInputRef={fileInputRef}
                    handleFinalSubmit={handleFinalSubmit}
                    isLoading={isLoading}
                />
            )}

            {(showChairpersonModal || showViceChairpersonModal) && (
                <AuthorModal
                    showAuthorModal={showChairpersonModal || showViceChairpersonModal}
                    onClose={handleCloseAuthorModal}
                    handleAddNewAuthor={handleAddNewPerson}
                    newAuthorFirstName={currentFormData.firstName}
                    setNewAuthorFirstName={(value) => setCurrentFormData({ ...currentFormData, firstName: value })}
                    newAuthorLastName={currentFormData.lastName}
                    setNewAuthorLastName={(value) => setCurrentFormData({ ...currentFormData, lastName: value })}
                    newAuthorMiddleName={currentFormData.middleName}
                    setNewAuthorMiddleName={(value) => setCurrentFormData({ ...currentFormData, middleName: value })}
                    newAuthorEmail={currentFormData.email}
                    setNewAuthorEmail={(value) => setCurrentFormData({ ...currentFormData, email: value })}
                    newAuthorPosition={currentFormData.position}
                    setNewAuthorPosition={(value) => setCurrentFormData({ ...currentFormData, position: value })}
                    modalTitle={currentModalType === "chairperson" ? "Add New Chairperson" : "Add New Vice Chairperson"}
                    buttonText={currentModalType === "chairperson" ? "Add Chairperson" : "Add Vice Chairperson"}
                />
            )}
        </div>
    );
};

export default UploadDocumentModal;
