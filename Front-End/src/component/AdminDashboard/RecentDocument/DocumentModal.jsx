import React from 'react';

const DocumentModal = ({ title, details, onClose, darkMode }) => { // Added darkMode prop
  return (
    <div className={`modal fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-1000 ${darkMode ? 'dark' : ''}`}>
      <div className="modal-content bg-white p-6 rounded-xl shadow-lg w-11/12 max-w-2xl relative dark:bg-gray-800">
        <span
          className="absolute top-4 right-6 text-gray-400 text-3xl font-bold cursor-pointer hover:text-black dark:text-gray-500 dark:hover:text-gray-300"
          onClick={onClose}
        >
          &times;
        </span>
        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-gray-700 dark:text-gray-300">This is a placeholder for the document preview. The content of the document will be displayed here when the title is clicked.</p>
        <div className="mt-4 p-4 bg-gray-100 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
          <p className="text-gray-600 dark:text-gray-300">
            <strong className="text-gray-800 dark:text-gray-100">Document Details:</strong><br />
            <span dangerouslySetInnerHTML={{ __html: details }}></span>
          </p>
        </div>
        <div className="mt-6 text-right">
          <button
            className="p-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;
