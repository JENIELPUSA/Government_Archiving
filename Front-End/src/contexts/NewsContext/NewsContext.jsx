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
    const [totalNews, setTotalNews] = useState(0);
    const [pictures, setPicture] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState("");

    // DisplayNews function - ito ang kumukuha ng data
    const DisplayNews = useCallback(async (page = 1, search = "", limit = 5) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
            };

            if (search && search.trim()) {
                params.search = search.trim();
            }

            const res = await axios.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/News`,
                { params }
            );
            const { data, totalPages, currentPage: backendPage, totalNews } = res.data;
            setPicture(data || []);
            setTotalPages(totalPages || 1);
            setCurrentPage(backendPage || page);
            setTotalNews(totalNews || 0);
            setItemsPerPage(limit);
        } catch (error) {
            console.error("Error fetching news:", error);
            setPicture([]);
            setTotalNews(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch kapag nagbago ang currentPage o itemsPerPage
    useEffect(() => {
        DisplayNews(currentPage, searchTerm, itemsPerPage);
    }, [currentPage, itemsPerPage, searchTerm, DisplayNews]);

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
                setCurrentPage(1);
                await DisplayNews(1, searchTerm, itemsPerPage);
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

    const DeletePicture = async (officerID) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/News/${officerID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await DisplayNews(currentPage, searchTerm, itemsPerPage);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setModalStatus("failed");
            setShowModal(true);
        }
    };

    const UpdatePicture = async (dataID, values) => {
        try {
            const formData = new FormData();
            formData.append("title", values.title || "");
            formData.append("date", values.date || "");
            formData.append("excerpt", values.excerpt || "");
            formData.append("category", values.category || "");
            if (values.image) formData.append("avatar", values.image);

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/News/${dataID}`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await DisplayNews(currentPage, searchTerm, itemsPerPage);
                return { success: true };
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
    const updatePriorityNumber = async (newsId, priorityNumber) => {
        try {
            const response = await axios.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/News/updateprioritynum/${newsId}`,
                { priorityNumber },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`, // Added auth token for security
                    },
                }
            );
            if (response.data?.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                await DisplayNews(currentPage, searchTerm, itemsPerPage);
                return { success: true };
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
                DeletePicture,
                setCurrentPage,
                currentPage,
                totalPages,
                DisplayNews,
                UpdatePicture,
                AddNotification,
                pictures,
                setPicture,
                totalNews,
                itemsPerPage,
                setItemsPerPage,
                searchTerm,
                setSearchTerm,
                updatePriorityNumber, // ✅ ADD THIS to expose the function
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