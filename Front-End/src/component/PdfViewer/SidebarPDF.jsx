import React, { useContext } from "react";
import { ZoomIn, ZoomOut, Printer, ArrowLeft, ArrowRight, Download, CheckCircle } from "lucide-react";
import { Document, Page } from "react-pdf";
import { AuthContext } from "../../contexts/AuthContext";
const Sidebar = ({
    onPrint,
    onZoomIn,
    onZoomOut,
    onDownload,
    scale,
    numPages,
    pageNumber,
    setPageNumber,
    fileUrl,
    fileData,
    ApprovedReview,
}) => {
    const { role } = useContext(AuthContext);

    return (
        <nav className="print-hidden left-0 top-0 mb-8 flex max-h-[100vh] w-64 flex-col gap-4 overflow-y-auto rounded-[2rem] border-r bg-white/60 p-4 text-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] backdrop-blur-md dark:border-blue-700 dark:bg-slate-800/50 dark:text-white dark:backdrop-blur-md">
            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={onZoomIn}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        title="Zoom In"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onZoomOut}
                        className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
                        onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                        disabled={pageNumber <= 1}
                        className="flex items-center justify-center px-2 py-1 text-black disabled:opacity-50 dark:text-white"
                        title="Previous Page"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-black dark:text-white">
                        Page {pageNumber} of {numPages || 1}
                    </span>
                    <button
                        onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
                        disabled={pageNumber >= numPages}
                        className="flex items-center justify-center px-2 py-1 text-black disabled:opacity-50 dark:text-white"
                        title="Next Page"
                    >
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2">
                <button
                    onClick={onDownload}
                    className="flex items-center justify-center rounded-lg bg-yellow-600 px-4 py-2 text-white hover:bg-yellow-700"
                    title="Download"
                >
                    <Download className="h-5 w-5" />
                </button>

                <button
                    onClick={onPrint}
                    className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-yellow-700"
                    title="Download"
                >
                    <Printer className="h-5 w-5" />
                </button>

                {role !== "admin" &&
                    (role === "officer" || fileData.status === "Pending") &&
                    fileData.status !== "Rejected" &&
                    fileData.status !== "Approved" && (
                        <button
                            onClick={ApprovedReview}
                            className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            title="Done Review"
                        >
                            <CheckCircle className="h-5 w-5" />
                        </button>
                    )}
            </div>
            <div className="mt-4 flex max-h-[50vh] flex-col items-center gap-2 overflow-y-auto">
                <h3 className="text-center text-sm font-medium text-black dark:text-white">Page Previews</h3>
                {fileUrl && numPages > 0 && (
                    <Document
                        file={fileUrl}
                        onLoadError={(err) => console.error("PDF preview load error:", err)}
                    >
                        {Array.from({ length: numPages }, (_, index) => (
                            <div
                                key={index}
                                className={`cursor-pointer rounded-md p-1 transition-all duration-200 ease-in-out ${
                                    pageNumber === index + 1
                                        ? "bg-blue-600 text-white"
                                        : "hover:scale-[1.02] hover:bg-gray-200 hover:shadow-md hover:dark:bg-gray-700"
                                }`}
                                onClick={() => setPageNumber(index + 1)}
                            >
                                <Page
                                    pageNumber={index + 1}
                                    scale={0.2}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="border border-gray-600"
                                />
                                <p className="mt-1 text-center text-xs text-black dark:text-white">Page {index + 1}</p>
                            </div>
                        ))}
                    </Document>
                )}
            </div>
        </nav>
    );
};

export default Sidebar;
