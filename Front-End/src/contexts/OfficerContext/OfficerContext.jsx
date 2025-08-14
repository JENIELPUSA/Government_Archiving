import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
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
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isCount, setCount] = useState([]);
    const [isApproved, setApproved] = useState([]);
    const [isPendingData, setPendingData] = useState([]);
    const [totalPagesRejected, setTotalPagesRejected] = useState(1);
    const [totalPagesApproved, setTotalPagesApproved] = useState(1);
    const [totalPagesPending, setTotalPagesPending] = useState(1);
    const [currentPageRejected, setCurrentPageRejected] = useState(1);
    const [currentPageApproved, setCurrentPageApproved] = useState(1);
    const [currentPagePending, setCurrentPagePending] = useState(1);
    const [isRejectedData, setRejectedData] = useState([]);
    const [isRecentData, setRecentData] = useState([]);

    useEffect(() => {
        if (!authToken) return;

        const fetchAllData = async () => {
            try {
                await Promise.all([FetchOfficer(), FetchOfficerFiles()]);
            } catch (error) {
                console.error("Error fetching officer data:", error);
            }
        };
        fetchAllData();
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

            const cleanedData = (officerData || []).filter((officer) => officer && officer._id);

            setTotalOfficer(TotalOfficer);
            setOfficer(cleanedData);

            return cleanedData; 
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const FetchOfficerFiles = useCallback(async () => {
        if (!authToken || !linkId) return;

        try {
            const res = await axiosInstance.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/GetOfficerData`,
                { linkId },
                {
                    params: {
                        pagePending: currentPagePending,
                        limitPending: 5,
                        pageApproved: currentPageApproved,
                        limitApproved: 10,
                        pageRejected: currentPageRejected,
                        limitRejected: 10,
                    },
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                },
            );

            const { pending, approved, rejected, counts, totalPages, recentData } = res.data;


            console.log("TOTAL SIZED",counts.totalFileSize)
            setPendingData(pending);
            setApproved(approved);
            setRecentData(recentData);
            setRejectedData(rejected);
            setCount(counts);
            setTotalPagesPending(totalPages.pending);
            setTotalPagesApproved(totalPages.approved);
            setTotalPagesRejected(totalPages.rejected);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [
        authToken,
        linkId,
        currentPagePending,
        currentPageApproved,
        currentPageRejected,
        setPendingData,
        setApproved,
        setRejectedData,
        setCount,
        setTotalPagesPending,
        setTotalPagesApproved,
        setTotalPagesRejected,
    ]);

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


    const contextValue = useMemo(
        () => ({
            isOfficer,
            isOfficerData,
            AddPatient,
            DeleteOfficer,
            UpdateOfficer,
            setOfficerData,
            isTotalOfficer,
            FetchOfficerFiles,
            FetchOfficer,
            totalPages,
            currentPage,
            setCurrentPage,
            isCount,
            isApproved,
            isPendingData,
            totalPagesPending,
            totalPagesApproved,
            totalPagesRejected,
            currentPagePending,
            currentPageApproved,
            currentPageRejected,
            setCurrentPagePending,
            setCurrentPageApproved,
            setCurrentPageRejected,
            isRejectedData,
            isRecentData,
        }),
        [
            isOfficer,
            isRecentData,
            isOfficerData,
            AddPatient,
            DeleteOfficer,
            UpdateOfficer,
            setOfficerData,
            isTotalOfficer,
            FetchOfficerFiles,
            FetchOfficer,
            totalPages,
            currentPage,
            isRejectedData,
            setCurrentPage,
            isCount,
            isApproved,
            isPendingData,
            totalPagesPending,
            totalPagesApproved,
            totalPagesRejected,
            currentPagePending,
            currentPageApproved,
            currentPageRejected,
            setCurrentPagePending,
            setCurrentPageApproved,
            setCurrentPageRejected,
        ],
    );

    return (
        <OfficerDisplayContext.Provider value={contextValue}>
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

export default OfficerDisplayProvider;
