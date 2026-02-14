import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import { FileText, Folder, File, Users, X, Save, ChevronDown, Check, UserPlus, Calendar } from "lucide-react";
import { FolderContext } from "../../../contexts/FolderContext/FolderContext.jsx";

const EditDocumentModal = ({ show, document, onClose }) => {
    const { fetchSpecificData } = useContext(FolderContext);
    const { isDropdown } = useContext(SbMemberDisplayContext);
    const { UpdateFiles } = useContext(FilesDisplayContext);
    const { isCategory } = useContext(CategoryContext);

    const [editedDoc, setEditedDoc] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Committee member states
    const [chairpersons, setChairpersons] = useState([]);
    const [viceChairpersons, setViceChairpersons] = useState([]);
    const [members, setMembers] = useState([]);

    // Custom entries
    const [customChairperson, setCustomChairperson] = useState("");
    const [customViceChairperson, setCustomViceChairperson] = useState("");

    // Checkbox states
    const [includeChairperson, setIncludeChairperson] = useState(false);
    const [includeViceChairperson, setIncludeViceChairperson] = useState(false);
    const [includeMembers, setIncludeMembers] = useState(false);

    // Dropdown visibility
    const [isChairpersonDropdownOpen, setIsChairpersonDropdownOpen] = useState(false);
    const [isViceChairpersonDropdownOpen, setIsViceChairpersonDropdownOpen] = useState(false);
    const [isMembersDropdownOpen, setIsMembersDropdownOpen] = useState(false);

    // Refs for dropdown click outside
    const chairpersonDropdownRef = useRef(null);
    const viceChairpersonDropdownRef = useRef(null);
    const membersDropdownRef = useRef(null);

    // **FIXED: Simplified click outside handler**
    useEffect(() => {
        // Create the handler function
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

        // Safely add event listener
        if (typeof window !== "undefined" && document && document.addEventListener) {
            document.addEventListener("mousedown", handleClickOutside);

            // Cleanup function
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }

        // Return empty cleanup if not in browser
        return () => {};
    }, []);

    const normalizeDoc = useCallback((doc) => {
        if (!doc) return {};

        // Extract committee members from document
        let chairpersonsArray = [];
        let viceChairpersonsArray = [];
        let membersArray = [];
        let customChairpersonValue = "";
        let customViceChairpersonValue = "";
        let includeChairpersonFlag = false;
        let includeViceChairpersonFlag = false;
        let includeMembersFlag = false;

        // Handle chairpersons
        if (doc.chairpersons && Array.isArray(doc.chairpersons)) {
            if (doc.chairpersons.length > 0) {
                includeChairpersonFlag = true;
                // Check if first item is a string name
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

        // Handle members
        if (doc.members && Array.isArray(doc.members)) {
            if (doc.members.length > 0) {
                includeMembersFlag = true;
                doc.members.forEach((member) => {
                    if (typeof member === "string") {
                        // String name - treat as custom
                        // We'll need to match with dropdown or store as custom
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
            members: membersArray,
            customChairperson: customChairpersonValue,
            customViceChairperson: customViceChairpersonValue,
            includeChairperson: includeChairpersonFlag,
            includeViceChairperson: includeViceChairpersonFlag,
            includeMembers: includeMembersFlag,
        };
    }, []);

    useEffect(() => {
        if (document && show) {
            const normalized = normalizeDoc(document);
            setEditedDoc(normalized);

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

            const memberIds = normalized.members.filter((member) => !member.custom).map((member) => member._id || member.id || member);
            setMembers(memberIds);

            setIncludeChairperson(normalized.includeChairperson || false);
            setIncludeViceChairperson(normalized.includeViceChairperson || false);
            setIncludeMembers(normalized.includeMembers || false);
        }
    }, [document, show, normalizeDoc]);

    // Check if document is resolution or ordinance
    const selectedCategory = isCategory?.find((cat) => cat._id === editedDoc.category);
    const isResolution = selectedCategory?.category === "Resolution";
    const isOrdinance = selectedCategory?.category === "Ordinance";
    const showCommitteeSection = isResolution || isOrdinance;

    // Auto-disable committee fields if not resolution/ordinance
    useEffect(() => {
        if (!showCommitteeSection) {
            setIncludeChairperson(false);
            setIncludeViceChairperson(false);
            setIncludeMembers(false);
            setChairpersons([]);
            setViceChairpersons([]);
            setMembers([]);
            setCustomChairperson("");
            setCustomViceChairperson("");
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

    const clearAllChairpersons = () => {
        setChairpersons([]);
        setCustomChairperson("");
    };

    const clearAllViceChairpersons = () => {
        setViceChairpersons([]);
        setCustomViceChairperson("");
    };

    const clearAllMembers = () => {
        setMembers([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simple arrays for IDs - NO JSON.stringify with complex objects
            const chairpersonsPayload = includeChairperson ? (customChairperson ? customChairperson : chairpersons) : null;

            const viceChairpersonsPayload = includeViceChairperson ? (customViceChairperson ? customViceChairperson : viceChairpersons) : null;

            const membersPayload = includeMembers ? members : null;

            const payload = {
                title: editedDoc.title || "",
                category: editedDoc.category || "",
                summary: editedDoc.summary || "",
                resolutionNumber: editedDoc.resolutionNumber || "",
                dateOfResolution: editedDoc.dateOfResolution || null,
            };

            // Add committee members as simple arrays or strings
            if (chairpersonsPayload) {
                if (Array.isArray(chairpersonsPayload)) {
                    payload.chairpersons = chairpersonsPayload; // Array of IDs
                } else {
                    payload.chairpersons = [chairpersonsPayload]; // Custom name as array with single string
                }
            }

            if (viceChairpersonsPayload) {
                if (Array.isArray(viceChairpersonsPayload)) {
                    payload.viceChairpersons = viceChairpersonsPayload; // Array of IDs
                } else {
                    payload.viceChairpersons = [viceChairpersonsPayload]; // Custom name as array with single string
                }
            }

            if (membersPayload) {
                payload.members = membersPayload; // Array of IDs
            }

            // Remove empty fields from payload
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

            // Directly send the payload to context
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
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>

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
                        className={`flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2.5 text-left text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200`}
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
                        <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isOpen && (
                        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
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
                    className="fixed inset-0 z-[999] flex items-center justify-center bg-gray-900 bg-opacity-40 p-4 backdrop-blur"
                >
                    <motion.div
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
                    >
                        <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Document</h3>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className={`rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="max-h-[70vh] space-y-4 overflow-y-auto pr-2"
                        >
                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <FileText className="h-4 w-4" /> Document Title
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={editedDoc.title || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, title: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        required
                                        rows={2}
                                        disabled={isSubmitting}
                                    />
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Folder className="h-4 w-4" /> Document Category
                                </label>
                                <div className="relative">
                                    <select
                                        value={editedDoc.category || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, category: e.target.value })}
                                        className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select a category</option>
                                        {isCategory?.map((categoryItem) => (
                                            <option
                                                key={categoryItem._id}
                                                value={categoryItem._id}
                                            >
                                                {categoryItem.category}
                                            </option>
                                        ))}
                                    </select>
                                    <Folder className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            {showCommitteeSection && (
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <FileText className="h-4 w-4" /> Resolution No.
                                    </label>
                                    <input
                                        type="text"
                                        value={editedDoc.resolutionNumber || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, resolutionNumber: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        placeholder="e.g., 2024-001"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            )}

                            {showCommitteeSection && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/30">
                                    <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Committee Members</h3>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={includeChairperson}
                                                onChange={() => handleCheckboxChange("chairperson")}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Chairperson(s)</span>
                                        </label>

                                        <label className="flex cursor-pointer items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={includeViceChairperson}
                                                onChange={() => handleCheckboxChange("viceChairperson")}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                disabled={isSubmitting}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Vice Chairperson(s)</span>
                                        </label>

                                        <label className="flex cursor-pointer items-center gap-2">
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

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <File className="h-4 w-4" /> Summary
                                </label>
                                <div className="relative">
                                    <textarea
                                        value={editedDoc.summary || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, summary: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        rows={3}
                                        disabled={isSubmitting}
                                    />
                                    <File className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-4 w-4" /> Date of Resolution
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={editedDoc.dateOfResolution ? new Date(editedDoc.dateOfResolution).toISOString().split("T")[0] : ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, dateOfResolution: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700 ${isSubmitting ? "cursor-not-allowed opacity-50" : ""}`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg
                                                className="h-4 w-4 animate-spin text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v8H4z"
                                                ></path>
                                            </svg>
                                            Saving...
                                        </span>
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
