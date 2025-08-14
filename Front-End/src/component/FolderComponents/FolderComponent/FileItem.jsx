// components/Folder/FileItem.js
import React from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File, 
  MoreVertical 
} from 'lucide-react';
import { getFileTypeColor, getFileIcon } from '../../FolderComponents/FolderComponent/folderUtils';

const FileItem = ({ file, index }) => {
  const fileType = file.category?.toLowerCase() || "";
  const colorClasses = getFileTypeColor(fileType);
  const IconComponent = {
    FileText, Image, Video, Music, Archive, File
  }[getFileIcon(fileType)] || File;

  return (
    <div
      className="group cursor-pointer p-6 transition-all duration-200 hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-700"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div
            className={`rounded-2xl p-4 ${colorClasses} shadow-sm transition-transform duration-200 group-hover:scale-110`}
          >
            <IconComponent className="h-8 w-8" />
          </div>
          <div>
            <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white">
              {file.title || file.fileName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {file.category} • {file.fileSize} bytes
            </p>
          </div>
        </div>
        <div className="translate-x-4 transform opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
          <button className="rounded-xl p-3 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
            <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileItem;