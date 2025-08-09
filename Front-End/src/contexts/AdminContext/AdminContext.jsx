import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
export const AdminDisplayContext = createContext();

export const AdminDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, linkId } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isAdmin, setAdmin] = useState([]);
    const [isAdminProfile, setAdminProfile] = useState([]);
    const [isTotalAdmin, setTotalAdmin] = useState([]);

    useEffect(() => {
        if (!authToken) return;

        const fetchAll = async () => {
            await Promise.all([FetchAdminData(), FetchProfileData()]);
        };

        fetchAll();
    }, [authToken]);

    const FetchAdminData = async () => {
        if (!authToken) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Admin`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            const TotalAdmin = res.data.totalAdmin;
            const AdminData = res.data.data;
            setAdmin(AdminData);
            setTotalAdmin(TotalAdmin);
            console.log("data", AdminData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const FetchProfileData = async () => {
        if (!authToken || !linkId) {
            console.warn("Missing token or linkId");
            return;
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Admin`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            if (response.data?.status === "success") {
                setAdminProfile(response.data.data);
            } else {
                console.warn("Unexpected response:", response.data);
            }
        } catch (error) {
            if (error.response) {
                console.error("Server Error:", error.response.status, error.response.data);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error setting up request:", error.message);
            }
        }
    };

    const DeleteAdmin = async (officerID) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Admin/${officerID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setAdmin((prevUsers) => prevUsers.filter((user) => user._id !== officerID));
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

    const UpdateAdmin = async (dataID, values) => {
        try {
            const dataToSend = {
                first_name: values.first_name || "",
                last_name: values.last_name || "",
                middle_name: values.middle_name || "", // make sure correct key
                email: values.email || "",
                specialty: values.specialty || "", // if department included
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Admin/${dataID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                setAdmin((prevAdmin) => ({
                    ...prevAdmin,
                    ...response.data.data,
                }));
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
        <AdminDisplayContext.Provider
            value={{
                isAdmin,
                DeleteAdmin,
                UpdateAdmin,
                isTotalAdmin,
                isAdminProfile,
                FetchAdminData,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={customError}
            />
        </AdminDisplayContext.Provider>
    );
};
