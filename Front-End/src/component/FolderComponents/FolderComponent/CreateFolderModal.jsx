// components/Folder/CreateFolderModal.js
import React from 'react';
import { X } from 'lucide-react';

const CreateFolderModal = ({ 
  isOpen, 
  onClose, 
  newFolderName, 
  setNewFolderName, 
  selectedColor, 
  setSelectedColor, 
  createFolder,
  handleKeyPress
}) => {
  const colors = [
    { name: "blue", accent: "bg-blue-500" },
    { name: "green", accent: "bg-green-500" },
    { name: "purple", accent: "bg-purple-500" },
    { name: "orange", accent: "bg-orange-500" },
    { name: "pink", accent: "bg-pink-500" },
    { name: "indigo", accent: "bg-indigo-500" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md scale-100 transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Folder</h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Folder Name</label>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, createFolder)}
              placeholder="Enter folder name..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 shadow-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Choose Color</label>
            <div className="flex gap-3">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`h-12 w-12 rounded-2xl ${color.accent} shadow-md transition-all duration-200 hover:scale-110 ${
                    selectedColor === color.name ? "ring-4 ring-gray-400 ring-offset-2 dark:ring-gray-300" : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-medium shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={createFolder}
            disabled={!newFolderName.trim()}
            className="flex-1 transform rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;