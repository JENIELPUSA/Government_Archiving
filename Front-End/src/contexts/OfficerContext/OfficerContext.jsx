import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const OfficerDisplayContext = createContext();

export const OfficerDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken, linkId } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isOfficer, setOfficer] = useState([]);
    const [isOfficerData, setOfficerData] = useState([]);
    const [isTotalOfficer, setTotalOfficer] = useState([]);
    useEffect(() => {
        if (!authToken) return;
        FetchOfficer();
        FetchOfficerFiles();
    }, [authToken]);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);
    const FetchOfficer = async () => {
        if (!authToken) return;
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Patient`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });
            const TotalOfficer = res.data.totalUsers;
            const officerData = res.data.data;
            setTotalOfficer(TotalOfficer);
            setOfficer(officerData);
            console.log("data", officerData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const FetchOfficerFiles = async () => {
        if (!authToken || !linkId) return;
        setLoading(true);
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/GetOfficerData`,
                { linkId },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                },
            );

            const StaffData = res.data.data;
            setOfficerData(StaffData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const AddPatient = async (values) => {
        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
                {
                    first_name: values.first_name || "",
                    last_name: values.last_name || "",
                    middle_name: values.middle_name || "",
                    gender: values.gender || "Male",
                    email: values.email || "",
                    role: values.role,
                    department: values.department || "",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "Success") {
                setOfficer((prevUsers) => [...prevUsers, res.data.data]);
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

    const DeleteOfficer = async (officerID) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Patient/${officerID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setOfficer((prevUsers) => prevUsers.filter((user) => user._id !== officerID));
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

    const UpdateOfficer = async (dataID, values) => {
        try {
            const dataToSend = {
                first_name: values.first_name || "",
                last_name: values.last_name || "",
                middle_name: values.middle_name || "",
                gender: values.gender || "",
                email: values.email || "",
            };

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Patient/${dataID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                setOfficer((prevUsers) => prevUsers.map((u) => (u._id === response.data.data._id ? { ...u, ...response.data.data } : u)));
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
        <OfficerDisplayContext.Provider
            value={{
                isOfficer,
                isOfficerData,
                AddPatient,
                DeleteOfficer,
                UpdateOfficer,
                setOfficerData,
                isTotalOfficer,
                FetchOfficerFiles,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={customError}
            />
        </OfficerDisplayContext.Provider>
    );
};
