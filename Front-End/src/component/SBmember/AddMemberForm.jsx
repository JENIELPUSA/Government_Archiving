import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

function AddMemberForm({ onAddMember, onClose, memberToEdit, avatar, existingMembers = [], yearterm }) {
    const [newMember, setNewMember] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        detailInfo: "",
        position: "",
        subPosition: "",
        district: "",
        term_from: "",
        term_to: "",
        term: "",
        priorityNumber: "",
        avatar: null,
        preview: null,
        isExOfficial: false,
        selectedYearTermData: null,
    });


    console.log("memberToEdit",memberToEdit)


    const [isLoading, setIsLoading] = useState(false);
    const [positionInput, setPositionInput] = useState("");
    const [priorityError, setPriorityError] = useState("");
    const [termError, setTermError] = useState("");
    const [positionError, setPositionError] = useState("");
    const [selectedYearTerm, setSelectedYearTerm] = useState("");
    const fileInputRef = useRef(null);
    const positionInputRef = useRef(null);

    const usedPriorities = existingMembers
        .filter(m => m.priorityNumber && (!memberToEdit || m._id !== memberToEdit._id))
        .map(m => m.priorityNumber);

    const startsWithEx = (input) => {
        if (!input) return false;
        const lowerInput = input.toLowerCase().trim();
        return lowerInput.startsWith("ex");
    };

    const validatePosition = (input, isExOfficialChecked) => {
        if (isExOfficialChecked) {
            setPositionError("");
            return true;
        }

        if (startsWithEx(input)) {
            setPositionError("Position cannot start with 'ex' (e.g., Ex-Officio, Ex-Official, etc.). Use the Ex-Official checkbox instead.");
            return false;
        }

        setPositionError("");
        return true;
    };

    const parsePositionAndSubPosition = (input) => {
        if (!input) return { position: "", subPosition: "" };
        
        if (input.includes(",")) {
            const parts = input.split(",").map(part => part.trim());
            const mainPosition = parts[0];
            const subPosition = parts[1] || "";
            return { position: mainPosition, subPosition: subPosition };
        }
        
        return { position: input, subPosition: "" };
    };

    const standardizePosition = (input) => {
        if (!input) return "";

        const lowerInput = input.toLowerCase().trim();

        if (lowerInput.includes("vice") && lowerInput.includes("governor")) {
            return "Vice_Governor";
        }
        if (lowerInput.includes("vicegovernor")) {
            return "Vice_Governor";
        }
        if (lowerInput === "vice gov" || lowerInput === "vice-gov") {
            return "Vice_Governor";
        }
        if (lowerInput.includes("vice") && !lowerInput.includes("governor")) {
            return "Vice_Governor";
        }
        if (lowerInput === "governor" || lowerInput === "gov") {
            return "Governor";
        }
        if (lowerInput.includes("governor") && !lowerInput.includes("vice")) {
            return "Governor";
        }
        if (lowerInput.includes("board") || lowerInput.includes("bm") || lowerInput.includes("boardmember")) {
            return "Board_Member";
        }
        if (lowerInput.includes("board member") || lowerInput.includes("board-member")) {
            return "Board_Member";
        }

        return input
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const validateTermDates = (termFrom, termTo) => {
        if (!termFrom || !termTo) {
            setTermError("Both Term From and Term To are required");
            return false;
        }

        const fromDate = new Date(termFrom);
        const toDate = new Date(termTo);

        if (toDate <= fromDate) {
            setTermError("Term To date must be after Term From date");
            return false;
        }

        setTermError("");
        return true;
    };

    const handleTermDateChange = (name, value) => {
        setNewMember((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "term_from") {
            validateTermDates(value, newMember.term_to);
        } else if (name === "term_to") {
            validateTermDates(newMember.term_from, value);
        }
    };

    const handleYearTermSelect = (value) => {
        setSelectedYearTerm(value);
        if (value && yearterm && yearterm.length > 0) {
            const selectedTerm = yearterm.find(term => `${term.year_from}-${term.year_to}` === value);
            if (selectedTerm) {
                setNewMember((prev) => ({
                    ...prev,
                    selectedYearTermData: selectedTerm,
                }));
            }
        } else {
            setNewMember((prev) => ({
                ...prev,
                selectedYearTermData: null,
            }));
        }
    };

    useEffect(() => {
        if (memberToEdit) {
            setNewMember({
                first_name: memberToEdit.memberInfo?.first_name || memberToEdit.first_name || "",
                middle_name: memberToEdit.memberInfo?.middle_name || memberToEdit.middle_name || "",
                last_name: memberToEdit.memberInfo?.last_name || memberToEdit.last_name || "",
                detailInfo: memberToEdit.detailInfo || "",
                position: memberToEdit.Position || "",
                subPosition: memberToEdit.SubPosition || "",
                term: memberToEdit.memberInfo?.term || memberToEdit.term || "",
                district: memberToEdit.district || memberToEdit.district || "",
                term_from: memberToEdit.memberInfo?.term_from || memberToEdit.term_from || "",
                term_to: memberToEdit.memberInfo?.term_to || memberToEdit.term_to || "",
                priorityNumber: memberToEdit.priorityNumber || memberToEdit.priorityNumber || "",
                avatar: null,
                preview: avatar || null,
                isExOfficial: memberToEdit.isExOfficial || false,
                selectedYearTermData: memberToEdit.selectedYearTermData|| memberToEdit.selectedYearTermData || null,
            });

            if (memberToEdit.isExOfficial) {
                const displayValue = memberToEdit.SubPosition 
                    ? `${memberToEdit.Position || "Ex-Officio"}, ${memberToEdit.SubPosition}`
                    : memberToEdit.Position || "Ex-Officio";
                setPositionInput(displayValue);
                setPositionError("");
                if (memberToEdit.selectedYearTermData) {
                    const termValue = `${memberToEdit.selectedYearTermData.year_from}-${memberToEdit.selectedYearTermData.year_to}`;
                    setSelectedYearTerm(termValue);
                }
            } else {
                const displayValue = memberToEdit.SubPosition 
                    ? `${memberToEdit.Position || ""}, ${memberToEdit.SubPosition}`
                    : memberToEdit.Position || "";
                setPositionInput(displayValue);
                if (memberToEdit.Position) {
                    validatePosition(memberToEdit.Position, false);
                }
            }

            if (memberToEdit.memberInfo?.term_from && memberToEdit.memberInfo?.term_to) {
                validateTermDates(memberToEdit.memberInfo.term_from, memberToEdit.memberInfo.term_to);
            }
        } else {
            setNewMember({
                first_name: "",
                middle_name: "",
                last_name: "",
                detailInfo: "",
                position: "",
                subPosition: "",
                district: "",
                term_from: "",
                term_to: "",
                term: "",
                priorityNumber: "",
                avatar: null,
                preview: null,
                isExOfficial: false,
                selectedYearTermData: null,
            });
            setPositionInput("");
            setPriorityError("");
            setTermError("");
            setPositionError("");
            setSelectedYearTerm("");
        }
    }, [memberToEdit, avatar]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            if (checked) {
                setNewMember((prev) => ({
                    ...prev,
                    [name]: checked,
                    position: "Ex-Officio",
                    subPosition: "",
                }));
                setPositionInput("Ex-Officio");
                setPositionError("");
            } else {
                setNewMember((prev) => ({
                    ...prev,
                    [name]: checked,
                    position: "",
                    subPosition: "",
                    selectedYearTermData: null,
                }));
                setPositionInput("");
                setSelectedYearTerm("");
            }
            return;
        } else if (name === "position") {
            if (newMember.isExOfficial) {
                const originalValue = positionInput;
                const newValue = value;
                
                if (!newValue.toLowerCase().includes("ex-officio") && originalValue.toLowerCase().includes("ex-officio")) {
                    const hasComma = originalValue.includes(",");
                    if (hasComma) {
                        const parts = originalValue.split(",");
                        const subPosition = parts[1] ? parts[1].trim() : "";
                        if (subPosition) {
                            setPositionInput(`Ex-Officio, ${subPosition}`);
                            setNewMember((prev) => ({
                                ...prev,
                                position: "Ex-Officio",
                                subPosition: subPosition,
                            }));
                        } else {
                            setPositionInput("Ex-Officio");
                            setNewMember((prev) => ({
                                ...prev,
                                position: "Ex-Officio",
                                subPosition: "",
                            }));
                        }
                    } else {
                        setPositionInput("Ex-Officio");
                        setNewMember((prev) => ({
                            ...prev,
                            position: "Ex-Officio",
                            subPosition: "",
                        }));
                    }
                    return;
                }
                
                setPositionInput(value);
                const { position: mainPosition, subPosition } = parsePositionAndSubPosition(value);
                const standardizedPosition = standardizePosition(mainPosition);
                
                setNewMember((prev) => ({
                    ...prev,
                    position: standardizedPosition,
                    subPosition: subPosition,
                }));
            } else {
                setPositionInput(value);
                const isValid = validatePosition(value, newMember.isExOfficial);

                if (isValid) {
                    const { position: mainPosition, subPosition } = parsePositionAndSubPosition(value);
                    const standardizedPosition = standardizePosition(mainPosition);
                    
                    setNewMember((prev) => ({
                        ...prev,
                        position: standardizedPosition,
                        subPosition: subPosition,
                    }));
                } else {
                    setNewMember((prev) => ({
                        ...prev,
                        position: "",
                        subPosition: "",
                    }));
                }
            }
        } else if (name === "priorityNumber") {
            const numValue = value === "" ? null : parseInt(value, 10);

            if (numValue !== null) {
                if (numValue < 1) {
                    setPriorityError("Priority number must be at least 1");
                } else if (usedPriorities.includes(numValue)) {
                    setPriorityError(`Priority number ${numValue} is already taken`);
                } else {
                    setPriorityError("");
                }
            } else {
                setPriorityError("");
            }

            setNewMember((prev) => ({
                ...prev,
                [name]: numValue,
            }));
        } else if (name === "term_from" || name === "term_to") {
            handleTermDateChange(name, value);
        } else {
            setNewMember((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handlePositionKeyDown = (e) => {
        if (newMember.isExOfficial) {
            const target = e.target;
            const selectionStart = target.selectionStart;
            const selectionEnd = target.selectionEnd;
            const currentValue = positionInput;
            
            if (e.key === 'Backspace' || e.key === 'Delete') {
                let wouldRemoveExOfficio = false;
                
                const exOfficioIndex = currentValue.toLowerCase().indexOf("ex-officio");
                const exOfficioLength = "Ex-Officio".length;
                
                if (exOfficioIndex !== -1) {
                    if (e.key === 'Backspace') {
                        const deleteIndex = selectionStart - 1;
                        if (deleteIndex >= exOfficioIndex && deleteIndex < exOfficioIndex + exOfficioLength) {
                            wouldRemoveExOfficio = true;
                        }
                    } else if (e.key === 'Delete') {
                        if (selectionStart >= exOfficioIndex && selectionStart < exOfficioIndex + exOfficioLength) {
                            wouldRemoveExOfficio = true;
                        }
                    }
                    
                    if (selectionStart !== selectionEnd) {
                        const selectionStartIndex = selectionStart;
                        const selectionEndIndex = selectionEnd;
                        
                        if ((selectionStartIndex < exOfficioIndex + exOfficioLength && selectionEndIndex > exOfficioIndex)) {
                            wouldRemoveExOfficio = true;
                        }
                    }
                }
                
                if (wouldRemoveExOfficio) {
                    e.preventDefault();
                }
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewMember((prev) => ({
                ...prev,
                avatar: file,
                preview: URL.createObjectURL(file),
            }));
        }
    };

    const triggerFileInput = () => {
        if (!isLoading) {
            fileInputRef.current.click();
        }
    };

    const getNextAvailablePriority = () => {
        if (existingMembers.length === 0) return 1;

        const sortedPriorities = existingMembers
            .filter(m => m.priorityNumber && (!memberToEdit || m._id !== memberToEdit._id))
            .map(m => m.priorityNumber)
            .sort((a, b) => a - b);

        let nextNumber = 1;
        for (let i = 0; i < sortedPriorities.length; i++) {
            if (sortedPriorities[i] > nextNumber) {
                break;
            }
            if (sortedPriorities[i] === nextNumber) {
                nextNumber++;
            }
        }
        return nextNumber;
    };

    const handleAutoAssignPriority = () => {
        const nextPriority = getNextAvailablePriority();
        setNewMember((prev) => ({
            ...prev,
            priorityNumber: nextPriority,
        }));
        setPriorityError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newMember.term_from || !newMember.term_to) {
            setTermError("Both Term From and Term To are required");
            return;
        }

        const fromDate = new Date(newMember.term_from);
        const toDate = new Date(newMember.term_to);

        if (toDate <= fromDate) {
            setTermError("Term To date must be after Term From date");
            return;
        }

        const rawPosition = positionInput;
        
        if (!newMember.isExOfficial && startsWithEx(rawPosition)) {
            setPositionError("Position cannot start with 'ex' (e.g., Ex-Officio, Ex-Official, etc.). Use the Ex-Official checkbox instead.");
            return;
        }

        if (!newMember.isExOfficial && (!rawPosition || rawPosition.trim() === "")) {
            setPositionError("Position is required for non Ex-Official members");
            return;
        }

        setIsLoading(true);

        try {
            const isEx = newMember.isExOfficial === true || newMember.isExOfficial === "true";

            let finalPosition = newMember.position;
            let finalSubPosition = newMember.subPosition;
            
            if (isEx) {
                if (!finalPosition) finalPosition = "Ex-Officio";
            } else {
                if (startsWithEx(rawPosition)) {
                    setPositionError("Position cannot start with 'ex'");
                    setIsLoading(false);
                    return;
                }
                if (!finalPosition && rawPosition) {
                    const { position: mainPosition, subPosition } = parsePositionAndSubPosition(rawPosition);
                    finalPosition = standardizePosition(mainPosition);
                    finalSubPosition = subPosition;
                }
            }

            const finalData = {
                first_name: newMember.first_name,
                middle_name: newMember.middle_name,
                last_name: newMember.last_name,
                detailInfo: newMember.detailInfo,
                district: newMember.district,
                Position: finalPosition,
                SubPosition: finalSubPosition || "",
                priorityNumber: newMember.priorityNumber,
                term: newMember.term,
                term_from: newMember.term_from,
                term_to: newMember.term_to,
                isExOfficial: isEx,
                avatar: newMember.avatar,
                preview: newMember.preview,
                selectedYearFrom: newMember.selectedYearTermData?.year_from || null,
                selectedYearTo: newMember.selectedYearTermData?.year_to || null,
                ...(memberToEdit && { _id: memberToEdit._id }),
            };

            await onAddMember(finalData);

        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getPositionPlaceholder = () => {
        if (newMember.isExOfficial) {
            return "Enter position (e.g., SB ex-Officio, PCL) - 'Ex-Officio' cannot be removed";
        }
        return "Enter position (cannot start with 'ex' - use checkbox for Ex-Official). Use comma for subposition (e.g., Board Member, PCL)";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ y: -50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -50, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative w-full max-w-5xl rounded-lg bg-white shadow-xl dark:bg-gray-800 overflow-hidden"
            >
                <div className="flex items-center justify-between border-b p-4 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {memberToEdit ? "Edit Member" : "Add New Member"}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className={`text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                            }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-8rem)]">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="flex flex-col gap-8 md:flex-row">
                            {/* Left Column - Avatar and Sidebar Options */}
                            <div className="flex w-full flex-col items-center md:w-1/3">
                                {/* Avatar Section */}
                                <div
                                    onClick={triggerFileInput}
                                    className={`relative mb-4 flex h-32 w-32 sm:h-40 sm:w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-200 dark:border-gray-500 dark:bg-gray-700 ${isLoading ? "cursor-not-allowed" : ""
                                        }`}
                                >
                                    {newMember.preview ? (
                                        <img
                                            src={newMember.preview}
                                            alt="Profile preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-300"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={triggerFileInput}
                                    disabled={isLoading}
                                    className={`rounded-md border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                        }`}
                                >
                                    {newMember.preview ? "Change Photo" : "Upload Photo"}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={isLoading}
                                />

                                {/* Ex-Official Checkbox */}
                                <div className="mt-6 w-full">
                                    <label className="mb-3 flex cursor-pointer items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            name="isExOfficial"
                                            checked={newMember.isExOfficial}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Ex-Officio Member
                                        </span>
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {newMember.isExOfficial
                                            ? "✓ This member is marked as an Ex-Officio member"
                                            : "☐ Check this box if this is an Ex-Officio member"}
                                    </p>
                                </div>

                                {/* Select Year Term Section - Only shows when Ex-Official is checked */}
                                {newMember.isExOfficial && (
                                    <div className="mt-6 w-full">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Select Year Term
                                        </label>
                                        <select
                                            value={selectedYearTerm}
                                            onChange={(e) => handleYearTermSelect(e.target.value)}
                                            disabled={isLoading}
                                            className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                                }`}
                                        >
                                            <option value="">Select a year term...</option>
                                            {yearterm && yearterm.map((term, index) => (
                                                <option key={index} value={`${term.year_from}-${term.year_to}`}>
                                                    {term.year_from} - {term.year_to}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedYearTerm && newMember.selectedYearTermData && (
                                            <p className="mt-1 text-xs text-green-500">
                                                ✓ Selected: {newMember.selectedYearTermData.year_from} - {newMember.selectedYearTermData.year_to}
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            ℹ️ Select the year term for this Ex-Officio member
                                        </p>
                                    </div>
                                )}

                                {/* Term Number */}
                                <div className="mt-6 w-full">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Term Number
                                    </label>
                                    <select
                                        name="term"
                                        value={newMember.term}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                            }`}
                                    >
                                        <option value="" disabled>
                                            Select Number of Term
                                        </option>
                                        <option value="1st_term">1st Term</option>
                                        <option value="2nd_term">2nd Term</option>
                                        <option value="3rd_term">3rd Term</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="w-full md:w-2/3">
                                {/* Used Priorities Info */}
                                {usedPriorities.length > 0 && (
                                    <div className="mb-6">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Used priorities: {usedPriorities.sort((a, b) => a - b).join(", ")}
                                        </p>
                                    </div>
                                )}

                                {/* Personal Details Grid */}
                                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                                    {/* First Name */}
                                    <div className="col-span-1">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={newMember.first_name}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                                }`}
                                            required
                                        />
                                    </div>

                                    {/* Middle Name */}
                                    <div className="col-span-1">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            name="middle_name"
                                            value={newMember.middle_name}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                                }`}
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div className="col-span-1">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={newMember.last_name}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                                }`}
                                            required
                                        />
                                    </div>

                                    {/* Designation/District */}
                                    <div className="col-span-1">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Designation/District
                                        </label>
                                        <input
                                            type="text"
                                            name="district"
                                            value={newMember.district}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                                }`}
                                        />
                                    </div>

                                    {/* Term From */}
                                    <div className="col-span-1">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Term From <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="term_from"
                                            value={newMember.term_from ? newMember.term_from.split('T')[0] : ""}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white 
                                                ${isLoading ? "cursor-not-allowed opacity-50" : ""}
                                                ${termError ? "border-red-500" : "border-gray-300"}`}
                                            required
                                        />
                                    </div>

                                    {/* Term To */}
                                    <div className="col-span-1">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Term To <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            name="term_to"
                                            value={newMember.term_to ? newMember.term_to.split('T')[0] : ""}
                                            onChange={handleInputChange}
                                            disabled={isLoading}
                                            className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white 
                                                ${isLoading ? "cursor-not-allowed opacity-50" : ""}
                                                ${termError ? "border-red-500" : "border-gray-300"}`}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Position and Priority Number - Side by Side */}
                                <div className="mb-6 mt-4 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                                    {/* Position Input */}
                                    <div className="col-span-1">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Position <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={positionInput}
                                            onChange={handleInputChange}
                                            onKeyDown={handlePositionKeyDown}
                                            disabled={isLoading}
                                            placeholder={getPositionPlaceholder()}
                                            className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white 
                                            ${isLoading ? "cursor-not-allowed opacity-50" : ""}
                                            ${positionError && !newMember.isExOfficial ? "border-red-500" : "border-gray-300"}
                                            ${newMember.isExOfficial ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                                            `}
                                            required={!newMember.isExOfficial}
                                            ref={positionInputRef}
                                        />
                                        {positionError && !newMember.isExOfficial && (
                                            <p className="mt-1 text-xs text-red-500">{positionError}</p>
                                        )}
                                        {newMember.subPosition && (
                                            <p className="mt-1 text-xs text-green-500">
                                                ✓ Main Position: {newMember.position} | SubPosition: {newMember.subPosition}
                                            </p>
                                        )}
                                        {!newMember.isExOfficial && !positionError && positionInput && !newMember.subPosition && (
                                            <p className="mt-1 text-xs text-green-500">
                                                ✓ Position accepted
                                            </p>
                                        )}
                                        {newMember.isExOfficial && (
                                            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                                                ⚠️ "Ex-Officio" cannot be removed from the position field
                                            </p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-400">
                                            ℹ️ Use comma (,) to separate main position and subposition (e.g., "SB ex-Officio, PCL")
                                        </p>
                                    </div>

                                    {/* Priority Number */}
                                    <div className="col-span-1">
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Priority Number
                                            <span className="ml-2 text-xs text-gray-500">(Lower = Higher)</span>
                                        </label>
                                        <div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    name="priorityNumber"
                                                    value={newMember.priorityNumber === null ? "" : newMember.priorityNumber}
                                                    onChange={handleInputChange}
                                                    disabled={isLoading}
                                                    min="1"
                                                    step="1"
                                                    placeholder="Enter priority"
                                                    className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                                        } ${priorityError ? "border-red-500" : "border-gray-300"}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAutoAssignPriority}
                                                    disabled={isLoading}
                                                    className="whitespace-nowrap rounded-md bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                                                >
                                                    Auto
                                                </button>
                                            </div>
                                            {priorityError && (
                                                <p className="mt-1 text-xs text-red-500">{priorityError}</p>
                                            )}
                                            {!priorityError && newMember.priorityNumber && (
                                                <p className="mt-1 text-xs text-green-500">
                                                    Priority {newMember.priorityNumber}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Term Error */}
                                {termError && (
                                    <div className="mt-2">
                                        <p className="text-sm text-red-500">{termError}</p>
                                    </div>
                                )}

                                {/* Additional Info */}
                                <div className="mt-6">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Additional Info
                                    </label>
                                    <textarea
                                        name="detailInfo"
                                        value={newMember.detailInfo}
                                        onChange={handleInputChange}
                                        rows="3"
                                        disabled={isLoading}
                                        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                            }`}
                                        placeholder="Enter any additional information about the member..."
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-8 flex justify-end space-x-3 sticky bottom-0 bg-white dark:bg-gray-800 py-4 border-t dark:border-gray-700 -mx-6 px-6">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={isLoading}
                                        className={`rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 ${isLoading ? "cursor-not-allowed opacity-50" : ""
                                            }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !!priorityError || !!termError || !!positionError || (!newMember.isExOfficial && !positionInput) || !newMember.term_from || !newMember.term_to}
                                        className={`rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 ${isLoading || priorityError || termError || positionError || (!newMember.isExOfficial && !positionInput) || !newMember.term_from || !newMember.term_to
                                            ? "cursor-not-allowed opacity-50"
                                            : ""
                                            }`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                {memberToEdit ? "Saving..." : "Adding..."}
                                            </span>
                                        ) : (
                                            <>{memberToEdit ? "Save Changes" : "Add Member"}</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}

export default AddMemberForm;