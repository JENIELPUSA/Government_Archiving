import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const CategoryContext = createContext();

export const CategoryDisplayProvider = ({ children }) => {
    const [isCategory, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    const fetchCategory = async () => {
        if (!authToken) return;
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Category`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setCategory(res.data.data);
        } catch (error) {
            console.error("Error fetching brands:", error);
            setError("Failed to fetch data.");
        }
    };

    useEffect(() => {
        fetchCategory();
    }, [authToken]);

    useEffect(() => {
        if (customError) {
            setModalStatus("failed");
            setShowModal(true);
        }
    }, [customError]);

    const AddCategory = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category`,
                {
                    category: values.category,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                const newData = res.data.data;
                setModalStatus("success");
                setShowModal(true);
                setCategory((prevUsers) => [...prevUsers, res.data.data]);
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
    const UpdateCategory = async ({ _id, category }) => {
        try {
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category/${_id}`,
                { category },
                { headers: { Authorization: `Bearer ${authToken}` } },
            );

            if (response.data?.status === "success") {
                const newData = response.data.data;
                setCategory((prev) => prev.map((u) => (u._id === newData._id ? { ...u, ...newData } : u)));
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

    const deleteCategory = async (BrandId) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category/${BrandId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                const newData = response.data.data;
                setModalStatus("success");
                setShowModal(true);
                setCategory((prevUsers) => prevUsers.filter((user) => user._id !== BrandId));
                return { success: true, data: newData };
            } else {
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setCustomError(error.response?.data?.message || "Failed to delete user.");
        }
    };

    return (
        <CategoryContext.Provider
            value={{
                AddCategory,
                isCategory,
                fetchCategory,
                loading,
                error,
                UpdateCategory,
                deleteCategory,
                setCategory,
                customError,
                setCustomError,
            }}
        >
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </CategoryContext.Provider>
    );
};
