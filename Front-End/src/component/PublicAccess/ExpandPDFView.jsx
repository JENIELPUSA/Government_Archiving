import React from "react";
import { useLocation } from "react-router-dom";
import ViewOnly from "../PdfViewer/ViewOnly";

function ExpandPDFView() {
  const location = useLocation();
  const { fileData, fileId } = location.state || {};

  if (!fileId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-center text-gray-500">No file selected to view.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-gray-700 p-4 font-sans sm:p-6 lg:p-8 min-h-screen">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center rounded-lg bg-gray-400 p-6 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 sm:text-3xl">
          Document Viewer
        </h1>

        {/* ETO ANG BINAGO: Added h-[70vh] and overflow-auto */}
        <div className="relative w-full h-[100vh] min-h-screen overflow-auto rounded-md border border-gray-300">
          <ViewOnly fileId={fileId} fileData={fileData} />
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 sm:text-base">
          <p>Scroll or use built-in controls to navigate the document.</p>
        </div>
      </div>
    </div>
  );
}

export default ExpandPDFView;