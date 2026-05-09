import React from "react";
import { FileText, Info, Eye, Tag } from "lucide-react";

const DocumentCard = ({ document, onHandleViewFile }) => {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 flex items-center text-xl font-semibold text-gray-800 dark:text-white">
        <FileText className="mr-2 text-blue-500 dark:text-blue-400" size={20} />
        {document.title}
      </h3>
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        <p className="mb-1 flex items-center">
          <Info className="mr-2 text-gray-500 dark:text-gray-400" size={16} />
          <span className="font-medium">Date:</span> {document.metadata.date}
        </p>
        <p className="mb-1 flex items-center">
          <Info className="mr-2 text-gray-500 dark:text-gray-400" size={16} />
          <span className="font-medium">Author:</span> {document.metadata.author}
        </p>
        <p className="flex items-center">
          <Info className="mr-2 text-gray-500 dark:text-gray-400" size={16} />
          <span className="font-medium">Status:</span> {document.metadata.status}
        </p>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {document.tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            <Tag className="mr-1" size={12} />
            {tag}
          </span>
        ))}
      </div>
      <p className="line-clamp-3 flex-grow text-base leading-relaxed text-gray-700 dark:text-gray-300">
        {document.content}
      </p>
      <button
        onClick={() => onHandleViewFile(document.id, document)}
        className="mt-4 flex items-center self-start text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
      >
        <Eye className="mr-1" size={16} />
        View Document
      </button>
    </div>
  );
};

export default DocumentCard;
