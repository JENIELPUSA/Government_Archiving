// context/FolderContext.js
import React, { createContext, useState, useContext } from 'react';

const FolderContext = createContext();

export const FolderProvider = ({ children }) => {
  const [isFolder, setIsFolder] = useState([]);
  const [isfolderFiles, setIsfolderFiles] = useState([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const AddFolder = async (newFolder) => {
    setIsLoadingFolders(true);
    // Simulate API call
    setTimeout(() => {
      setIsFolder(prev => [...prev, {
        ...newFolder,
        _id: `folder_${Date.now()}`,
        folderName: newFolder.name,
        created_at: new Date().toISOString()
      }]);
      setIsLoadingFolders(false);
    }, 500);
  };

  const deleteFolder = async (id) => {
    setIsFolder(prev => prev.filter(folder => folder._id !== id));
  };

  const updateFolder = async (updatedData) => {
    setIsFolder(prev => prev.map(folder => 
      folder._id === updatedData._id ? {...folder, ...updatedData} : folder
    ));
  };

  const fetchSpecificData = async (folderId) => {
    setIsLoadingFiles(true);
    // Simulate API call
    setTimeout(() => {
      setIsfolderFiles([
        { _id: 'file1', fileName: 'Document.pdf', category: 'ordinance', fileSize: 1024 },
        { _id: 'file2', fileName: 'Image.jpg', category: 'image', fileSize: 2048 },
      ]);
      setIsLoadingFiles(false);
    }, 800);
  };

  return (
    <FolderContext.Provider
      value={{
        AddFolder,
        isFolder,
        deleteFolder,
        updateFolder,
        fetchSpecificData,
        isfolderFiles,
        isLoadingFolders,
        isLoadingFiles
      }}
    >
      {children}
    </FolderContext.Provider>
  );
};

export const useFolderContext = () => useContext(FolderContext);