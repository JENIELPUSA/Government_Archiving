import React from 'react';
import DocumentSection from './Document/DocumentSection';
import UploadForm from './Document/UploadForm';

function DocumentLayout() {
  return (
    <div className="flex flex-col h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <UploadForm />
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <DocumentSection />
      </div>
    </div>
  );
}

export default DocumentLayout;
