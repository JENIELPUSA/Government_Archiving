import React, { useContext, useMemo, useRef, useEffect, useState } from "react";
import { ZoomIn, ZoomOut, Printer, ArrowLeft, ArrowRight, Download, CheckCircle, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import { AuthContext } from "../../contexts/AuthContext";

// Initialize PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

const Sidebar = ({
  onPrint,
  onZoomIn,
  onZoomOut,
  onSave,
  onDownload,
  scale,
  numPages,
  pageNumber,
  setPageNumber,
  fileUrl,
  fileData,
  ApprovedReview,
  isLoading = false,
}) => {
  const { role } = useContext(AuthContext);
  const previewLimit = 20;
  
  const isDocumentLoading = isLoading;
  const isDocumentLoaded = fileUrl && numPages > 0;
  
  // Track mounted state for cleanup
  const isMountedRef = useRef(true);
  const [previewError, setPreviewError] = useState(false);

  // Compute current batch based on pageNumber
  const pagesToRender = useMemo(() => {
    if (!numPages) return [];
    const currentBatch = Math.floor((pageNumber - 1) / previewLimit);
    const startPage = currentBatch * previewLimit + 1;
    const endPage = Math.min(startPage + previewLimit - 1, numPages);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [pageNumber, numPages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Reset preview error when fileUrl changes
  useEffect(() => {
    setPreviewError(false);
  }, [fileUrl]);

  const handlePagePreviewClick = (pageIndex) => {
    if (isDocumentLoading || !isDocumentLoaded || previewError) return;
    setPageNumber(pageIndex);
  };

  const handlePreviousPage = () => {
    if (isDocumentLoading || !isDocumentLoaded) return;
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (isDocumentLoading || !isDocumentLoaded) return;
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const canApproveReject = role !== "admin" &&
    (role === "officer" || fileData?.status === "Pending") &&
    fileData?.status !== "Rejected" &&
    fileData?.status !== "Approved";

  // Handle document load error
  const handleDocumentLoadError = (error) => {
    console.error("Document load error:", error);
    if (isMountedRef.current) {
      setPreviewError(true);
    }
  };

  return (
    <nav className="print-hidden left-0 top-0 flex h-full w-full flex-col gap-4 overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white/60 p-4 text-black backdrop-blur-md dark:bg-slate-800/50 dark:text-white dark:backdrop-blur-md">
      {/* Loading State */}
      {isDocumentLoading && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Loading document...
            </span>
          </div>
        </div>
      )}

      {/* Document Ready */}
      {isDocumentLoaded && !isDocumentLoading && !previewError && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Document ready
            </span>
          </div>
        </div>
      )}

      {/* Preview Error State */}
      {previewError && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Preview unavailable
            </span>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onZoomIn} 
            disabled={isDocumentLoading || !isDocumentLoaded || previewError}
            className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button 
            onClick={onZoomOut} 
            disabled={isDocumentLoading || !isDocumentLoaded || previewError}
            className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
        </div>
        <span className="rounded-full bg-gray-200 px-3 py-1 text-center text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-white">
          Zoom: {(scale * 100).toFixed(0)}%
        </span>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
          <button
            onClick={handlePreviousPage}
            disabled={pageNumber <= 1 || isDocumentLoading || !isDocumentLoaded || previewError}
            className="flex items-center justify-center px-2 py-1 text-black disabled:opacity-50 disabled:cursor-not-allowed dark:text-white transition-all"
            title={isDocumentLoading ? "Document loading..." : "Previous Page"}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-black dark:text-white">
            Page {pageNumber} of {numPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= numPages || isDocumentLoading || !isDocumentLoaded || previewError}
            className="flex items-center justify-center px-2 py-1 text-black disabled:opacity-50 disabled:cursor-not-allowed dark:text-white transition-all"
            title={isDocumentLoading ? "Document loading..." : "Next Page"}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="grid w-full grid-cols-2 gap-2">
        {/* Download Button */}
        <button 
          onClick={onDownload} 
          disabled={isDocumentLoading || !isDocumentLoaded || previewError}
          className="flex items-center justify-center rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
          title="Download PDF"
        >
          <Download className="h-5 w-5" />
        </button>

        {/* Print Button */}
        <button 
          onClick={onPrint} 
          disabled={isDocumentLoading || !isDocumentLoaded || previewError}
          className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all" 
          title="Print"
        >
          <Printer className="h-5 w-5" />
        </button>

        {/* Approve/Reject Button */}
        {canApproveReject && (
          <button
            onClick={ApprovedReview}
            disabled={isDocumentLoading || !isDocumentLoaded || previewError}
            className="flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all col-span-2"
            title="Approve/Reject Document"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Review Document
          </button>
        )}
      </div>

      {/* Page Previews */}
      <div className="mt-4 flex flex-col gap-2 flex-1 min-h-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-black dark:text-white">
            Page Previews
          </h3>
          {isDocumentLoaded && !isDocumentLoading && !previewError && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {pagesToRender[0]}-{pagesToRender[pagesToRender.length - 1]} of {numPages}
            </span>
          )}
        </div>
        
        {isDocumentLoading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center p-4 flex-1">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading page previews...</p>
          </div>
        ) : previewError ? (
          // Error State
          <div className="flex flex-col items-center justify-center p-4 flex-1">
            <div className="text-center">
              <p className="text-sm text-red-500 dark:text-red-400 mb-2">Preview unavailable</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Page previews cannot be loaded
              </p>
            </div>
          </div>
        ) : isDocumentLoaded ? (
          // Loaded State - Improved Layout
          <div className="flex-1 min-h-0">
            <div className="h-full overflow-y-auto pr-1">
              <div className="space-y-2">
                <Document 
                  file={fileUrl} 
                  onLoadError={handleDocumentLoadError}
                  loading={
                    <div className="flex flex-col items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400 mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">Loading previews...</p>
                    </div>
                  }
                  noData={
                    <div className="flex flex-col items-center justify-center p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No preview available</p>
                    </div>
                  }
                >
                  {pagesToRender.map((pageIndex) => (
                    <div
                      key={pageIndex}
                      className={`relative rounded-lg border transition-all duration-200 ease-in-out cursor-pointer hover:scale-[1.01] hover:shadow-md overflow-hidden group ${
                        pageNumber === pageIndex
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                          : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      onClick={() => handlePagePreviewClick(pageIndex)}
                      title={`Go to page ${pageIndex}`}
                    >
                      <div className="p-2">
                        <div className="flex justify-center mb-1">
                          <div className="relative w-full max-w-[140px] min-h-[80px] bg-gray-50 dark:bg-gray-700/50 rounded overflow-hidden flex items-center justify-center">
                            <Page
                              pageNumber={pageIndex}
                              scale={0.1}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              className="max-w-full max-h-full object-contain"
                              loading={
                                <div className="flex items-center justify-center h-full w-full">
                                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                </div>
                              }
                              error={
                                <div className="flex items-center justify-center h-full w-full">
                                  <span className="text-xs text-gray-400">Preview error</span>
                                </div>
                              }
                            />
                          </div>
                        </div>
                        <div className={`text-center py-1 px-2 rounded ${
                          pageNumber === pageIndex 
                            ? "bg-blue-100 dark:bg-blue-900/30" 
                            : "bg-gray-100 dark:bg-gray-700/50"
                        }`}>
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            Page {pageIndex}
                          </p>
                        </div>
                      </div>
                      
                      {/* Active page indicator */}
                      {pageNumber === pageIndex && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      )}
                    </div>
                  ))}
                </Document>
              </div>
            </div>
          </div>
        ) : (
          // No Document
          <div className="flex flex-col items-center justify-center p-4 flex-1">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 mx-auto">
                <Loader2 className="h-5 w-5 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">No document loaded</p>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;