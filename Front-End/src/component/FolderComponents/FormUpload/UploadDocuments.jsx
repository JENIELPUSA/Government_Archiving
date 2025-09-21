import React, { useState, useRef, useContext, useEffect } from "react";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { AuthContext } from "../../../contexts/AuthContext";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import { FiUploadCloud, FiFileText, FiUser, FiBook, FiTag, FiCalendar, FiX, FiCheckSquare, FiPlus, FiHash, FiChevronDown } from "react-icons/fi";
import { ApproverDisplayContext } from "../../../contexts/ApproverContext/ApproverContext";
import PdfPreviewModal from "./PDFReview";
import AuthorModal from "./AuthorComponents";

const UploadDocumentModal = ({ isOpen, onClose, folderId, isSuccess }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const { approver } = useContext(ApproverDisplayContext);
    const { isDropdown, AddSbData } = useContext(SbMemberDisplayContext);
    const { AddFiles, customError } = useContext(FilesDisplayContext);
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
    const [authorId, setAuthorId] = useState(null);
    const [customAuthor, setCustomAuthor] = useState("");
    const [dateOfResolution, setDateOfResolution] = useState("");
    const [requiresDesignatedApprover, setRequiresDesignatedApprover] = useState(false);
    const [fileError, setFileError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [isFormLoading, setFormLoading] = useState(true);
    const [resolutionNumber, setResolutionNumber] = useState("");
    const [resolutionNumberError, setResolutionNumberError] = useState("");
    const [authorError, setAuthorError] = useState("");
    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
    const authorDropdownRef = useRef(null);
    const [authorType, setAuthorType] = useState("sbMember");
    const [newAuthorFirstName, setNewAuthorFirstName] = useState("");
    const [newAuthorLastName, setNewAuthorLastName] = useState("");
    const [newAuthorMiddleName, setNewAuthorMiddleName] = useState("");
    const [newAuthorEmail, setNewAuthorEmail] = useState("");
    const [newAuthorPosition, setNewAuthorPosition] = useState("");
    const [customAuthorError, setCustomAuthorError] = useState("");
    const [checkboxError, setCheckboxError] = useState("");
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [showAuthorModal, setShowAuthorModal] = useState(false);

    const ALLOWED_FILE_TYPES = ["application/pdf"];
    useEffect(() => {
        const timer = setTimeout(() => {
            setFormLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
                setIsAuthorDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Clean up object URLs when component unmounts
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
        if (!isOrdinance) {
            setAuthorId(null);
            setCustomAuthor("");
            setAuthorError("");
        }
    }, [category, isOrdinance]);

    useEffect(() => {
        setCheckboxError("");
    }, [category]);

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

    const handleCloseAuthor = () => {
        setShowAuthorModal(false);
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
        setAuthorError("");
        setCheckboxError("");
        setUploadMessage("");

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
        if (authorId) {
            formData.append("author", authorId);
        } else if (customAuthor) {
            formData.append("author", customAuthor);
        }

        if (isResolution) {
            formData.append("resolutionNumber", resolutionNumber);
        }

        try {
            setLoading(true);
            setUploadMessage(`Uploading "${selectedFile.name}"...`);

            const result = await AddFiles(formData);
            if (result.success) {
                setUploadMessage("File uploaded successfully.");
                isSuccess();
                setSelectedFile(null);
                setTitle("");
                setCategory("");
                setSummary("");
                setAuthorId(null);
                setCustomAuthor("");
                setDateOfResolution("");
                setRequiresDesignatedApprover(false);
                setResolutionNumber("");
                setAuthorType("sbMember");
                setNewAuthorFirstName("");
                setNewAuthorLastName("");
                setNewAuthorMiddleName("");
                setNewAuthorEmail("");
                setNewAuthorPosition("");
                setModalStatus("success");
                setShowModal(true);
                onClose(); // Close the main modal as well
            }
        } catch (err) {
            console.error(err);
            setUploadMessage("Upload failed. Try again.");
        } finally {
            setLoading(false);
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
                setPdfPreviewUrl("");
            }
        }
    };

    const handleAddNewAuthor = async () => {
        if (!newAuthorFirstName.trim() || !newAuthorLastName.trim()) {
            setCustomAuthorError("First Name and Last Name are required");
            return;
        }

        let authorDisplayName = `${newAuthorFirstName} ${newAuthorLastName}`;
        if (newAuthorMiddleName.trim()) {
            authorDisplayName = `${newAuthorFirstName} ${newAuthorMiddleName} ${newAuthorLastName}`;
        }

        if (newAuthorPosition.trim()) {
            authorDisplayName += ` - ${newAuthorPosition.trim()}`;
        }

        if (newAuthorEmail.trim()) {
            authorDisplayName += ` | ${newAuthorEmail.trim()}`;
        }

        setCustomAuthor(authorDisplayName);
        const authorData = {
            authorDisplayName,
            first_name: newAuthorFirstName,
            last_name: newAuthorLastName,
            middle_name: newAuthorMiddleName,
            email: newAuthorEmail,
            Position: newAuthorPosition,
        };
        await AddSbData(authorData);

        setAuthorId(null);

        setNewAuthorFirstName("");
        setNewAuthorLastName("");
        setNewAuthorMiddleName("");
        setNewAuthorEmail("");
        setNewAuthorPosition("");

        setShowAuthorModal(false);
        setAuthorError("");
    };

    const selectedMember = isDropdown?.find((member) => member._id === authorId);

    // Main Modal Wrapper
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="relative w-full max-w-7xl overflow-visible rounded-2xl bg-gradient-to-br from-white/50 to-blue-50/30 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 dark:from-slate-800/70 dark:to-slate-900/80 dark:ring-1 dark:ring-gray-900">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                    <FiX size={20} />
                </button>
                <form
                    onSubmit={handleUpload}
                    className="w-full"
                >
                    {isLoading && (
                        <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center rounded-2xl bg-white/90 backdrop-blur-xl dark:bg-gray-900/95">
                            <div className="relative">
                                <div className="h-20 w-20 animate-spin rounded-full border-4 border-gray-500 border-t-transparent"></div>
                                <FiUploadCloud className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-blue-600" />
                            </div>
                            <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
                                Uploading <span className="font-bold text-blue-600">{selectedFile?.name}</span>...
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait while we process your document</p>
                        </div>
                    )}
                    <div className="w-full rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800/50">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Upload New Document</h2>
                                <p className="text-500 text-sm dark:text-gray-400">Fill details and select a document file</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                <FiFileText size={20} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <div className="space-y-5">
                                {/* Title Field */}
                                <div className="flex gap-4">
                                    <div className="w-full">
                                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <FiFileText className="text-blue-500" />
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        {isFormLoading ? (
                                            <div className="h-20 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                        ) : (
                                            <div className="relative">
                                                <textarea
                                                    value={title}
                                                    onChange={(e) => {
                                                        setTitle(e.target.value);
                                                        setTitleError("");
                                                    }}
                                                    rows={4} // pwede palitan kung gaano kataas
                                                    className={`w-full resize-none rounded-xl border px-4 py-3 pl-10 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                                                        titleError
                                                            ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                                                            : "border-gray-300 focus:border-blue-400 focus:ring-blue-300 dark:border-gray-600"
                                                    } dark:bg-gray-700/50 dark:text-gray-200`}
                                                    placeholder="e.g., Annual Financial Report"
                                                />
                                                <FiFileText className="absolute left-3 top-3 text-gray-400" />
                                                {titleError && <p className="mt-1.5 text-sm text-red-500">{titleError}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* End of Title Field */}

                                {/* Category and Resolution Number Fields */}
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <div className="flex flex-col">
                                        <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <FiTag className="text-blue-500" />
                                                Category
                                            </div>
                                        </label>
                                        {isFormLoading ? (
                                            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
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
                                                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    {(isResolution || isOrdinance) && (
                                        <div className="flex flex-col">
                                            <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                <div className="flex items-center gap-1">
                                                    <FiHash className="text-blue-500" />
                                                    Resolution No. <span className="text-red-500">*</span>
                                                </div>
                                            </label>
                                            {isFormLoading ? (
                                                <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={resolutionNumber}
                                                        onChange={(e) => {
                                                            setResolutionNumber(e.target.value);
                                                            setResolutionNumberError("");
                                                        }}
                                                        className={`w-full rounded-xl border px-4 py-3 pl-10 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                                                            resolutionNumberError
                                                                ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                                                                : "border-gray-300 focus:border-blue-400 focus:ring-blue-300 dark:border-gray-600"
                                                        } dark:bg-gray-700/50 dark:text-gray-200`}
                                                        placeholder={`e.g., ${new Date().getFullYear()}-001`}
                                                    />
                                                    <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    {resolutionNumberError && <p className="mt-1.5 text-sm text-red-500">{resolutionNumberError}</p>}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* End of Category and Resolution Number Fields */}

                                {/* Author Field */}
                                <div className="flex flex-col">
                                    <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <FiUser className="text-blue-500" />
                                            Author <span className="text-red-500">*</span>
                                        </div>
                                    </label>
                                    {isFormLoading ? (
                                        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                    ) : (
                                        <div
                                            className="relative"
                                            ref={authorDropdownRef}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setIsAuthorDropdownOpen(!isAuthorDropdownOpen)}
                                                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left shadow-sm transition-all focus:outline-none focus:ring-2 ${
                                                    authorError
                                                        ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                                                        : "border-gray-300 focus:border-blue-400 focus:ring-blue-300 dark:border-gray-600"
                                                } dark:bg-gray-700/50 dark:text-gray-200`}
                                            >
                                                <div className="flex items-center">
                                                    {selectedMember ? (
                                                        <div className="text-left">
                                                            <div className="font-medium">{selectedMember.full_name}</div>
                                                            <div className="mt-0.5 text-xs text-gray-500">{selectedMember.Position}</div>
                                                        </div>
                                                    ) : customAuthor ? (
                                                        <div className="font-medium">{customAuthor}</div>
                                                    ) : (
                                                        <span className="text-gray-500 dark:text-gray-400">Select Author</span>
                                                    )}
                                                </div>
                                                <FiChevronDown className={`transition-transform ${isAuthorDropdownOpen ? "rotate-180" : ""}`} />
                                            </button>

                                            {isAuthorDropdownOpen && (
                                                <div className="absolute z-[999] mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
                                                    <div className="border-b border-gray-200 p-4 dark:border-gray-600">
                                                        <div className="mb-4 flex items-center gap-4">
                                                            <label className="flex items-center gap-2 text-sm">
                                                                <input
                                                                    type="radio"
                                                                    name="authorType"
                                                                    checked={authorType === "sbMember"}
                                                                    onChange={() => setAuthorType("sbMember")}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                SB Member
                                                            </label>
                                                            <label className="flex items-center gap-2 text-sm">
                                                                <input
                                                                    type="radio"
                                                                    name="authorType"
                                                                    checked={authorType === "none"}
                                                                    onChange={() => {
                                                                        setAuthorType("none");
                                                                        setAuthorId(null); // Clear author ID
                                                                        setCustomAuthor(""); // Clear custom author
                                                                        setIsAuthorDropdownOpen(false); // Close dropdown
                                                                        setAuthorError(""); // Clear any author errors
                                                                    }}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                None
                                                            </label>
                                                        </div>

                                                        {isDropdown && isDropdown.length > 0 && (
                                                            <div className="max-h-60 overflow-y-auto border-t border-gray-200 dark:border-gray-600">
                                                                <div className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                                                                    SB Members
                                                                </div>
                                                                {isDropdown.map((member) => (
                                                                    <div
                                                                        key={member._id}
                                                                        onClick={() => {
                                                                            setAuthorId(member._id);
                                                                            setCustomAuthor("");
                                                                            setIsAuthorDropdownOpen(false);
                                                                            setAuthorError("");
                                                                        }}
                                                                        className="cursor-pointer px-4 py-3 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                                                    >
                                                                        <div className="font-medium">{member.full_name}</div>
                                                                        <div className="mt-1 text-xs text-gray-500">{member.Position}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setNewAuthorFirstName("");
                                                                setNewAuthorLastName("");
                                                                setNewAuthorMiddleName("");
                                                                setNewAuthorEmail("");
                                                                setNewAuthorPosition("");
                                                                setShowAuthorModal(true);
                                                                setIsAuthorDropdownOpen(false);
                                                            }}
                                                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            <FiPlus size={16} />
                                                            Add Custom Author
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {authorError && <p className="mt-1.5 text-sm text-red-500">{authorError}</p>}
                                        </div>
                                    )}
                                </div>
                                {/* End of Author Field */}

                                {/* Date of Resolution Field */}
                                <div className="flex flex-col">
                                    <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <FiCalendar className="text-blue-500" />
                                            Date of Resolution
                                        </div>
                                    </label>
                                    {isFormLoading ? (
                                        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={dateOfResolution}
                                                onChange={(e) => setDateOfResolution(e.target.value)}
                                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                                            />
                                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-5">
                                {/* Summary Field */}
                                <div className="flex flex-col">
                                    <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <FiBook className="text-blue-500" />
                                            Summary
                                        </div>
                                    </label>
                                    {isFormLoading ? (
                                        <div className="h-28 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                    ) : (
                                        <div className="relative">
                                            <textarea
                                                value={summary}
                                                onChange={(e) => setSummary(e.target.value)}
                                                className="h-28 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                                                placeholder="Provide a brief summary of the document..."
                                            />
                                        </div>
                                    )}
                                </div>
                                {/* End of Summary Field */}

                                {/* File Upload Field */}
                                <div className="flex flex-col">
                                    <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <FiUploadCloud className="text-blue-500" />
                                            Upload File <span className="text-red-500">*</span>
                                        </div>
                                    </label>
                                    {isFormLoading ? (
                                        <div className="h-32 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                    ) : (
                                        <div
                                            className={`flex h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
                                                isDragging
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : fileError
                                                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                                      : "border-gray-300 bg-white hover:border-blue-400 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-400"
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
                                                    <FiFileText className="mx-auto mb-2 text-3xl text-blue-500" />
                                                    <p className="font-semibold">{selectedFile.name}</p>
                                                    <p className="text-xs text-gray-500">File selected</p>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500">
                                                    <FiUploadCloud className="mx-auto mb-2 text-4xl" />
                                                    <p className="text-sm">
                                                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop a file
                                                    </p>
                                                    <p className="mt-1 text-xs">PDF only (Max 10MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {fileError && <p className="mt-1.5 text-sm text-red-500">{fileError}</p>}
                                </div>
                                {/* End of File Upload Field */}
                            </div>
                        </div>

                        {/* Form Action Buttons */}
                        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {isPdfLoading ? "Generating Preview..." : "Upload & Preview"}
                            </button>
                        </div>
                    </div>
                </form>
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
            <AuthorModal
                showAuthorModal={showAuthorModal}
                onClose={handleCloseAuthor}
                handleAddNewAuthor={handleAddNewAuthor}
                newAuthorFirstName={newAuthorFirstName}
                setNewAuthorFirstName={setNewAuthorFirstName}
                newAuthorLastName={newAuthorLastName}
                setNewAuthorLastName={setNewAuthorLastName}
                newAuthorMiddleName={newAuthorMiddleName}
                setNewAuthorMiddleName={setNewAuthorMiddleName}
                newAuthorEmail={newAuthorEmail}
                setNewAuthorEmail={setNewAuthorEmail}
                newAuthorPosition={newAuthorPosition}
                setNewAuthorPosition={setNewAuthorPosition}
                customAuthorError={customAuthorError}
                setCustomAuthorError={setCustomAuthorError}
            />
        </div>
    );
};

export default UploadDocumentModal;
