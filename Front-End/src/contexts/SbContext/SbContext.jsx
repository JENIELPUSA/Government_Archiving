import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axiosInstance from "../../ReusableFolder/axioxInstance";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const SbMemberDisplayContext = createContext();

export const SbMemberDisplayProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    const [isSBMember, setSBMember] = useState([]);
    const [isDropdown, setDropdown] = useState([]);
    const [isGroupFiles, setGroupFiles] = useState([]);
    const [isGroupPublicAuthor, setGroupPublicAuthor] = useState([]);

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const FetchDisplaySbMember = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/SbmemberRoute`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setSBMember(res.data.data);
            console.log("SB MEMBER",res.data.data)
        } catch (error) {
            console.error("Error fetching SB member:", error);
        }
    }, [authToken]);

    const DisplayPerSb = useCallback(
        async (queryParams = {}) => {
            if (typeof queryParams !== "object" || queryParams === null) {
                console.error("Invalid queryParams provided. Expected an object.");
                return;
            }
            if (!authToken) return;
            try {
                setLoading(true);
                const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/FilesWithAuthor`, {
                    withCredentials: true,
                    params: queryParams,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                });
                setGroupFiles(res.data.data);
                if (res.data.data.length > 0) {
                    setTotalPages(res.data.data[0].totalPages);
                    setCurrentPage(res.data.data[0].currentPage);
                }
            } catch (error) {
                console.error("Error fetching files with author:", error);
                setCustomError(error.message || "Failed to fetch files.");
            } finally {
                setLoading(false);
            }
        },
        [authToken],
    );

    const DisplayPublicAuthor = useCallback(
        
        async (queryParams = {}) => {
            try {
                const res = await axiosInstance.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/PublicGetAuthorwithFiles`,
                    {},
                    {
                        withCredentials: true,
                        params: queryParams,
                        headers: {
                            "Cache-Control": "no-cache",
                        },
                    },
                );
                const { totalPages, currentPage } = res.data;
                setGroupPublicAuthor(res.data.data);

                setTotalPages(totalPages);
                setCurrentPage(currentPage);
            } catch (error) {
                console.error("Error fetching archived data:", error);
            }
        },
        [setGroupPublicAuthor, setTotalPages, setCurrentPage], // dependencies
    );

    const AddSbData = async (values) => {
        try {
            const formData = new FormData();
            formData.append("first_name", values.first_name || "");
            formData.append("last_name", values.last_name || "");
            formData.append("email", values.email || "");
            formData.append("Position", values.Position || "");
            formData.append("term_from", values.term_from || "");
            formData.append("term_to", values.term_to || "");
            formData.append("role", "sbmember");

            if (values.middle_name) {
                formData.append("middle_name", values.middle_name);
            }

            if (values.detailInfo) formData.append("detailInfo", values.detailInfo);
            if (values.Position) formData.append("Position", values.Position);
            if (values.district) formData.append("district", values.district);
            if (values.avatar instanceof File) {
                formData.append("avatar", values.avatar);
            }

            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (res.data.status === "Success") {
                const newAdmin = res.data.data;
                setModalStatus("success");
                setShowModal(true);
                DisplayPerSb();
                return { success: true, data: newAdmin };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            if (error.response?.data) {
                const message = error.response.data.message || error.response.data.error || "Something went wrong.";
                setCustomError(message);
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }
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
            setModalStatus("failed");
            setShowModal(true);
            console.error("Error deleting user:", error);
        }
    };

    const FetchDropdown = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/SbmemberRoute/AuthhorDropdown`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setDropdown(res.data.data);
        } catch (error) {
            console.error("Error fetching SB member:", error);
        }
    }, [authToken]);

    const UpdateSbmember = async (dataID, values) => {
        try {
            const formData = new FormData();
            formData.append("first_name", values.first_name || "");
            formData.append("last_name", values.last_name || "");
            formData.append("Position", values.Position || "");
            formData.append("email", values.email || "");
            formData.append("role", "sbmember");
            if (values.avatar) formData.append("avatar", values.avatar);
            if (values.middle_name) formData.append("middle_name", values.middle_name);
            if (values.detailInfo) formData.append("detailInfo", values.detailInfo);
            if (values.district) formData.append("district", values.district);
            if (values.Position) formData.append("Position", values.Position);

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

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                await Promise.all([DisplayPerSb(), FetchDisplaySbMember(), DisplayPublicAuthor(), FetchDropdown()]);
            } catch (err) {
                console.error("Error fetching SB data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [DisplayPerSb, FetchDisplaySbMember, DisplayPublicAuthor]);
    return (
        <SbMemberDisplayContext.Provider
            value={{
                loading,
                setLoading,
                DeleteSB,
                setCurrentPage,
                currentPage,
                totalPages,
                AddSbData,
                isSBMember,
                isGroupFiles,
                DisplayPerSb,
                setTotalPages,
                UpdateSbmember,
                isGroupPublicAuthor,
                DisplayPublicAuthor,
                isDropdown,
                customError,
                setShowModal,
                setModalStatus,
                FetchDropdown,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={customError}
            />
        </SbMemberDisplayContext.Provider>
    );
};
