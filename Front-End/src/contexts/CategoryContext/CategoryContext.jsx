import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

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

        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Category`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setCategory(res.data.data);
        } catch (error) {
            console.error("Error fetching brands:", error);
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when token is available
    useEffect(() => {
        fetchCategory();
    }, [authToken]);

    const AddCategory = async (values) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category`,
                {
                    category: values.category,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
                setCategory((prevUsers) => [...prevUsers, res.data.data]);
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
const UpdateCategory = async ({ _id, category }) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category/${_id}`,
      { category },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    if (response.data?.status === "success") {
      setCategory((prev) =>
        prev.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u))
      );
      setModalStatus("success");
      setShowModal(true);
    } else {
      setModalStatus("failed");
      setShowModal(true);
      return { success: false, error: "Unexpected response from server." };
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Unexpected error occurred.";

    setCustomError(message);
  }
};


    const DeleteCategory = async (BrandId) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/category/${BrandId}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setCategory((prevUsers) => prevUsers.filter((user) => user._id !== BrandId));
                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error(error.response?.data?.message || "Failed to delete user.");
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
                UpdateCategory,DeleteCategory
            }}
        >
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </CategoryContext.Provider>
    );
};