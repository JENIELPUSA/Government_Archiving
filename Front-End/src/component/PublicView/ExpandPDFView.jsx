import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Eye } from "lucide-react";
import ViewOnly from "../PdfViewer/ViewOnly";

function ExpandPDFView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileData, fileId, fileName } = location.state || {};

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!fileId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-4">No file selected to view</p>
          <button
            onClick={handleGoBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </button>
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">
                  Document Viewer
                </h1>
              </div>
            </div>
            {fileName && (
              <div className="hidden sm:block text-sm text-gray-600 truncate max-w-md">
                <span className="font-medium">File:</span> {fileName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* PDF Viewer Container */}
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            {/* PDF Viewer Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {fileName || 'Document Preview'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Use scroll or built-in controls to navigate
                </div>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="relative">
              <div className="h-[calc(100vh-12rem)] min-h-[600px] overflow-auto bg-gray-100">
                <ViewOnly fileId={fileId} fileData={fileData} />
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Document viewer • Use keyboard shortcuts or mouse controls for navigation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpandPDFView;