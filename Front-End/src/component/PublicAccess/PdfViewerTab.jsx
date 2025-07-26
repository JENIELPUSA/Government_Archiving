import React, { useState } from "react";
import ViewOnly from "../PdfViewer/ViewPdfsidebar";
import { Eye, Download, Share2, Expand, Maximize, Minimize, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PdfViewerTab({ pdf, downloadPdf, sharePdf }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [zoom] = useState(3.0); // Auto zoom-in (150%)

  const handleExpand = (item) => {
    navigate("/expand-PDF", {
      state: {
        fileData: item,
        fileId: item.id,
      },
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadPdf(pdf.fileUrl, pdf.filename);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await sharePdf(pdf.title, pdf.filename, pdf.fileUrl);
    } catch (error) {
      console.error("Sharing failed:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!pdf)
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ExternalLink className="h-12 w-12 text-gray-400" />
        </div>
        <p className="text-lg text-gray-500">No PDF selected</p>
        <p className="text-gray-400 mt-2">Select a document to view its preview</p>
      </div>
    );

  return (
    <div className="pdf-viewer-tab flex h-full flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          Preview: <span className="text-blue-600">{pdf.filename}</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600"
          >
            {isExpanded ? (
              <>
                <Minimize className="h-4 w-4 mr-1" /> Collapse
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4 mr-1" /> Expand
              </>
            )}
          </button>
        </div>
      </div>

      {/* 📄 Small preview frame */}
      {pdf.fileUrl ? (
        <div className="relative h-[400px] overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm">
          <ViewOnly fileId={pdf.id} zoom={zoom} />

          {/* Overlay expand action */}
          <div
            onClick={() => handleExpand(pdf)}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 opacity-0 transition-all duration-300 hover:opacity-100 cursor-pointer group"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center shadow-md transform transition-transform duration-300 group-hover:scale-105">
              <div className="bg-blue-100 p-2 rounded-full mb-2">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-800 text-sm">Expand to Full Screen</p>
              <p className="text-xs text-gray-600 mt-1">Click to view document in full view</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow bg-gray-50 rounded-lg border border-dashed border-gray-300 p-8">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <ExternalLink className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-lg font-medium text-gray-700">Preview Unavailable</p>
          <p className="text-gray-500 mt-2 max-w-md text-center">
            The PDF file is not available for preview. It may be restricted or not properly uploaded.
          </p>
        </div>
      )}


<div className="mt-5 flex flex-wrap justify-end gap-3">

        <button
          onClick={() => handleExpand(pdf)}
          disabled={!pdf.fileUrl}
          className={`flex items-center justify-center rounded-lg px-4 py-3 font-medium shadow-md transition-all duration-200 ${
            !pdf.fileUrl
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
          }`}
        >
          <Expand className="h-5 w-5 mr-2" />
          Full Screen
        </button>

        <button
          onClick={handleShare}
          disabled={isSharing || !pdf.fileUrl}
          className={`flex items-center justify-center rounded-lg px-4 py-3 font-medium shadow-md transition-all duration-200 ${
            isSharing || !pdf.fileUrl
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700"
          }`}
        >
          {isSharing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Sharing...
            </>
          ) : (
            <>
              <Share2 className="h-5 w-5 mr-2" />
              Share Document
            </>
          )}
        </button>
      </div>
    </div>
  );
}
