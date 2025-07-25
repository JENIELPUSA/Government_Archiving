import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
export const FilesDisplayContext = createContext();

export const FilesDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [isFile, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isPublicData, setPublicData] = useState([]);

    useEffect(() => {
        if (!authToken) return;
        FetchFiles();
        fetchpublicdata();
    }, [authToken]);
    useEffect(() => {
        fetchpublicdata();
    }, []);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    const AddFiles = async (formData) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.status === "success") {
                const newFile = res.data.data;
                await Promise.all([FetchFiles(), fetchpublicdata()]);
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newFile };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errorData = error.response.data;
                const message = typeof errorData === "string" ? errorData : errorData.message || errorData.error || "Something went wrong.";
                setCustomError(message);
                return { success: false, error: message };
            } else if (error.request) {
                setCustomError("No response from the server.");
                return { success: false, error: "No response from the server." };
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
                return {
                    success: false,
                    error: error.message || "Unexpected error",
                };
            }
        }
    };
    const fetchpublicdata = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/GetPublicData`, {
                withCredentials: true,
            });
            const user = res?.data?.data;
            setPublicData(user);
            console.log("User", user);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const FetchFiles = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            const StaffData = res.data.data;
            setFiles(StaffData);
            console.log("datahht", StaffData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const InsertOfficer = async (dataId, values) => {
        try {
            const dataToSend = {
                officer: values.officer,
            };
            console.log("officer to send:", dataToSend.officer);

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/OfficerUpdate/${dataId}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                const newFile = response.data.data;
                setFiles((prevFiles) => prevFiles.map((f) => (f._id === response.data.data._id ? { ...f, ...response.data.data } : f)));
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newFile };
            } else {
                setModalStatus("failed");
                setShowModal(true);
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

    const DeleteFiles = async (ID) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${ID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setFiles((prevUsers) => prevUsers.filter((user) => user._id !== ID));
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const UpdateFiles = async (bornID, values) => {
        try {
            const dataToSend = {
                category: values.categoryID || "",
                fullText: values.fullText || "",
                summary: values.summary || "",
                title: values.title || "",
                author: values.author || "",
            };

            const response = await axios.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/UpdateFileDocument/${bornID}`,
                dataToSend,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (response.data && response.data.status === "success") {
                setFiles((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));
                setModalStatus("success");
                setShowModal(true);
                return { success: true };
            } else {
                setModalStatus("failed");
                setShowModal(true);
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

    const MOveArchived = async (bornID, value) => {
        try {
            const dataToSend = {
                ArchivedStatus: value,
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${bornID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                const newFile = response.data.data;
                setFiles((prevFiles) => prevFiles.map((file) => (file._id === newFile._id ? newFile : file)));
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newFile };
            } else {
                setModalStatus("failed");
                setShowModal(true);
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

    const UpdateStatus = async (bornID, values) => {
        console.log("Test", values);
        try {
            let dataToSend = {
                status: values.status || "",
            };

            if (values.status === "Rejected") {
                if (!values.note || values.note.trim() === "") {
                    setCustomError("Note is required when status is Rejected.");
                    return;
                }
                dataToSend.suggestion = values.note;
            }

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${bornID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                setFiles((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
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

    return (
        <FilesDisplayContext.Provider
            value={{
                AddFiles,
                isFile,
                DeleteFiles,
                UpdateFiles,
                MOveArchived,
                UpdateStatus,
                InsertOfficer,
                isPublicData,
                setFiles,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={customError}
            />
        </FilesDisplayContext.Provider>
    );
};
