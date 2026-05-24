import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axiosInstance from "../../ReusableFolder/axioxInstance";
import { AuthContext } from "../AuthContext";
import axios from "axios";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import AxiosInterceptor from "../../component/AxiosInterceptor";

export const SbMemberDisplayContext = createContext();

export const SbMemberDisplayProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);
    const [isSummaryTerm, setSummaryTerm] = useState();
    const [terms, setTerms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");
    const [isGroupSpecificAuthor, setGroupSpecificAuthor] = useState("");

    const [isSBMember, setSBMember] = useState([]);
    const [isDropdown, setDropdown] = useState([]);
    const [isGroupFiles, setGroupFiles] = useState([]);
    const [isGroupPublicAuthor, setGroupPublicAuthor] = useState([]);

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [customError]);

    const FetchDisplaySbMember = useCallback(async () => {
        if (!authToken) return;
        try {
            const res = await AxiosInterceptor(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/SbmemberRoute`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            setSBMember(res.data.data);
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

    const DisplayYearTerm = useCallback(
        async () => {
            if (!authToken) return;

            try {
                setLoading(true);

                const res = await axiosInstance.get(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/SbmemberRoute/displaygroupbyyear`,
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            "Cache-Control": "no-cache",
                        },
                    }
                );

                setTerms(res.data.data);
            } catch (error) {
                console.error("Error fetching year terms:", error);
                setCustomError(error.message || "Failed to fetch year terms.");
            } finally {
                setLoading(false);
            }
        },
        [authToken]
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
        [setGroupPublicAuthor, setTotalPages, setCurrentPage],
    );

    const DisplaySpecificPublicAuthor = useCallback(
        async (queryParams = {}) => {
            try {
                const res = await axiosInstance.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/PublicSpecificFilterAuthor`,
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
                setGroupSpecificAuthor(res.data.data);

                setTotalPages(totalPages);
                setCurrentPage(currentPage);
            } catch (error) {
                console.error("Error fetching archived data:", error);
            }
        },
        [setGroupPublicAuthor, setTotalPages, setCurrentPage],
    );

    const AddSbData = async (values) => {
        try {

            console.log("Values", values)
            const formData = new FormData();

            const first_name = values.first_name?.trim() || "";
            const middle_name = values.middle_name?.trim() || "";
            const last_name = values.last_name?.trim() || "";

            formData.append("first_name", first_name);
            formData.append("last_name", last_name);
            formData.append("term", values.term || "");
            formData.append("Position", values.Position || "");
            formData.append("subPosition", values.subPosition || "");
            formData.append("term_from", values.term_from || "");
            formData.append("term_to", values.term_to || "");

            // ✅✅✅ I-STRINGIFY ang summary para hindi maging [object Object]
            if (values.summary) {
                const summaryString = typeof values.summary === 'string'
                    ? values.summary
                    : JSON.stringify(values.summary);
                formData.append("summary", summaryString);
                console.log("✅ Summary appended:", summaryString);
            } else {
                formData.append("summary", "[]"); // Empty array as default
                console.log("ℹ️ No summary, using empty array");
            }

            const isExOfficialValue = values.Position
                ?.trim()
                .toLowerCase()
                .startsWith("ex");

            formData.append("isExOfficial", isExOfficialValue ? "true" : "false");

            console.log("✅ isExOfficial (startsWith Ex):", isExOfficialValue);

            // ✅ Priority Number
            if (values.priorityNumber !== null && values.priorityNumber !== undefined) {
                formData.append("priorityNumber", values.priorityNumber.toString());
                console.log("✅ priorityNumber:", values.priorityNumber);
            } else {
                formData.append("priorityNumber", "");
            }

            // ✅ Static role
            formData.append("role", "sbmember");

            // ✅ Optional fields
            if (middle_name) formData.append("middle_name", middle_name);
            if (values.detailInfo) formData.append("detailInfo", values.detailInfo);
            if (values.district) formData.append("district", values.district);
            if (values.avatar) formData.append("avatar", values.avatar);

            // ✅✅✅ CHANGED: Selected Year Term - gamitin ang selectedYearFrom at selectedYearTo
            if (values.selectedYearFrom && values.selectedYearTo) {
                formData.append("selectedYearFrom", values.selectedYearFrom.toString());
                formData.append("selectedYearTo", values.selectedYearTo.toString());

            } else {
                console.log("ℹ️ No selectedYearFrom/To provided");
            }

            // 🔍 DEBUG FormData
            console.log("=== FINAL FORMDATA ENTRIES ===");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }

            // ✅ API CALL
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/signup`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

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
            console.error("❌ Error in AddSbData:", error);

            if (error.response?.data) {
                const message =
                    error.response.data.message ||
                    error.response.data.error ||
                    "Something went wrong.";

                setCustomError(message);
            } else if (error.request) {
                setCustomError("No response from the server.");
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
            }

            return { success: false, error: error.message };
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
            setModalStatus("failed");
            setShowModal(true);
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

        // Personal Information
        formData.append("first_name", values.first_name || "");
        formData.append("last_name", values.last_name || "");

        if (values.middle_name) {
            formData.append("middle_name", values.middle_name);
        }

        // Position - Use values.Position (capital P) from the form
        let positionValue = values.Position || values.position || "";

        // Ensure Position is a string, not an array
        if (Array.isArray(positionValue)) {
            const validValues = positionValue.filter(v => v && typeof v === 'string' && v.trim());
            positionValue = validValues.length > 0 ? validValues[validValues.length - 1] : '';
        }

        formData.append("Position", String(positionValue));

        // SubPosition
        const subPosValue = values.SubPosition || values.subPosition || "";
        formData.append("subPosition", subPosValue);


        // Priority Number
        let priorityNum = values.priorityNumber;
        if (priorityNum !== null && priorityNum !== undefined && priorityNum !== "") {
            formData.append("priorityNumber", String(priorityNum));
        } else {
            formData.append("priorityNumber", "");
        }

        // Ex-Official Status
        if (values.isExOfficial !== undefined) {
            formData.append("isExOfficial", values.isExOfficial ? "true" : "false");
        }

        if (values.selectedYearFrom && values.selectedYearTo) {
            formData.append("selectedYearFrom", values.selectedYearFrom.toString());
            formData.append("selectedYearTo", values.selectedYearTo.toString());
        } else if (values.year_from && values.year_to) {
            formData.append("year_from", values.year_from.toString());
            formData.append("year_to", values.year_to.toString());
        } else if (values.isExOfficial === true) {
            formData.append("year_from", "");
            formData.append("year_to", "");
        }

        // Term Information
        formData.append("term", values.term || "");
        formData.append("role", "sbmember");
        formData.append("district", values.district || "");

        if (values.term_from) {
            formData.append("term_from", values.term_from);
        }
        if (values.term_to) {
            formData.append("term_to", values.term_to);
        }
        if (values.detailInfo) {
            formData.append("detailInfo", values.detailInfo);
        }


        if (values.summary) {
            const summaryString = typeof values.summary === 'string' 
                ? values.summary 
                : JSON.stringify(values.summary);
            formData.append("summary", summaryString);
        } else {
            formData.append("summary", "[]");
        }

        // Avatar
        if (values.avatar && values.avatar instanceof File) {
            formData.append("avatar", values.avatar);
        }

        const response = await axiosInstance.patch(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/SbmemberRoute/${dataID}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        if (response.data?.status === "success") {
            if (response.data.data.isExOfficial) {
                console.log("Updated year_from:", response.data.data.year_from);
                console.log("Updated year_to:", response.data.data.year_to);
            }
            
            return { success: true, data: response.data.data };
        } else {
            console.error("❌ Unexpected response:", response.data);
            return { success: false, error: "Unexpected response from server." };
        }
    } catch (error) {
        console.error("❌ Error in UpdateSbmember:", error);
        console.error("Error response:", error.response?.data);
        
        const message = error.response?.data?.message || 
                       error.response?.data?.error || 
                       error.message || 
                       "Something went wrong.";

        setCustomError(message);
        setModalStatus("failed");
        setShowModal(true);

        return { success: false, error: message };
    }
};
    const DisplaySummaryTerm = useCallback(
        async (queryParams = {}) => {
            setSummaryTerm([]);

            try {
                const res = await axiosInstance.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/PublicSummaryTerm`,
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
                setTotalPages(totalPages);
                setCurrentPage(currentPage);
                setSummaryTerm(res.data.data || []);
            } catch (error) {
                console.error("Error fetching summary term:", error);
                setSummaryTerm([]);
            }
        },
        [setSummaryTerm, setTotalPages, setCurrentPage],
    );

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                await Promise.all([DisplayPerSb(), FetchDisplaySbMember(), DisplayPublicAuthor(), FetchDropdown(), DisplayYearTerm()]);
            } catch (err) {
                console.error("Error fetching SB data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [DisplayPerSb, FetchDisplaySbMember, DisplayPublicAuthor, DisplayYearTerm]);
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
                DisplaySummaryTerm,
                isSummaryTerm,
                isGroupSpecificAuthor,
                DisplaySpecificPublicAuthor, terms
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </SbMemberDisplayContext.Provider>
    );
};
