import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
export const ApproverDisplayContext = createContext();

export const ApproverDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [approver, setApprover] = useState([]);

    useEffect(() => {
        if (!authToken) return;
        fetchApproverData();
    }, [authToken]);

    const fetchApproverData = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Approver`, // lowercase para safe
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                }
            );

            setApprover(res.data.data || null); 
        } catch (error) {
            if (error.response?.status === 404) {
                console.warn("No approver found");
            } else {
                console.error("Error fetching approver:", error);
                handleError(error);
            }
        } 
    };

    const AddAprover = async (values) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
                {
                    first_name: values.first_name,
                    middle_name: values.middle_name,
                    last_name: values.last_name,
                    email: values.email,
                    role: "approver",
                },
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );
            if (res.data.status === "Success") {
                fetchApproverData();
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

    const UpdateApprover = async (dataID, values) => {
        try {
            const dataToSend = {
                first_name: values.first_name || "",
                last_name: values.last_name || "",
                middle_name: values.middle_name || "",
                email: values.email || "",
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Approver/${dataID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
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

    const RemoveApprover = async (officerID) => {
        try {
            const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Approver/${officerID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                fetchApproverData();
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
        <ApproverDisplayContext.Provider value={{ approver, AddAprover, UpdateApprover, RemoveApprover }}>
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={customError}
            />
        </ApproverDisplayContext.Provider>
    );
};
