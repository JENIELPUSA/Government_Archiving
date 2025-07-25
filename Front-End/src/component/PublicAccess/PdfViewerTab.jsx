import React, { useState } from "react";
import ViewOnly from "../PdfViewer/ViewPdfsidebar";
import { Eye, Download, Share2, Expand, Maximize, Minimize, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PdfViewerTab({ pdf, downloadPdf, sharePdf }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

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

      {pdf.fileUrl ? (
        <div className={`relative flex-grow overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm ${isExpanded ? 'h-[70vh]' : ''}`}>
          <ViewOnly fileId={pdf.id} />
          
          <div
            onClick={() => handleExpand(pdf)}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 opacity-0 transition-all duration-300 hover:opacity-100 cursor-pointer group"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 flex flex-col items-center shadow-lg transform transition-transform duration-300 group-hover:scale-105">
              <div className="bg-blue-100 p-3 rounded-full mb-3">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-800">Expand to Full Screen</p>
              <p className="text-sm text-gray-600 mt-1">Click to view document in full view</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8">
          <div className="bg-red-100 p-4 rounded-full mb-4">
            <ExternalLink className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-lg font-medium text-gray-700">Preview Unavailable</p>
          <p className="text-gray-500 mt-2 max-w-md text-center">
            The PDF file is not available for preview. It may be restricted or not properly uploaded.
          </p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading || !pdf.fileUrl}
          className={`flex items-center justify-center rounded-xl px-4 py-3 font-medium shadow-md transition-all duration-200 ${
            isDownloading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : !pdf.fileUrl 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
          }`}
        >
          {isDownloading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" /> 
              Download PDF
            </>
          )}
        </button>
        
        <button
          onClick={() => handleExpand(pdf)}
          disabled={!pdf.fileUrl}
          className={`flex items-center justify-center rounded-xl px-4 py-3 font-medium shadow-md transition-all duration-200 ${
            !pdf.fileUrl 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
          }`}
        >
          <Expand className="h-5 w-5 mr-2" /> 
          Full Screen
        </button>
        
        <button
          onClick={handleShare}
          disabled={isSharing || !pdf.fileUrl}
          className={`flex items-center justify-center rounded-xl px-4 py-3 font-medium shadow-md transition-all duration-200 ${
            isSharing 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : !pdf.fileUrl 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700'
          }`}
        >
          {isSharing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Document Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>• File Size: {pdf.fileSize || 'N/A'}</p>
              <p>• Pages: {pdf.pageCount || 'N/A'}</p>
              <p>• Last Updated: {pdf.lastModified || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}