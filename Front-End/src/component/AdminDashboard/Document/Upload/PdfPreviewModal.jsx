import React from "react";
import { FiX, FiUploadCloud, FiEye } from "react-icons/fi";

const PdfPreviewModal = ({
  showPdfModal,
  setShowPdfModal,
  pdfPreviewUrl,
  setPdfPreviewUrl,
  isPdfLoading,
  title,
  selectedFile,
  fileInputRef,
  handleFinalSubmit,
  isLoading
}) => {
  if (!showPdfModal) return null;

  const handleClose = () => {
    setShowPdfModal(false);
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl("");
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Confirm Document Upload</h3>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          <p className="mb-4 text-gray-600 dark:text-gray-300">Please review your document before final submission.</p>

          <div className="mb-4 rounded-lg border bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-700/30">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <FiEye size={18} />
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">{title || "Untitled Document"}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedFile?.name} • {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 h-[60vh] overflow-hidden rounded-lg border bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
            {isPdfLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading document preview...</p>
                </div>
              </div>
            ) : (
              <iframe
                src={pdfPreviewUrl}
                title="PDF Preview"
                width="100%"
                height="100%"
                className="h-full w-full"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <FiX size={18} />
              Cancel
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPdfModal(false);
                  fileInputRef.current?.click();
                }}
                className="flex items-center gap-2 rounded-lg border border-blue-500 bg-blue-50 px-4 py-2.5 font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                <FiUploadCloud size={18} />
                {isLoading ? "Uploading..." : "Confirm Upload"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;