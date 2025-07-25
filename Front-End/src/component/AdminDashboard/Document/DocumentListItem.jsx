import React from "react";
import { FileText, Info, Eye, Tag } from "lucide-react";

const DocumentListItem = ({ document, onHandleViewFile }) => {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 md:flex-row md:items-center">
      <div className="mb-2 flex-1 md:mb-0 md:mr-4">
        <h3 className="flex items-center text-lg font-semibold text-gray-800 dark:text-white">
          <FileText className="mr-2 text-blue-500 dark:text-blue-400" size={18} />
          {document.title}
        </h3>
        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-gray-600 dark:text-gray-300">
          <span className="flex items-center">
            <Info className="mr-1 text-gray-500 dark:text-gray-400" size={14} />
            {document.metadata.date}
          </span>
          <span className="flex items-center">
            <Info className="mr-1 text-gray-500 dark:text-gray-400" size={14} />
            {document.metadata.author}
          </span>
          <span className="flex items-center">
            <Info className="mr-1 text-gray-500 dark:text-gray-400" size={14} />
            {document.metadata.status}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {document.tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              <Tag className="mr-1" size={10} />
              {tag}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => onHandleViewFile(document.id, document)}
        className="mt-2 flex flex-shrink-0 items-center text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 md:mt-0"
      >
        <Eye className="mr-1" size={16} />
        View Document
      </button>
    </div>
  );
};

export default DocumentListItem;
