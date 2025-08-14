import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axiosInstance from "../../ReusableFolder/axioxInstance";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const NewsDisplayContext = createContext();

export const NewsDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isNotification, setNotification] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const [pictures, setPicture] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 9;

    const DisplayNews = useCallback(async (page = 1, search = "") => {
        try {
            const params = {
                page,
                limit,
            };
            if (search) {
                params.search = search;
            }
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/News`, {
                params,
            });

            const { totalPages, currentPage } = res.data;
            setPicture(res.data.data);
            setTotalPages(totalPages);
            setCurrentPage(currentPage);
        } catch (error) {
            console.error("Error fetching group files:", error);
        }
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                DisplayNews();
            } catch (err) {
                console.error("Error fetching SB data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [DisplayNews]);

    const AddNotification = async (values) => {
        try {
            const formData = new FormData();
            formData.append("title", values.title || "");
            formData.append("date", values.date || "");
            formData.append("excerpt", values.excerpt || "");
            formData.append("category", values.category || "");
            if (values.image) formData.append("avatar", values.image);
            const res = await axiosInstance.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/News`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.status === "Success") {
                const newAdmin = res.data.data;
                setModalStatus("success");
                setShowModal(true);
                DisplayNews();
                return { success: true, data: newAdmin };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            let message = "Unexpected error occurred.";
            if (error.response?.data) {
                message = error.response.data.message || error.response.data.error || message;
            } else if (error.request) {
                message = "No response from the server.";
            } else if (error.message) {
                message = error.message;
            }
            setCustomError(message);
            setModalStatus("failed");
            setShowModal(true);
            return { success: false, error: message };
        }
    };

    const DeleteSB = async (officerID) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/SbmemberRoute/${officerID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                return { success: true, data: response.data.data };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const UpdateSbmember = async (dataID, values) => {
        try {
            const formData = new FormData();
            formData.append("title", values.title || "");
            formData.append("date", values.date || "");
            formData.append("excerpt", values.excerpt || "");
            formData.append("category", values.category || "");
            if (values.image) formData.append("image", values.image);

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/SbmemberRoute/${dataID}`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data?.status === "success") {
                return { success: true, data: response.data.data };
            } else {
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";

            setCustomError(message);
            setModalStatus("failed");
            setShowModal(true);

            return { success: false, error: message };
        }
    };

    return (
        <NewsDisplayContext.Provider
            value={{
                loading,
                setLoading,
                DeleteSB,
                setCurrentPage,
                currentPage,
                totalPages,
                DisplayNews,
                UpdateSbmember,
                AddNotification,
                pictures,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={customError}
            />
        </NewsDisplayContext.Provider>
    );
};
