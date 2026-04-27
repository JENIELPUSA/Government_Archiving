import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import { FileText, Folder, File, Users, X, Save, ChevronDown, Check, UserPlus, Calendar, Star } from "lucide-react";
import { FolderContext } from "../../../contexts/FolderContext/FolderContext.jsx";

const EditDocumentModal = ({ show, document, onClose }) => {
    const { fetchSpecificData } = useContext(FolderContext);
    const { isDropdown } = useContext(SbMemberDisplayContext);
    const { UpdateFiles } = useContext(FilesDisplayContext);
    const { isCategory } = useContext(CategoryContext);

    const [editedDoc, setEditedDoc] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ADDED: isFeatured state
    const [isFeatured, setIsFeatured] = useState(false);

    // Committee member states
    const [chairpersons, setChairpersons] = useState([]);
    const [viceChairpersons, setViceChairpersons] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [members, setMembers] = useState([]);

    // Custom entries
    const [customChairperson, setCustomChairperson] = useState("");
    const [customViceChairperson, setCustomViceChairperson] = useState("");
    const [customAuthor, setCustomAuthor] = useState("");

    // Checkbox states
    const [includeChairperson, setIncludeChairperson] = useState(false);
    const [includeViceChairperson, setIncludeViceChairperson] = useState(false);
    const [includeAuthor, setIncludeAuthor] = useState(false);
    const [includeMembers, setIncludeMembers] = useState(false);

    // Dropdown visibility
    const [isChairpersonDropdownOpen, setIsChairpersonDropdownOpen] = useState(false);
    const [isViceChairpersonDropdownOpen, setIsViceChairpersonDropdownOpen] = useState(false);
    const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);
    const [isMembersDropdownOpen, setIsMembersDropdownOpen] = useState(false);

    // Refs for dropdown click outside
    const chairpersonDropdownRef = useRef(null);
    const viceChairpersonDropdownRef = useRef(null);
    const authorDropdownRef = useRef(null);
    const membersDropdownRef = useRef(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chairpersonDropdownRef.current && !chairpersonDropdownRef.current.contains(event.target)) {
                setIsChairpersonDropdownOpen(false);
            }
            if (viceChairpersonDropdownRef.current && !viceChairpersonDropdownRef.current.contains(event.target)) {
                setIsViceChairpersonDropdownOpen(false);
            }
            if (authorDropdownRef.current && !authorDropdownRef.current.contains(event.target)) {
                setIsAuthorDropdownOpen(false);
            }
            if (membersDropdownRef.current && !membersDropdownRef.current.contains(event.target)) {
                setIsMembersDropdownOpen(false);
            }
        };

        if (typeof window !== "undefined" && document && document.addEventListener) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }

        return () => {};
    }, []);

    const normalizeDoc = useCallback((doc) => {
        if (!doc) return {};

        let chairpersonsArray = [];
        let viceChairpersonsArray = [];
        let authorsArray = [];
        let membersArray = [];
        let customChairpersonValue = "";
        let customViceChairpersonValue = "";
        let customAuthorValue = "";
        let includeChairpersonFlag = false;
        let includeViceChairpersonFlag = false;
        let includeAuthorFlag = false;
        let includeMembersFlag = false;

        // Handle chairpersons
        if (doc.chairpersons && Array.isArray(doc.chairpersons)) {
            if (doc.chairpersons.length > 0) {
                includeChairpersonFlag = true;
                if (typeof doc.chairpersons[0] === "string") {
                    customChairpersonValue = doc.chairpersons[0];
                } else if (doc.chairpersons[0] && typeof doc.chairpersons[0] === "object") {
                    if (doc.chairpersons[0].custom) {
                        customChairpersonValue = doc.chairpersons[0].full_name || doc.chairpersons[0].name || "";
                    } else {
                        chairpersonsArray.push(doc.chairpersons[0]._id || doc.chairpersons[0].id || doc.chairpersons[0]);
                    }
                }
            }
        }

        // Handle vice chairpersons
        if (doc.viceChairpersons && Array.isArray(doc.viceChairpersons)) {
            if (doc.viceChairpersons.length > 0) {
                includeViceChairpersonFlag = true;
                if (typeof doc.viceChairpersons[0] === "string") {
                    customViceChairpersonValue = doc.viceChairpersons[0];
                } else if (doc.viceChairpersons[0] && typeof doc.viceChairpersons[0] === "object") {
                    if (doc.viceChairpersons[0].custom) {
                        customViceChairpersonValue = doc.viceChairpersons[0].full_name || doc.viceChairpersons[0].name || "";
                    } else {
                        viceChairpersonsArray.push(doc.viceChairpersons[0]._id || doc.viceChairpersons[0].id || doc.viceChairpersons[0]);
                    }
                }
            }
        }

        // Handle authors
        if (doc.author) {
            const authorData = Array.isArray(doc.author) ? doc.author : [doc.author];
            
            if (authorData.length > 0) {
                includeAuthorFlag = true;
                const firstAuthor = authorData[0];
                
                if (typeof firstAuthor === "string") {
                    customAuthorValue = firstAuthor;
                } else if (firstAuthor && typeof firstAuthor === "object") {
                    if (firstAuthor.custom) {
                        customAuthorValue = firstAuthor.full_name || firstAuthor.name || "";
                    } else {
                        authorsArray.push(firstAuthor._id || firstAuthor.id || firstAuthor);
                    }
                }
            }
        }

        // Handle members
        if (doc.members && Array.isArray(doc.members)) {
            if (doc.members.length > 0) {
                includeMembersFlag = true;
                doc.members.forEach((member) => {
                    if (typeof member === "string") {
                        membersArray.push({
                            custom: true,
                            full_name: member,
                        });
                    } else if (member && typeof member === "object") {
                        if (member.custom) {
                            membersArray.push({
                                custom: true,
                                full_name: member.full_name || member.name || String(member),
                            });
                        } else {
                            membersArray.push(member._id || member.id || member);
                        }
                    }
                });
            }
        }

        let categoryId = "";
        if (doc.category && typeof doc.category === "object") {
            categoryId = doc.category._id;
        } else {
            categoryId = doc.category || doc.categoryID || "";
        }

        return {
            ...doc,
            category: categoryId,
            dateOfResolution: doc.dateOfResolution || "",
            resolutionNumber: doc.resolutionNumber || "",
            chairpersons: chairpersonsArray,
            viceChairpersons: viceChairpersonsArray,
            authors: authorsArray,
            members: membersArray,
            customChairperson: customChairpersonValue,
            customViceChairperson: customViceChairpersonValue,
            customAuthor: customAuthorValue,
            includeChairperson: includeChairpersonFlag,
            includeViceChairperson: includeViceChairpersonFlag,
            includeAuthor: includeAuthorFlag,
            includeMembers: includeMembersFlag,
            isFeatured: doc.isFeatured || false, // ADDED: Include isFeatured in normalized data
        };
    }, []);

    useEffect(() => {
        if (document && show) {
            const normalized = normalizeDoc(document);
            setEditedDoc(normalized);
            
            // ADDED: Set isFeatured state
            setIsFeatured(normalized.isFeatured || false);

            if (normalized.customChairperson) {
                setCustomChairperson(normalized.customChairperson);
                setChairpersons([]);
            } else {
                setChairpersons(normalized.chairpersons || []);
                setCustomChairperson("");
            }

            if (normalized.customViceChairperson) {
                setCustomViceChairperson(normalized.customViceChairperson);
                setViceChairpersons([]);
            } else {
                setViceChairpersons(normalized.viceChairpersons || []);
                setCustomViceChairperson("");
            }

            if (normalized.customAuthor) {
                setCustomAuthor(normalized.customAuthor);
                setAuthors([]);
            } else {
                setAuthors(normalized.authors || []);
                setCustomAuthor("");
            }

            const memberIds = normalized.members.filter((member) => !member.custom).map((member) => member._id || member.id || member);
            setMembers(memberIds);

            setIncludeChairperson(normalized.includeChairperson || false);
            setIncludeViceChairperson(normalized.includeViceChairperson || false);
            setIncludeAuthor(normalized.includeAuthor || false);
            setIncludeMembers(normalized.includeMembers || false);
        }
    }, [document, show, normalizeDoc]);

    const selectedCategory = isCategory?.find((cat) => cat._id === editedDoc.category);
    const isResolution = selectedCategory?.category === "Resolution";
    const isOrdinance = selectedCategory?.category === "Ordinance";
    const showCommitteeSection = isResolution || isOrdinance;

    useEffect(() => {
        if (!showCommitteeSection) {
            setIncludeChairperson(false);
            setIncludeViceChairperson(false);
            setIncludeAuthor(false);
            setIncludeMembers(false);
            setChairpersons([]);
            setViceChairpersons([]);
            setAuthors([]);
            setMembers([]);
            setCustomChairperson("");
            setCustomViceChairperson("");
            setCustomAuthor("");
        }
    }, [showCommitteeSection]);

    const handleCheckboxChange = (checkboxType) => {
        switch (checkboxType) {
            case "chairperson":
                setIncludeChairperson(!includeChairperson);
                if (!includeChairperson) {
                    setChairpersons([]);
                    setCustomChairperson("");
                }
                break;
            case "viceChairperson":
                setIncludeViceChairperson(!includeViceChairperson);
                if (!includeViceChairperson) {
                    setViceChairpersons([]);
                    setCustomViceChairperson("");
                }
                break;
            case "author":
                setIncludeAuthor(!includeAuthor);
                if (!includeAuthor) {
                    setAuthors([]);
                    setCustomAuthor("");
                }
                break;
            case "members":
                setIncludeMembers(!includeMembers);
                if (!includeMembers) {
                    setMembers([]);
                }
                break;
            default:
                break;
        }
    };

    const handleChairpersonToggle = (memberId) => {
        setChairpersons((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));
        setCustomChairperson("");
    };

    const handleViceChairpersonToggle = (memberId) => {
        setViceChairpersons((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));
        setCustomViceChairperson("");
    };

    const handleAuthorToggle = (memberId) => {
        setAuthors((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));
        setCustomAuthor("");
    };

    const handleMemberToggle = (memberId) => {
        setMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]));
    };

    const addCustomChairperson = () => {
        const name = prompt("Enter chairperson name:");
        if (name && name.trim()) {
            setCustomChairperson(name.trim());
            setChairpersons([]);
        }
    };

    const addCustomViceChairperson = () => {
        const name = prompt("Enter vice chairperson name:");
        if (name && name.trim()) {
            setCustomViceChairperson(name.trim());
            setViceChairpersons([]);
        }
    };

    const addCustomAuthor = () => {
        const name = prompt("Enter author name:");
        if (name && name.trim()) {
            setCustomAuthor(name.trim());
            setAuthors([]);
        }
    };

    const clearAllChairpersons = () => {
        setChairpersons([]);
        setCustomChairperson("");
    };

    const clearAllViceChairpersons = () => {
        setViceChairpersons([]);
        setCustomViceChairperson("");
    };

    const clearAllAuthors = () => {
        setAuthors([]);
        setCustomAuthor("");
    };

    const clearAllMembers = () => {
        setMembers([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                title: editedDoc.title || "",
                category: editedDoc.category || "",
                summary: editedDoc.summary || "",
                resolutionNumber: editedDoc.resolutionNumber || "",
                dateOfResolution: editedDoc.dateOfResolution || null,
                isFeatured: isFeatured, // ADDED: Include isFeatured in payload
            };

            if (includeChairperson) {
                if (customChairperson) {
                    payload.chairpersons = [customChairperson];
                } else if (chairpersons.length > 0) {
                    payload.chairpersons = chairpersons;
                }
            }

            if (includeViceChairperson) {
                if (customViceChairperson) {
                    payload.viceChairpersons = [customViceChairperson];
                } else if (viceChairpersons.length > 0) {
                    payload.viceChairpersons = viceChairpersons;
                }
            }

            if (includeAuthor) {
                if (customAuthor) {
                    payload.author = customAuthor;
                } else if (authors.length > 0) {
                    payload.author = authors.length === 1 ? authors[0] : authors;
                }
            }

            if (includeMembers && members.length > 0) {
                payload.members = members;
            }

            Object.keys(payload).forEach((key) => {
                if (
                    payload[key] === null ||
                    payload[key] === undefined ||
                    (Array.isArray(payload[key]) && payload[key].length === 0) ||
                    payload[key] === ""
                ) {
                    delete payload[key];
                }
            });

            const result = await UpdateFiles(editedDoc._id, payload);
            if (result.success) {
                fetchSpecificData(result.data.folderID, { categoryId: result.data.category });
                onClose();
            }
        } catch (error) {
            alert("Failed to update document. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMemberName = (memberId) => {
        if (!memberId || !isDropdown) return memberId;
        const member = isDropdown.find((m) => m._id === memberId || String(m._id) === String(memberId));
        return member?.full_name || memberId;
    };

    const CommitteeMemberDropdown = ({
        label,
        selectedItems,
        customValue,
        onToggle,
        onClearAll,
        onAddCustom,
        isOpen,
        setIsOpen,
        dropdownRef,
        isMultiple = true,
    }) => {
        const hasSelections = selectedItems.length > 0 || customValue;

        return (
            <div className="flex flex-col">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                </label>

                {hasSelections && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {selectedItems.map((memberId) => (
                            <div
                                key={memberId}
                                className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs dark:bg-blue-900/30"
                            >
                                <span className="max-w-[200px] truncate">{getMemberName(memberId)}</span>
                                <button
                                    type="button"
                                    onClick={() => onToggle(memberId)}
                                    className="text-red-500 transition-colors hover:text-red-700"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}

                        {customValue && (
                            <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs dark:bg-green-900/30">
                                <span className="max-w-[200px] truncate">{customValue}</span>
                                <button
                                    type="button"
                                    onClick={onClearAll}
                                    className="text-red-500 transition-colors hover:text-red-700"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {hasSelections && (
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
                        className={`flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200`}
                    >
                        <div className="truncate">
                            {hasSelections ? (
                                <span className="font-medium">
                                    {selectedItems.length > 0
                                        ? `${selectedItems.length} ${label.toLowerCase()}${selectedItems.length > 1 ? "s" : ""} selected`
                                        : `Custom ${label}`}
                                </span>
                            ) : (
                                <span className="text-gray-500 dark:text-gray-400">
                                    Select {label} {isMultiple ? "(Multiple)" : ""}
                                </span>
                            )}
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                        <div className="absolute left-0 z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
                            {isDropdown && isDropdown.length > 0 ? (
                                <>
                                    <div className="sticky top-0 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-600 dark:bg-gray-700">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select {label}</span>
                                            {hasSelections && (
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
                                                {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="px-4 py-3 text-sm text-gray-500">No members available</div>
                            )}
                            
                            {onAddCustom && (
                                <div className="border-t border-gray-200 p-3 dark:border-gray-600">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onAddCustom();
                                            setIsOpen(false);
                                        }}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                    >
                                        <UserPlus className="h-3 w-3" />
                                        Add New {label}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="edit-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 rounded-t-2xl border-b border-gray-200 bg-white px-6 py-5 dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Document</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Update document details and committee members</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-5">
                            <div className="space-y-5">
                                {/* Document Title */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Document Title <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={editedDoc.title || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, title: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        rows={2}
                                        required
                                        disabled={isSubmitting}
                                        placeholder="Enter document title"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Document Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editedDoc.category || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, category: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select a category</option>
                                        {isCategory?.map((categoryItem) => (
                                            <option key={categoryItem._id} value={categoryItem._id}>
                                                {categoryItem.category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* ADDED: isFeatured Checkbox */}
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isFeatured}
                                            onChange={(e) => setIsFeatured(e.target.checked)}
                                            className="h-5 w-5 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Star className={`h-5 w-5 ${isFeatured ? 'fill-yellow-500 text-yellow-500' : 'text-yellow-500'}`} />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Featured Document
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                (Mark as important/featured content)
                                            </span>
                                        </div>
                                    </label>
                                    {isFeatured && (
                                        <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                                            <Star className="mr-1 inline-block h-3 w-3" />
                                            This document will be highlighted as a featured item.
                                        </p>
                                    )}
                                </div>

                                {/* Resolution Number & Date Row */}
                                {showCommitteeSection && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Resolution Number
                                            </label>
                                            <input
                                                type="text"
                                                value={editedDoc.resolutionNumber || ""}
                                                onChange={(e) => setEditedDoc({ ...editedDoc, resolutionNumber: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                placeholder="e.g., 2024-001"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Date of Resolution
                                            </label>
                                            <input
                                                type="date"
                                                value={editedDoc.dateOfResolution ? new Date(editedDoc.dateOfResolution).toISOString().split("T")[0] : ""}
                                                onChange={(e) => setEditedDoc({ ...editedDoc, dateOfResolution: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Committee Members Section */}
                                {showCommitteeSection && (
                                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-700 dark:bg-gray-800/30">
                                        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200">
                                            <Users className="h-5 w-5" />
                                            Committee Members
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-700/50">
                                                <input
                                                    type="checkbox"
                                                    checked={includeChairperson}
                                                    onChange={() => handleCheckboxChange("chairperson")}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={isSubmitting}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Chairperson(s)</span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-700/50">
                                                <input
                                                    type="checkbox"
                                                    checked={includeViceChairperson}
                                                    onChange={() => handleCheckboxChange("viceChairperson")}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={isSubmitting}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Vice Chairperson(s)</span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-700/50">
                                                <input
                                                    type="checkbox"
                                                    checked={includeAuthor}
                                                    onChange={() => handleCheckboxChange("author")}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={isSubmitting}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Author(s)</span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-700/50">
                                                <input
                                                    type="checkbox"
                                                    checked={includeMembers}
                                                    onChange={() => handleCheckboxChange("members")}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={isSubmitting}
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Members</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Committee Dropdowns */}
                                {showCommitteeSection && includeChairperson && (
                                    <CommitteeMemberDropdown
                                        label="Chairperson"
                                        selectedItems={chairpersons}
                                        customValue={customChairperson}
                                        onToggle={handleChairpersonToggle}
                                        onClearAll={clearAllChairpersons}
                                        onAddCustom={addCustomChairperson}
                                        isOpen={isChairpersonDropdownOpen}
                                        setIsOpen={setIsChairpersonDropdownOpen}
                                        dropdownRef={chairpersonDropdownRef}
                                        isMultiple={true}
                                    />
                                )}

                                {showCommitteeSection && includeViceChairperson && (
                                    <CommitteeMemberDropdown
                                        label="Vice Chairperson"
                                        selectedItems={viceChairpersons}
                                        customValue={customViceChairperson}
                                        onToggle={handleViceChairpersonToggle}
                                        onClearAll={clearAllViceChairpersons}
                                        onAddCustom={addCustomViceChairperson}
                                        isOpen={isViceChairpersonDropdownOpen}
                                        setIsOpen={setIsViceChairpersonDropdownOpen}
                                        dropdownRef={viceChairpersonDropdownRef}
                                        isMultiple={true}
                                    />
                                )}

                                {showCommitteeSection && includeAuthor && (
                                    <CommitteeMemberDropdown
                                        label="Author"
                                        selectedItems={authors}
                                        customValue={customAuthor}
                                        onToggle={handleAuthorToggle}
                                        onClearAll={clearAllAuthors}
                                        onAddCustom={addCustomAuthor}
                                        isOpen={isAuthorDropdownOpen}
                                        setIsOpen={setIsAuthorDropdownOpen}
                                        dropdownRef={authorDropdownRef}
                                        isMultiple={true}
                                    />
                                )}

                                {showCommitteeSection && includeMembers && (
                                    <CommitteeMemberDropdown
                                        label="Committee Members"
                                        selectedItems={members}
                                        customValue=""
                                        onToggle={handleMemberToggle}
                                        onClearAll={clearAllMembers}
                                        onAddCustom={() => {}}
                                        isOpen={isMembersDropdownOpen}
                                        setIsOpen={setIsMembersDropdownOpen}
                                        dropdownRef={membersDropdownRef}
                                        isMultiple={true}
                                    />
                                )}

                                {/* Summary */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Summary
                                    </label>
                                    <textarea
                                        value={editedDoc.summary || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, summary: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        rows={3}
                                        disabled={isSubmitting}
                                        placeholder="Enter document summary"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="sticky bottom-0 mt-6 flex justify-end gap-3 border-t border-gray-200 bg-white pt-5 dark:border-gray-700 dark:bg-gray-800">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EditDocumentModal;