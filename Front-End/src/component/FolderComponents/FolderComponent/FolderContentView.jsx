// components/Folder/FolderContentView.js
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Folder, 
  Calendar, 
  Upload, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { useFolderContext } from '../../../contexts/FolderContext/FolderContext';
import UploadDocumentsModal from '../FormUpload/UploadDocuments';
import FileItem from './FileItem';
import { getColorClasses } from '../../FolderComponents/FolderComponent/folderUtils';

const FolderContentView = ({ 
  folder, 
  onBack,
  isLoadingFiles
}) => {
  const { fetchSpecificData, isfolderFiles } = useFolderContext();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showFileFilters, setShowFileFilters] = useState(false);
  const [fileFilters, setFileFilters] = useState({
    type: "",
    dateFrom: "",
    dateTo: ""
  });
  const [currentFilePage, setCurrentFilePage] = useState(1);
  const [filesPerPage] = useState(5);
  const [fileTypeInput, setFileTypeInput] = useState('');
  const [suggestedTypes, setSuggestedTypes] = useState([]);
  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);
  
  const fileTypeOptions = ['ordinance', 'image', 'video', 'audio', 'archive'];
  const colorClasses = getColorClasses(folder.color);
  
  useEffect(() => {
    fetchSpecificData(folder._id);
  }, [folder._id, fetchSpecificData]);

  useEffect(() => {
    if (fileTypeInput.length > 0) {
      const filtered = fileTypeOptions.filter(type => 
        type.toLowerCase().includes(fileTypeInput.toLowerCase())
      );
      setSuggestedTypes(filtered);
      setShowTypeSuggestions(true);
    } else {
      setShowTypeSuggestions(false);
    }
  }, [fileTypeInput]);

  const handleTypeSelect = (type) => {
    setFileFilters({...fileFilters, type});
    setFileTypeInput('');
    setShowTypeSuggestions(false);
  };

  const resetFileFilters = () => {
    setFileFilters({
      type: "",
      dateFrom: "",
      dateTo: ""
    });
    setCurrentFilePage(1);
  };

  const filterFiles = (files) => {
    if (!files || !Array.isArray(files)) return [];
    
    return files.filter(file => {
      if (fileFilters.type && file.category.toLowerCase() !== fileFilters.type.toLowerCase()) {
        return false;
      }
      
      const fileDate = new Date(file.created_at);
      if (fileFilters.dateFrom && new Date(fileFilters.dateFrom) > fileDate) {
        return false;
      }
      if (fileFilters.dateTo && new Date(fileFilters.dateTo) < fileDate) {
        return false;
      }
      
      return true;
    });
  };

  const filteredFiles = filterFiles(isfolderFiles);
  const indexOfLastFile = currentFilePage * filesPerPage;
  const indexOfFirstFile = indexOfLastFile - filesPerPage;
  const currentFiles = filteredFiles.slice(indexOfFirstFile, indexOfLastFile);
  const totalFilePages = Math.ceil(filteredFiles.length / filesPerPage);

  const handleUploadFiles = () => {
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Folder Header */}
      <div className={`${colorClasses.bg} border-b-2 ${colorClasses.border} shadow-sm`}>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex transform items-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Folders
            </button>
            <button
              onClick={handleUploadFiles}
              className="flex transform items-center gap-3 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
            >
              <Upload className="h-5 w-5" />
              Upload Files
            </button>
          </div>
          <div className="flex items-center gap-8">
            <div
              className={`rounded-3xl bg-white p-6 shadow-xl ${colorClasses.border} transform border-2 transition-transform duration-200 hover:scale-105 dark:bg-gray-800`}
            >
              <Folder className={`h-20 w-20 ${colorClasses.icon}`} />
            </div>
            <div>
              <h1 className="mb-3 text-5xl font-bold text-gray-900 dark:text-white">{folder.folderName}</h1>
              <div className="flex items-center gap-8 text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800">
                  <Calendar className="h-5 w-5" />
                  Created {new Date(folder.created_at).toLocaleDateString()}
                </span>
                <span className="rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-gray-800">{filteredFiles.length} files</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Filter Controls */}
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => setShowFileFilters(!showFileFilters)}
            className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            <Filter className="h-4 w-4" />
            {showFileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentFilePage} of {totalFilePages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentFilePage(prev => Math.max(prev - 1, 1))}
                disabled={currentFilePage === 1}
                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentFilePage(prev => Math.min(prev + 1, totalFilePages))}
                disabled={currentFilePage === totalFilePages || totalFilePages === 0}
                className="rounded-lg border border-gray-300 p-2 disabled:opacity-50 dark:border-gray-600"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Advanced File Filters */}
        {showFileFilters && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Advanced File Filters</h3>
              <button
                onClick={resetFileFilters}
                className="rounded-lg px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-gray-700"
              >
                Reset Filters
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* File Type Filter */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">File Type</label>
                <div className="relative">
                  <div className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={fileTypeInput}
                      onChange={(e) => setFileTypeInput(e.target.value)}
                      placeholder="Search file types..."
                      className="flex-1 bg-transparent text-sm outline-none dark:text-white"
                    />
                  </div>
                  
                  {showTypeSuggestions && suggestedTypes.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {suggestedTypes.map((type, index) => (
                        <div 
                          key={index}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleTypeSelect(type)}
                        >
                          <span className="capitalize">{type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {fileFilters.type && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {fileFilters.type}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => {
                          setFileFilters({...fileFilters, type: ''});
                          setFileTypeInput('');
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">From Date</label>
                <input
                  type="date"
                  value={fileFilters.dateFrom}
                  onChange={(e) => setFileFilters({...fileFilters, dateFrom: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">To Date</label>
                <input
                  type="date"
                  value={fileFilters.dateTo}
                  onChange={(e) => setFileFilters({...fileFilters, dateTo: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Folder Content */}
      <div className="mx-auto max-w-7xl px-6 pb-8">
        {isLoadingFiles ? (
          <FileListSkeleton colorClasses={colorClasses} />
        ) : filteredFiles.length === 0 ? (
          <EmptyFolderView 
            colorClasses={colorClasses} 
            onUpload={handleUploadFiles}
            hasFilters={Object.values(fileFilters).some(val => val)}
          />
        ) : (
          <FileListView 
            files={currentFiles}
            totalFiles={filteredFiles.length}
            currentFilePage={currentFilePage}
            totalFilePages={totalFilePages}
            onPageChange={setCurrentFilePage}
          />
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadDocumentsModal
          isOpen={isUploadModalOpen}
          onClose={closeUploadModal}
          folderId={folder._id}
        />
      )}
    </div>
  );
};

// Sub-components for FolderContentView
const FileListSkeleton = ({ colorClasses }) => (
  <div className="min-h-screen">
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
            <div className="h-6 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="mt-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-gray-200 dark:bg-gray-700"></div>
                    <div className="space-y-2">
                      <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EmptyFolderView = ({ colorClasses, onUpload, hasFilters }) => (
  <div className="py-20 text-center">
    <div className={`h-32 w-32 ${colorClasses.bg} mx-auto mb-8 flex items-center justify-center rounded-3xl shadow-lg`}>
      <Folder className={`h-16 w-16 ${colorClasses.icon}`} />
    </div>
    <h3 className="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">No files found</h3>
    <p className="mb-8 text-lg text-gray-500 dark:text-gray-400">
      {hasFilters ? "Try adjusting your filters" : "Add some files to get started"}
    </p>
    <button
      onClick={onUpload}
      className="mx-auto flex transform items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
    >
      <Upload className="h-5 w-5" />
      Upload Files
    </button>
  </div>
);

const FileListView = ({ 
  files, 
  totalFiles,
  currentFilePage,
  totalFilePages,
  onPageChange
}) => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-800 dark:to-gray-800">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Files in this folder</h2>
      <p className="mt-1 text-gray-600 dark:text-gray-400">
        Showing {files.length} of {totalFiles} files
      </p>
    </div>
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {files.map((file, index) => (
        <FileItem key={file._id} file={file} index={index} />
      ))}
    </div>
    
    {totalFilePages > 1 && (
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Showing {(currentFilePage - 1) * 5 + 1} to {Math.min(currentFilePage * 5, totalFiles)} of {totalFiles} files
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onPageChange(Math.max(currentFilePage - 1, 1))}
            disabled={currentFilePage === 1}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm font-medium">
            Page {currentFilePage} of {totalFilePages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(currentFilePage + 1, totalFilePages))}
            disabled={currentFilePage === totalFilePages}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )}
  </div>
);

export default FolderContentView;