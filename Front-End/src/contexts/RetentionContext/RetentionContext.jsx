import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const RetentionContext = createContext();
export const RetentionDisplayProvider = ({ children }) => {
    const [isRetention, setRetention] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    useEffect(() => {
        fetchRetention();
    }, [authToken]);

    const AddRetention = async (values, enabled) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Retention`,
                {
                    retentionDays: values,
                    enabled,
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "success") {
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

    const fetchRetention = async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Retention`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setRetention(res.data.data);
        } catch (error) {
            console.error("Error fetching brands:", error);
            setError("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <RetentionContext.Provider
            value={{
                AddRetention,
                isRetention
            }}
        >
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </RetentionContext.Provider>
    );
};
