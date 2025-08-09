import React, { useState, useEffect, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import { FileText, Folder, File, User, X, Save } from "lucide-react";

const EditDocumentModal = ({ show, document, onSave, onClose }) => {
  const { isSBMember } = useContext(SbMemberDisplayContext);
  const { UpdateFiles } = useContext(FilesDisplayContext);
  const { isCategory } = useContext(CategoryContext);
  const [editedDoc, setEditedDoc] = useState({});

  const normalizeCategory = useCallback((doc) => {
    if (!doc) return {};
    const categoryValue =
      typeof doc.category === "string"
        ? doc.category
        : doc.category?.categoryName || "";
    return {
      ...doc,
      category: categoryValue,
    };
  }, []);

  useEffect(() => {
    setEditedDoc(normalizeCategory(document));
  }, [document, normalizeCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await UpdateFiles(editedDoc._id, editedDoc);
    console.log("Submitted Data:", editedDoc);
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Edit Document
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Field */}
              <div className="space-y-1">
                <label
                  htmlFor="editTitle"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <FileText className="h-4 w-4" />
                  Document Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="editTitle"
                    value={editedDoc.title || ""}
                    onChange={(e) =>
                      setEditedDoc({ ...editedDoc, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    required
                  />
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              {/* Category Field */}
              <div className="space-y-1">
                <label
                  htmlFor="editCategory"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <Folder className="h-4 w-4" />
                  Document Category
                </label>
                <div className="relative">
                  <select
                    id="editCategory"
                    value={editedDoc.category || ""}
                    onChange={(e) =>
                      setEditedDoc({ ...editedDoc, category: e.target.value })
                    }
                    className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    required
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {isCategory?.map((categoryItem) => (
                      <option key={categoryItem._id} value={categoryItem.category}>
                        {categoryItem.category}
                      </option>
                    ))}
                  </select>
                  <Folder className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Summary Field */}
              <div className="space-y-1">
                <label
                  htmlFor="editSummary"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <File className="h-4 w-4" />
                  Summary
                </label>
                <div className="relative">
                  <textarea
                    id="editSummary"
                    value={editedDoc.summary || ""}
                    onChange={(e) =>
                      setEditedDoc({ ...editedDoc, summary: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    rows="3"
                  />
                  <File className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>

              {/* Author Dropdown Field */}
              <div className="space-y-1">
                <label
                  htmlFor="editAuthor"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <User className="h-4 w-4" />
                  Author
                </label>
                <div className="relative">
                  <select
                    id="editAuthor"
                    value={editedDoc.author || ""}
                    onChange={(e) =>
                      setEditedDoc({ ...editedDoc, author: e.target.value })
                    }
                    className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-8 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    required
                  >
                    <option value="" disabled>
                      Select SB Member
                    </option>
                    {isSBMember?.map((member) => (
                      <option
                        key={member._id}
                        value={`${member.first_name} ${member.last_name}`}
                      >
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                  </select>
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
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
