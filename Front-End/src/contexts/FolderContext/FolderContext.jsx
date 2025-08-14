import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
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

    const fetchfolder = async () => {
        if (!authToken) return;
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Folder`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setFolder(res.data.data);
        } catch (error) {
            console.error("Error fetching brands:", error);
            setError("Failed to fetch data.");
        }
    };

    useEffect(() => {
        fetchfolder();
    }, [authToken]);

    useEffect(() => {
        if (customError) {
            setModalStatus("failed");
            setShowModal(true);
        }
    }, [customError]);

    const AddFolder = async (values) => {
        try {
            const res = await axiosInstance.post(
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
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newData };
            } else {
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const message = typeof errorData === "string" ? errorData : errorData.message || errorData.error || "Something went wrong.";
                setCustomError(message);
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
        }
    };
    const updateFolder = async ({ _id, folderName, color }) => {
        console.log("context", folderName);
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
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Unexpected error occurred.";

            setCustomError(message);
        }
    };

    const deleteFolder = async (BrandId) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Folder/${BrandId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                const newData = response.data.data;
                setModalStatus("success");
                setShowModal(true);
                setFolder((prevUsers) => prevUsers.filter((user) => user._id !== BrandId));
                return { success: true, data: newData };
            } else {
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setCustomError(error.response?.data?.message || "Failed to delete user.");
        }
    };

    const fetchSpecificData = async (folderID) => {
        if (!authToken) return;
        setIsLoadingFiles(true); // SIMULA ng loading
        setError(null);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Folder/getFilesByFolderId/${folderID}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setFolderFiles(res.data.data);
            setIsLoadingFiles(false); // TAPOS ng loading
        } catch (error) {
            console.error("Error fetching files:", error);
            setError("Failed to fetch files.");
            setIsLoadingFiles(false); // TAPOS ng loading, kahit may error
        }
    };

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


