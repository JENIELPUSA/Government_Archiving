import React, { useState } from "react";
import {
  FiX, FiFile, FiCalendar, FiTag, FiInfo,
  FiFolder, FiEdit3, FiUser, FiClock
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const dropIn = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const DocumentDetailsModal = ({ document, isVisible, onClose }) => {
  const handleClose = () => {
    onClose();
  };

  const getStatusColor = () => {
    switch (document?.status?.toLowerCase()) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "archived":
        return "bg-purple-500";
      default:
        return "bg-blue-500";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && document && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40 p-4">
          <motion.div
            variants={dropIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-[820px] max-h-[90vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {/* Header */}
            <div className="border-b border-gray-100 p-5 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                    <FiFile size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {document.fileName || "Document Details"}
                    </h3>
                    <div className="mt-1 flex items-center">
                      <div className={`mr-2 h-2 w-2 rounded-full ${getStatusColor()}`} />
                      <span className="text-sm font-medium capitalize text-gray-500 dark:text-gray-400">
                        {document.status || "Active"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Close modal"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5">
              <div>
                <SectionHeader icon={<FiInfo size={18} />} title="Document Info" />
                <div className="mt-4 space-y-4">
                  <InfoItem icon={<FiFolder size={16} />} label="Department" value={document.department} />
                  <InfoItem icon={<FiFolder size={16} />} label="Category" value={document.category} />
                  <InfoItem icon={<FiCalendar size={16} />} label="Uploaded" value={formatDate(document.createdAt)} />
                </div>
              </div>

              <div>
                <SectionHeader icon={<FiEdit3 size={18} />} title="Summary" />
                <div className="mt-4 h-40 overflow-y-auto rounded-lg bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-700/50 dark:text-gray-300">
                  {document.summary || "No summary available"}
                </div>
              </div>

              <div>
                <SectionHeader icon={<FiFile size={18} />} title="Notes & Details" />
                <div className="mt-4 space-y-4">
                  <InfoItem icon={<FiEdit3 size={16} />} label="Notes" value={document.suggestion} truncate />
                  <InfoItem icon={<FiUser size={16} />} label="Uploaded By" value={document.uploadedBy || "Unknown"} />
                  <InfoItem icon={<FiClock size={16} />} label="Last Updated" value={formatDate(document.updatedAt || document.createdAt)} />
                </div>
              </div>

              <div>
                <SectionHeader icon={<FiTag size={18} />} title="Tags" />
                {document.tags?.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">No tags assigned</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center border-b border-gray-200 pb-2 dark:border-gray-700">
    <div className="mr-2 text-blue-600 dark:text-blue-400">{icon}</div>
    <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
  </div>
);

const InfoItem = ({ icon, label, value, truncate = false }) => (
  <div>
    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
      <span className="mr-2 text-gray-400 dark:text-gray-500">{icon}</span>
      {label}
    </div>
    <p className={`mt-1 text-sm font-medium text-gray-800 dark:text-gray-200 ${truncate ? "truncate" : ""}`}>
      {value || <span className="text-gray-400 dark:text-gray-500">Not specified</span>}
    </p>
  </div>
);

export default DocumentDetailsModal;
