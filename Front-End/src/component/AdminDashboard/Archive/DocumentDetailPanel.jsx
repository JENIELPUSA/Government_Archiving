import React, { useState, useContext } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaExternalLinkAlt,
  FaTimes,
  FaUndo,
} from "react-icons/fa";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../../ReusableFolder/LoadingOverlay";
import { motion, AnimatePresence } from "framer-motion";

export const DocumentDetailsPanel = ({ document, onClose }) => {
  const { MOveArchived } = useContext(FilesDisplayContext);

  console.log("PANEL CATRGORY",document)
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handdlerestore = async (item) => {
    setIsLoading(true);
    try {
      const newStatus =
        item.ArchivedStatus === "For Restore" || item.ArchivedStatus === "Archived"
          ? "Active"
          : "For Restore";
      const result = await MOveArchived(item._id, newStatus);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error("Error restoring document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewFile = (fileId, item) => {
    if (!fileId) {
      console.error("Invalid file ID");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      navigate(`/dashboard/pdf-viewer/${fileId}`, { state: { fileData: item } });
      setIsLoading(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {document && (
        <motion.div
          key="document-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black bg-opacity-40 p-4 dark:bg-gray-900/80 backdrop-blur"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
            className="relative my-8 w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close document details"
            >
              <FaTimes size={20} />
            </button>
            <h2 className="mb-6 text-center text-3xl font-bold text-gray-800 dark:text-white md:text-left">
              Document Details
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 break-words text-2xl font-semibold text-blue-700 dark:text-blue-300">
                  {document.title || "N/A"}
                </h3>
                <p className="mb-5 leading-relaxed text-gray-600 dark:text-gray-400">
                  {document.summary || "No summary available."}
                </p>
                <div className="mb-4 flex items-center text-base text-gray-700 dark:text-gray-300">
                  <FaUser className="mr-3 text-lg text-blue-500" />
                  <strong>Author:</strong> {document.author || "N/A"}
                </div>
                <div className="mb-6 flex items-center text-base text-gray-700 dark:text-gray-300">
                  <FaCalendarAlt className="mr-3 text-lg text-blue-500" />
                  <strong>Created At:</strong>{" "}
                  {document.createdAt
                    ? new Date(document.createdAt).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="mt-6 flex flex-col flex-wrap gap-3 sm:flex-row">
                  <button
                    onClick={() => handleViewFile(document._id, document)}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-lg font-medium text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <FaExternalLinkAlt className="mr-2" /> View Document
                  </button>
                  {document.ArchivedStatus !== "Active" && (
                    <button
                      onClick={() => handdlerestore(document)}
                      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-3 text-lg font-medium text-white shadow-md transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <FaUndo className="mr-2" /> Restore
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {document.category || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {document.status || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Archived Status
                    </p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {document.ArchivedStatus || "N/A"}
                    </p>
                  </div>
                </div>

                {document.tags && document.tags.length > 0 && (
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                    <h4 className="mb-3 text-base font-medium text-gray-700 dark:text-gray-300">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-medium text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300"
                        >
                          <FaTag className="mr-1 inline-block" /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white bg-opacity-75">
                <LoadingOverlay />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
