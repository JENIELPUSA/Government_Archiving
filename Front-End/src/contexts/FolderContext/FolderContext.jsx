import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
import axios from "axios";

export const FolderContext = createContext();

export const FolderDisplayProvider = ({ children }) => {
    const [isFolder, setFolder] = useState([]);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");
    const [isfolderFiles, setFolderFiles] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalFolderPages, setTotalFolderPages] = useState(1);
    const [currentFolderPage, setCurrentFolderPage] = useState(1);

    const fetchfolder = useCallback(
        async (queryParams = {}) => {
            try {
                const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Folder`, {
                    withCredentials: true,
                    params: queryParams,
                    headers: {
                        "Cache-Control": "no-cache",
                        Authorization: authToken ? `Bearer ${authToken}` : undefined,
                    },
                });
                const { totalPages, currentPage } = res.data;
                setFolder(res.data.data);
                setTotalFolderPages(totalPages);
                setCurrentFolderPage(currentPage);
            } catch (error) {
                console.error("Error fetching folder data:", error);
                setError("Failed to fetch folders.");
            } finally {
                setIsLoadingFolders(false);
            }
        },
        [authToken],
    );

    useEffect(() => {
        if (authToken) {
            fetchfolder();
        }
    }, [authToken, fetchfolder]);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [customError]);

    const AddFolder = async (values) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Folder`,
                {
                    folderName: values.name,
                    color: values.color,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (res.data.status === "success") {
                const newData = res.data.data;
                fetchfolder();
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newData };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Unexpected error occurred.";
            setCustomError(message);
        }
    };

    const updateFolder = async ({ _id, folderName, color }) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Folder/${_id}`,
                { folderName, color },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            if (response.data?.status === "success") {
                const newData = response.data.data;
                setFolder((prev) => prev.map((u) => (u._id === newData._id ? { ...u, ...newData } : u)));
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newData };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Unexpected error occurred.";
            setCustomError(message);
        }
    };

    const deleteFolder = async (folderId) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Folder/${folderId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                const newData = response.data.data;
                setModalStatus("success");
                setShowModal(true);
                setFolder((prev) => prev.filter((f) => f._id !== folderId));
                return { success: true, data: newData };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting folder:", error);
            setModalStatus("failed");
            setShowModal(true);
            setCustomError(error.response?.data?.message || "Failed to delete folder.");
        }
    };

    const fetchSpecificData = useCallback(
        async (folderID, params = {}) => {
            if (!authToken || !folderID) return;
            setIsLoadingFiles(true);
            setError(null);

            try {
                const res = await axiosInstance.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Folder/getFilesByFolderId/${folderID}`,
                    {
                        withCredentials: true,
                        params,
                        headers: { Authorization: `Bearer ${authToken}` },
                    },
                );

                const { totalPages, currentPage } = res.data;
                setFolderFiles(res.data.data);
                setTotalPages(totalPages);
                setCurrentPage(currentPage);
            } catch (error) {
                console.error("Error fetching files:", error);
                setError("Failed to fetch files.");
            } finally {
                setIsLoadingFiles(false);
            }
        },
        [authToken],
    );

    return (
        <FolderContext.Provider
            value={{
                AddFolder,
                isFolder,
                fetchfolder,
                error,
                updateFolder,
                deleteFolder,
                setFolder,
                customError,
                setCustomError,
                fetchSpecificData,
                isfolderFiles,
                isLoadingFiles,
                totalPages,
                currentPage,
                setCurrentPage,
                totalFolderPages,
                setCurrentFolderPage,
                currentFolderPage,
                setIsLoadingFiles,
            }}
        >
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </FolderContext.Provider>
    );
};
