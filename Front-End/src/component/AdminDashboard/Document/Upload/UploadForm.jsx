import React, { useState, useRef, useContext, useEffect } from "react";
import { ThemeProviderContext } from "../../../../contexts/theme-context";
import { FilesDisplayContext } from "../../../../contexts/FileContext/FileContext";
import { AuthContext } from "../../../../contexts/AuthContext";
import { CategoryContext } from "../../../../contexts/CategoryContext/CategoryContext";
import { SbMemberDisplayContext } from "../../../../contexts/SbContext/SbContext";
import { FiUploadCloud, FiFileText, FiUser, FiBook, FiTag, FiCalendar, FiX, FiCheckSquare, FiPlus, FiHash, FiChevronDown } from "react-icons/fi";
import { ApproverDisplayContext } from "../../../../contexts/ApproverContext/ApproverContext";
import PdfPreviewModal from "./PdfPreviewModal";
import AuthorModal from "./AuthorModal";

const UploadForm = () => {
    const [authorType, setAuthorType] = useState("sbMember");
    const [customAuthor, setCustomAuthor] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customAuthorError, setCustomAuthorError] = useState("");
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
    const [dateOfResolution, setDateOfResolution] = useState("");
    const [fileError, setFileError] = useState("");
    const [titleError, setTitleError] = useState("");
    const [isFormLoading, setFormLoading] = useState(true);
    const [resolutionNumber, setResolutionNumber] = useState("");
    const [resolutionNumberError, setResolutionNumberError] = useState("");
    const [authorError, setAuthorError] = useState("");
    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
    const authorDropdownRef = useRef(null);
    const [approverError, setApproverError] = useState("");
    const [showAuthorModal, setShowAuthorModal] = useState(false);
    const [newAuthorFirstName, setNewAuthorFirstName] = useState("");
    const [newAuthorLastName, setNewAuthorLastName] = useState("");
    const [newAuthorMiddleName, setNewAuthorMiddleName] = useState("");
    const [newAuthorEmail, setNewAuthorEmail] = useState("");
    const [newAuthorPosition, setNewAuthorPosition] = useState("");
    const [customAuthorId, setCustomAuthorId] = useState(null); // NEW: Track custom author ID
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
    const [isPdfLoading, setIsPdfLoading] = useState(false);

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
    const isResolutionOrOrdinance = isResolution || isOrdinance;

    useEffect(() => {
        if (!isOrdinance) {
            setAuthorId(null);
            setCustomAuthorId(null); // NEW: Clear custom author ID
            setCustomAuthor(""); // NEW: Clear custom author name
            setAuthorError("");
        }
    }, [category, isOrdinance]);

    useEffect(() => {
        setApproverError("");
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

        const authorData = {
            authorDisplayName,
            first_name: newAuthorFirstName,
            last_name: newAuthorLastName,
            middle_name: newAuthorMiddleName,
            email: newAuthorEmail,
            Position: newAuthorPosition,
        };

        const result = await AddSbData(authorData);

        if (result && result.data) {
            setCustomAuthor(authorDisplayName);
            setCustomAuthorId(result.data._id); // NEW: Store new author ID
            setAuthorId(null); // Clear SB member selection
        }

        setNewAuthorFirstName("");
        setNewAuthorLastName("");
        setNewAuthorMiddleName("");
        setNewAuthorEmail("");
        setNewAuthorPosition("");

        setShowAuthorModal(false);
        setAuthorError("");
    };

    // Function to reset all form fields
    const resetForm = () => {
        setTitle("");
        setCategory("");
        setSummary("");
        setAuthorId(null);
        setCustomAuthorId(null);
        setCustomAuthor("");
        setDateOfResolution("");
        setResolutionNumber("");
        setSelectedFile(null);
        setAuthorType("sbMember");
        setFileError("");
        setTitleError("");
        setResolutionNumberError("");
        setAuthorError("");
        setApproverError("");
        setUploadMessage("");

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setFileError("");
        setTitleError("");
        setResolutionNumberError("");
        setAuthorError("");
        setApproverError("");
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
        // Require approver for Resolution/Ordinance
        //if (isResolutionOrOrdinance && (!approver || !approver._id)) {
            //setApproverError("Please Add Approver Account!");
           // valid = false;
       // }

        if (!valid) return;

        // Show PDF preview modal instead of uploading immediately
        setIsPdfLoading(true);
        try {
            // Create object URL for preview
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

    // New function to handle final submission
    const handleFinalSubmit = async () => {
        // 1. ADD VALIDATION CHECK HERE
        if (!selectedFile) {
            console.error("No file selected.");
            setUploadMessage("Please select a file to upload.");
            return; // Hihinto ang function kung walang file
        }

        // Close the modal immediately
        setShowPdfModal(false);

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", title);
        formData.append("category", category);
        formData.append("summary", summary);
        formData.append("admin", linkId);
        formData.append("dateOfResolution", dateOfResolution);

        if (authorId) {
            formData.append("author", authorId);
        } else if (customAuthorId) {
            formData.append("author", customAuthorId);
        }

        if (isResolution) {
            formData.append("resolutionNumber", resolutionNumber);
        }

        if (isResolutionOrOrdinance && approver?._id) {
            formData.append("approverID", approver._id);
        }

        try {
            setLoading(true);
            setUploadMessage(`Uploading "${selectedFile.name}"...`);

            const result = await AddFiles(formData);
            if (result.success) {
                setUploadMessage("File uploaded successfully.");
                // Reset all form fields after successful upload
                resetForm();
                setModalStatus("success");
                setShowModal(true);
            }
        } catch (err) {
            console.error(err);
            setUploadMessage("Upload failed. Try again.");
        } finally {
            setLoading(false);
            // Clean up object URL
            if (pdfPreviewUrl) {
                URL.revokeObjectURL(pdfPreviewUrl);
                setPdfPreviewUrl("");
            }
        }
    };

    const selectedMember = isDropdown?.find((member) => member._id === authorId);

    return (
        <form
            onSubmit={handleUpload}
            className="relative w-full rounded-2xl bg-gradient-to-br from-white/50 to-blue-50/30 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:from-slate-800/70 dark:to-slate-900/80 dark:ring-1 dark:ring-gray-900"
        >
            {/* Approver error message */}
            {isResolutionOrOrdinance && approverError && (
                <div className="mt-1.5 flex items-start rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                    <div className="mr-2 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                        <FiX size={14} />
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400">{approverError}</p>
                </div>
            )}
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
                        <div className="flex gap-4">
                            <div className="w-full">
                                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <FiFileText className="text-blue-500" />
                                    Title <span className="text-red-500">*</span>
                                </label>
                                {isFormLoading ? (
                                    <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => {
                                                setTitle(e.target.value);
                                                setTitleError("");
                                            }}
                                            className={`w-full rounded-xl border px-4 py-3 pl-10 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                                                titleError
                                                    ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                                                    : "border-gray-300 focus:border-blue-400 focus:ring-blue-300 dark:border-gray-600"
                                            } dark:bg-gray-700/50 dark:text-gray-200`}
                                            placeholder="e.g., Annual Financial Report"
                                        />
                                        <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        {titleError && <p className="mt-1.5 text-sm text-red-500">{titleError}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <FiTag className="text-blue-500" />
                                    Category
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
                                    </div>
                                )}
                            </div>
                        </div>
                        {(isResolution || isOrdinance) && (
                            <div>
                                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <FiHash className="text-blue-500" />
                                    Resolution / Ordinance No. <span className="text-red-500">*</span>
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
                                                <div className="text-left">
                                                    <div className="font-medium">{customAuthor}</div>
                                                    <div className="mt-0.5 text-xs text-gray-500">Custom Author</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">Select Author</span>
                                            )}
                                        </div>
                                        <FiChevronDown className={`transition-transform ${isAuthorDropdownOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {isAuthorDropdownOpen && (
                                        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
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
                                                                setAuthorId(null);
                                                                setCustomAuthorId(null);
                                                                setCustomAuthor("");
                                                                setAuthorError("");
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
                                                                    setCustomAuthorId(null); // Clear custom author
                                                                    setCustomAuthor(""); // Clear custom author name
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

                        <div>
                            <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FiCalendar className="text-blue-500" />
                                Date of Resolution/Ordinance
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
                        <div>
                            <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <FiBook className="text-blue-500" />
                                Summary
                            </label>
                            {isFormLoading ? (
                                <div className="h-20 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                            ) : (
                                <div className="relative">
                                    <textarea
                                        rows="3"
                                        value={summary}
                                        onChange={(e) => setSummary(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                                        placeholder="Brief summary of the document..."
                                    ></textarea>
                                    <FiBook className="absolute left-3 top-4 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="pt-2">
                            {isFormLoading ? (
                                <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3.5 font-medium text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg disabled:opacity-80"
                                >
                                    <FiUploadCloud className="transition-transform group-hover:scale-110" />
                                    {isLoading ? "Uploading..." : "Preview & Upload"}
                                </button>
                            )}
                        </div>
                        {!isFormLoading && uploadMessage && (
                            <p
                                className={`text-center text-sm font-medium ${
                                    uploadMessage.includes("success") ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"
                                }`}
                            >
                                {uploadMessage}
                            </p>
                        )}
                    </div>
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Document File</h3>
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                PDF Only
                            </span>
                        </div>

                        {isFormLoading ? (
                            <div className="h-64 w-full animate-pulse rounded-xl border-2 border-dashed bg-gray-100 dark:border-gray-700 dark:bg-gray-800/30" />
                        ) : (
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                                className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-5 text-center transition-all duration-300 ${
                                    isDragging
                                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                                        : fileError
                                          ? "border-red-400 bg-red-50/50 dark:border-red-500 dark:bg-red-900/10"
                                          : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/20"
                                }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".pdf"
                                />

                                <div className="pointer-events-none flex flex-col items-center justify-center py-8">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                                        <FiUploadCloud size={28} />
                                    </div>
                                    <p className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                                        {selectedFile ? "File Selected" : "Click to select or drag file"}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {selectedFile ? selectedFile.name : "Max file size: 10MB"}
                                    </p>
                                    <button
                                        type="button"
                                        className={`mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 ${
                                            selectedFile ? "block" : "hidden"
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                    >
                                        Change File
                                    </button>
                                </div>

                                <div className="absolute inset-0 -z-10 grid grid-cols-4 gap-1.5 opacity-10 [&>div]:bg-blue-500">
                                    {[...Array(16)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-full w-full rounded"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {fileError && (
                            <div className="mt-3 flex items-start rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                                <div className="mr-2 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                                    <FiX size={14} />
                                </div>
                                <p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>
                            </div>
                        )}

                        {selectedFile && (
                            <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50/80 p-3 dark:bg-emerald-900/20">
                                <div className="flex items-center">
                                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                                        <FiFileText size={18} />
                                    </div>
                                    <div>
                                        <p className="line-clamp-1 text-sm font-medium text-gray-800 dark:text-gray-200">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* PDF Preview Modal */}
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

                {showAuthorModal && (
                    <AuthorModal
                        showAuthorModal={showAuthorModal}
                        onClose={() => setShowAuthorModal(false)}
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
                )}
            </div>
        </form>
    );
};

export default UploadForm;
