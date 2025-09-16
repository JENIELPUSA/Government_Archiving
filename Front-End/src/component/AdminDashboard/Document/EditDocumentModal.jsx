import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import { FileText, Folder, File, User, X, Save } from "lucide-react";

const EditDocumentModal = ({ show, document, onClose }) => {
    const { isDropdown } = useContext(SbMemberDisplayContext);
    const { UpdateFiles } = useContext(FilesDisplayContext);
    const { isCategory } = useContext(CategoryContext);

    const [editedDoc, setEditedDoc] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false); // loading state

    const normalizeDoc = useCallback((doc) => {
        if (!doc) return {};

        let authorId = "";
        if (doc.author && typeof doc.author === "object") {
            authorId = doc.author._id;
        } else {
            authorId = doc.author || "";
        }

        let categoryId = "";
        if (doc.category && typeof doc.category === "object") {
            categoryId = doc.category._id;
        } else {
            categoryId = doc.category || "";
        }

        return {
            ...doc,
            category: categoryId,
            author: authorId,
            dateOfResolution: doc.dateOfResolution || "",
        };
    }, []);

    useEffect(() => {
        setEditedDoc(normalizeDoc(document));
    }, [document, normalizeDoc]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // start loading

        const payload = {
            ...editedDoc,
            categoryID: editedDoc.category,
            dateOfResolution: editedDoc.dateOfResolution || null,
        };
        await UpdateFiles(editedDoc._id, payload);
        setIsSubmitting(false); // stop loading
        onClose();
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
                        {/* Header */}
                        <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Document</h3>
                            </div>
                            <button
                                onClick={onClose}
                                disabled={isSubmitting}
                                className={`rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Title */}
                            <div className="space-y-1">
                                <label htmlFor="editTitle" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <FileText className="h-4 w-4" /> Document Title
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="editTitle"
                                        value={editedDoc.title || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, title: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        required
                                        rows={3}
                                    />
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            {/* Category */}
                            <div className="space-y-1">
                                <label htmlFor="editCategory" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Folder className="h-4 w-4" /> Document Category
                                </label>
                                <div className="relative">
                                    <select
                                        id="editCategory"
                                        value={editedDoc.category || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, category: e.target.value })}
                                        className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        required
                                        disabled={isSubmitting} // disable while submitting
                                    >
                                        {document?.categoryID && (
                                            <option value={document.categoryID} hidden>
                                                {isCategory.find((c) => c._id === document.categoryID)?.category || "Select a category"}
                                            </option>
                                        )}
                                        {isCategory?.map((categoryItem) => (
                                            <option key={categoryItem._id} value={categoryItem._id}>
                                                {categoryItem.category}
                                            </option>
                                        ))}
                                    </select>
                                    <Folder className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="space-y-1">
                                <label htmlFor="editSummary" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <File className="h-4 w-4" /> Summary
                                </label>
                                <div className="relative">
                                    <textarea
                                        id="editSummary"
                                        value={editedDoc.summary || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, summary: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        rows={3}
                                    />
                                    <File className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            {/* Author */}
                            <div className="space-y-1">
                                <label htmlFor="editAuthor" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <User className="h-4 w-4" /> Author
                                </label>
                                <div className="relative">
                                    <select
                                        id="editAuthor"
                                        value={editedDoc.author || ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, author: e.target.value })}
                                        className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        disabled={isSubmitting} // disable while submitting
                                    >
                                        <option value="">No Author</option>
                                        {isDropdown?.map((member) => (
                                            <option key={member._id} value={member._id}>
                                                {member.full_name}
                                            </option>
                                        ))}
                                    </select>
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                </div>
                            </div>

                            {/* Date of Resolution */}
                            <div className="space-y-1">
                                <label htmlFor="editDateOfResolution" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    📅 Date of Resolution
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        id="editDateOfResolution"
                                        value={editedDoc.dateOfResolution ? new Date(editedDoc.dateOfResolution).toISOString().split("T")[0] : ""}
                                        onChange={(e) => setEditedDoc({ ...editedDoc, dateOfResolution: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                        disabled={isSubmitting} // disable while submitting
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700 ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg
                                                className="animate-spin h-4 w-4 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
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
