import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const LogsAndAuditContext = createContext();

export const LogsDisplayProvider = ({ children }) => {
    const [isLogs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { authToken } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

const fetchLogs = async (page = 1, type = "", dateFrom = "", dateTo = "") => {
    if (!authToken) return;

    try {
        const params = { page, limit: 10 };

        if (type?.trim()) params.type = type;
        if (dateFrom?.trim()) params.dateFrom = dateFrom;
        if (dateTo?.trim()) params.dateTo = dateTo;

        const res = await axiosInstance.get(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/LogsAudit`,
            {
                params,
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );

        const { data, totalPages, currentPage } = res.data;
        setLogs(data);
        setTotalPages(totalPages);
        setCurrentPage(currentPage);
    } catch (error) {
        console.error("Error fetching logs:", error);
        setError("Failed to fetch data.");
    }
};



    useEffect(() => {
        fetchLogs();
    }, [authToken]);

    return (
        <LogsAndAuditContext.Provider value={{ isLogs, totalPages, currentPage, setCurrentPage, fetchLogs}}>
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </LogsAndAuditContext.Provider>
    );
};
