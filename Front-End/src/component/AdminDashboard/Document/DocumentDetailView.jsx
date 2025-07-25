import React from 'react';
import { ArrowLeft, FileText, Tag, XCircle } from 'lucide-react';

const PdfViewer = ({ fileData, fileId }) => {
    const pdfUrl = fileData?.pdfUrl;

    if (!pdfUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400 p-4">
                <FileText size={48} className="mb-4 text-gray-400 dark:text-gray-600" />
                <p className="text-lg font-medium">PDF not available</p>
                <p className="text-sm">No PDF URL provided for this document.</p>
            </div>
        );
    }

    return (
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-700">
            <iframe
                src={pdfUrl}
                title={`PDF Viewer for ${fileData.title}`}
                width="100%"
                height="100%"
                className="border-none"
                style={{ minHeight: '300px' }}
            >
                <p>Your browser does not support PDF files. You can <a href={pdfUrl} target="_blank" rel="noopener noreferrer">download the PDF</a> instead.</p>
            </iframe>
        </div>
    );
};

const DocumentDetailView = ({ document, onBack }) => {
    if (!document) {
        return (
            <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 rounded-r-lg shadow-lg dark:shadow-xl flex flex-col items-center justify-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No document selected.</p>
                <button
                    onClick={onBack}
                    className="mt-4 flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors duration-200"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Documents
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 rounded-r-lg shadow-lg dark:shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 font-medium transition-colors duration-200"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Documents
                </button>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center flex-grow">
                    <FileText className="inline-block mr-3 text-blue-600 dark:text-blue-400" size={28} />
                    {document.title}
                </h2>
                <button
                    onClick={onBack}
                    className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors duration-200"
                    title="Close Document View"
                >
                    <XCircle size={24} />
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 overflow-y-auto">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Document Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                    <p className="flex items-center"><span className="font-medium mr-2">Title:</span> {document.title}</p>
                    <p className="flex items-center"><span className="font-medium mr-2">Date:</span> {document.metadata.date}</p>
                    <p className="flex items-center"><span className="font-medium mr-2">Author:</span> {document.metadata.author}</p>
                    <p className="flex items-center"><span className="font-medium mr-2">Status:</span> {document.metadata.status}</p>
                    <div className="col-span-full flex flex-wrap gap-2 mt-2">
                        <span className="font-medium mr-2">Tags:</span>
                        {document.tags && document.tags.length > 0 ? (
                            document.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
                                >
                                    <Tag className="mr-1" size={12} />
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">No tags</span>
                        )}
                    </div>
                    <div className="col-span-full mt-4">
                        <p className="font-medium mb-2">Summary:</p>
                        <p className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md text-sm leading-relaxed">
                            {document.content}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white p-4 border-b border-gray-200 dark:border-gray-700">PDF Viewer</h3>
                {document.pdfUrl ? (
                    <PdfViewer fileData={document} fileId={document.id} />
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-600 dark:text-gray-400">
                        No PDF URL available for this document.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentDetailView;