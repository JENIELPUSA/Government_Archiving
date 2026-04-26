import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Image } from "lucide-react";

function AddMemberForm({ onAddMember, onClose, memberToEdit, avatar, existingMembers = [] }) {
    const [newMember, setNewMember] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        detailInfo: "",
        position: "",
        district: "",
        term_from: "",
        term_to: "",
        term: "",
        priorityNumber: "",
        avatar: null,
        preview: null,
    });

    console.log("memberToEdit", memberToEdit);
    const [isLoading, setIsLoading] = useState(false);
    const [positionInput, setPositionInput] = useState("");
    const [priorityError, setPriorityError] = useState("");
    const [termError, setTermError] = useState("");
    const fileInputRef = useRef(null);

    // Get used priority numbers
    const usedPriorities = existingMembers
        .filter(m => m.priorityNumber && (!memberToEdit || m._id !== memberToEdit._id))
        .map(m => m.priorityNumber);

    // Function to standardize position input
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

    // Function to validate term dates
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

    // Handle term date changes
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

    useEffect(() => {
        if (memberToEdit) {
            // FIXED: Access term_from and term_to from memberInfo
            setNewMember({
                first_name: memberToEdit.memberInfo?.first_name || "",
                middle_name: memberToEdit.memberInfo?.middle_name || "",
                last_name: memberToEdit.memberInfo?.last_name || "",
                detailInfo: memberToEdit.detailInfo || "",
                position: memberToEdit.Position || "",
                term: memberToEdit.memberInfo?.term || "",
                district: memberToEdit.district || "",
                term_from: memberToEdit.memberInfo?.term_from || "",
                term_to: memberToEdit.memberInfo?.term_to || "",
                priorityNumber: memberToEdit.priorityNumber || "",
                avatar: null,
                preview: avatar || null,
            });
            setPositionInput(memberToEdit.Position || "");
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
                district: "",
                term_from: "",
                term_to: "",
                term: "",
                priorityNumber: "",
                avatar: null,
                preview: null,
            });
            setPositionInput("");
            setPriorityError("");
            setTermError("");
        }
    }, [memberToEdit, avatar]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "position") {
            setPositionInput(value);
            const standardizedValue = standardizePosition(value);
            setNewMember((prev) => ({
                ...prev,
                [name]: standardizedValue,
            }));
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

        // Validate term dates before submission
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

        // Validate priority number before submission
        if (newMember.priorityNumber !== null && usedPriorities.includes(newMember.priorityNumber)) {
            setPriorityError(`Priority number ${newMember.priorityNumber} is already taken`);
            return;
        }

        setIsLoading(true);

        try {
            // Prepare the payload with all fields explicitly defined
            const memberData = {
                // Personal Information
                first_name: newMember.first_name,
                middle_name: newMember.middle_name,
                last_name: newMember.last_name,

                // Member Details
                detailInfo: newMember.detailInfo,
                district: newMember.district,

                // Position and Priority
                Position: standardizePosition(newMember.position || positionInput),
                priorityNumber: newMember.priorityNumber,

                // Term Information
                term: newMember.term,
                term_from: newMember.term_from,
                term_to: newMember.term_to,

                // Avatar
                avatar: newMember.avatar,
                preview: newMember.preview,

                // Include ID if editing
                ...(memberToEdit && { _id: memberToEdit._id }),
            };

            // Log the complete payload for debugging
            console.log("=== Submitting Member Data from Form ===");
            console.log("Position:", memberData.Position);
            console.log("Priority Number:", memberData.priorityNumber);
            console.log("Term From:", memberData.term_from);
            console.log("Term To:", memberData.term_to);
            console.log("Full Payload:", JSON.stringify(memberData, null, 2));

            await onAddMember(memberData);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ y: -50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -50, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-gray-800"
            >
                <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {memberToEdit ? "Edit Member" : "Add New Member"}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className={`text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white ${
                            isLoading ? "cursor-not-allowed opacity-50" : ""
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

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex flex-col gap-8 md:flex-row">
                        {/* Left Column - Profile Picture & Additional Fields */}
                        <div className="flex w-full flex-col items-center md:w-1/3">
                            <div
                                onClick={triggerFileInput}
                                className={`relative mb-4 flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-200 dark:border-gray-500 dark:bg-gray-700 ${
                                    isLoading ? "cursor-not-allowed" : ""
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
                                        className="h-16 w-16 text-gray-400 dark:text-gray-300"
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
                                className={`rounded-md border border-blue-500 px-4 py-2 text-sm font-medium text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ${
                                    isLoading ? "cursor-not-allowed opacity-50" : ""
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

                            {/* Position Input */}
                            <div className="mt-6 w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Position <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="position"
                                    value={positionInput}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    placeholder="Enter position (e.g., Board Member, Governor, Vice Governor)"
                                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                        isLoading ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                    required
                                />
                            </div>

                            {/* Priority Number Selection */}
                            <div className="mt-6 w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Priority Number
                                    <span className="ml-2 text-xs text-gray-500">(Lower number = Higher priority)</span>
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="priorityNumber"
                                        value={newMember.priorityNumber === null ? "" : newMember.priorityNumber}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        min="1"
                                        step="1"
                                        placeholder="Enter priority number"
                                        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                            isLoading ? "cursor-not-allowed opacity-50" : ""
                                        } ${priorityError ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAutoAssignPriority}
                                        disabled={isLoading}
                                        className="rounded-md bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 whitespace-nowrap"
                                    >
                                        Auto Assign
                                    </button>
                                </div>
                                {priorityError && (
                                    <p className="mt-1 text-xs text-red-500">{priorityError}</p>
                                )}
                                {!priorityError && newMember.priorityNumber && (
                                    <p className="mt-1 text-xs text-green-500">
                                        Priority {newMember.priorityNumber} - Will be displayed in order
                                    </p>
                                )}
                                {usedPriorities.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Used priorities: {usedPriorities.sort((a, b) => a - b).join(", ")}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Term Selector */}
                            <div className="mt-6 w-full">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Term Number</label>
                                <select
                                    name="term"
                                    value={newMember.term}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                        isLoading ? "cursor-not-allowed opacity-50" : ""
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

                        {/* Right Column - Form Fields */}
                        <div className="w-full md:w-2/3">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                            isLoading ? "cursor-not-allowed opacity-50" : ""
                                        }`}
                                        required
                                    />
                                </div>

                                {/* Middle Name */}
                                <div className="col-span-1">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Middle Name</label>
                                    <input
                                        type="text"
                                        name="middle_name"
                                        value={newMember.middle_name}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                            isLoading ? "cursor-not-allowed opacity-50" : ""
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
                                        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                            isLoading ? "cursor-not-allowed opacity-50" : ""
                                        }`}
                                        required
                                    />
                                </div>

                                {/* Designation/District - MODIFIED: Removed required and red asterisk */}
                                <div className="col-span-1">
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        name="district"
                                        value={newMember.district}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                            isLoading ? "cursor-not-allowed opacity-50" : ""
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
                                        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                            isLoading ? "cursor-not-allowed opacity-50" : ""
                                        } ${termError ? "border-red-500" : "border-gray-300"}`}
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
                                        className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                            isLoading ? "cursor-not-allowed opacity-50" : ""
                                        } ${termError ? "border-red-500" : "border-gray-300"}`}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Term validation error message */}
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
                                    rows="4"
                                    disabled={isLoading}
                                    className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                                        isLoading ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                    placeholder="Enter any additional information about the member..."
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className={`rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 ${
                                        isLoading ? "cursor-not-allowed opacity-50" : ""
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !!priorityError || !!termError || !newMember.term_from || !newMember.term_to}
                                    className={`rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 ${
                                        isLoading || priorityError || termError || !newMember.term_from || !newMember.term_to
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
            </motion.div>
        </div>
    );
}

export default AddMemberForm;