import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import axiosInstance from "../../ReusableFolder/axioxInstance";
export const FilesDisplayContext = createContext();

export const FilesDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const { authToken } = useContext(AuthContext);
    const [isTags, setTags] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [isLatestBill, setLatestBill] = useState([]);
    const [isFile, setFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [isPublicData, setPublicData] = useState([]);
    const [isSpecificData, setSpecificData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isTotaDocuments, setTotalDocuments] = useState(0);
    const [isTodayDocuments, setTodayDocuments] = useState(0);
    const [isActiveTags, setActiveTags] = useState([]);
    const [filters, setFilters] = useState({});
    const [isArchived, setArchived] = useState([]);
    const [CountAll, setCountAll] = useState(0);

    const [isDeletedData, setDeletedData] = useState([]);
    const [isForRestoreData, setForRestoreData] = useState([]);
    const [isArchivedData, setArchivedData] = useState([]);
    const [isCount, setCount] = useState([]);
    const [isPublicDatas, setPublicDatas] = useState([]);

    const [currentPageDeleted, setTotalPagesDeleted] = useState([]);
    const [currentPageForRestore, setTotalPagesForRestore] = useState([]);
    const [currentPageArchived, setTotalPagesArchived] = useState([]);
    const [currentPagePublic, setTotalPagesPublic] = useState({});
    const [Archivedtotalpage, setArchivedtotalpage] = useState({});
    const [Archivedcurrentpage, setArchivedcurrentpage] = useState({});
    const [isPublic, setPublic] = useState({});
    const [isPublictotalpage, setPublictotalpage] = useState({});
    const [isPubliccurrentpage, setPubliccurrentpage] = useState({});
    useEffect(() => {
        if (!authToken) return;

        const fetchAll = async () => {
            try {
                setLoading(true); // start loading
                await Promise.all([FetchFiles(), fetchpublicdata(), FetchArchiveFiles(), fetchAchivedData()]);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false); // stop loading
            }
        };

        fetchAll();
    }, [authToken]);

    useEffect(() => {
        fetchpublicdata();
        fetchlatestdata();
        fetchPublicDisplay();
    }, []);

    useEffect(() => {
        if (customError) {
            const timer = setTimeout(() => {
                setCustomError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [customError]);

    const AddFiles = async (formData) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (res.data.status === "success") {
                const newFile = res.data.data;
                await Promise.all([FetchFiles(), fetchpublicdata()]);
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newFile };
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
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: message };
            } else if (error.request) {
                setCustomError("No response from the server.");
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "No response from the server." };
            } else {
                setCustomError(error.message || "Unexpected error occurred.");
                return {
                    success: false,
                    error: error.message || "Unexpected error",
                };
            }
        }
    };
    const fetchpublicdata = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/GetPublicData`, {
                withCredentials: true,
            });
            const user = res?.data?.data;
            setPublicData(user);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchlatestdata = async () => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/GetLatestBill`,
                {},
                { withCredentials: true },
            );

            const { latestBill } = res.data;
            setLatestBill(latestBill);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const FetchFiles = useCallback(
        async (page = 1, customFilters = {}) => {
            if (!authToken) return;

            try {
                const params = { page, limit: 5 };

                if (customFilters.title?.trim()) params.title = customFilters.title;
                if (customFilters.tags?.length) params.tags = customFilters.tags;
                if (customFilters.status?.trim()) params.status = customFilters.status;
                if (customFilters.category?.trim()) params.category = customFilters.category;
                if (customFilters.dateFrom?.trim()) params.dateFrom = customFilters.dateFrom;
                if (customFilters.dateTo?.trim()) params.dateTo = customFilters.dateTo;

                const res = await axiosInstance.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files`, {
                    params,
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                });

                const { activeTags, data, totalPages, currentPage, totalCount, totalDocumentsToday } = res.data;
                setFiles(data);
                setTotalDocuments(totalCount);
                setTotalPages(totalPages);
                setCurrentPage(currentPage);
                setTodayDocuments(totalDocumentsToday);
                setActiveTags(activeTags);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        [authToken, setFiles, setTotalDocuments, setTotalPages, setCurrentPage, setTodayDocuments],
    );

    const InsertOfficer = async (dataId, values) => {
        try {
            const dataToSend = {
                officer: values.officer,
            };
            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/OfficerUpdate/${dataId}`,
                dataToSend,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (response.data && response.data.status === "success") {
                const newFile = response.data.data;
                setFiles((prevFiles) => prevFiles.map((f) => (f._id === response.data.data._id ? { ...f, ...response.data.data } : f)));
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newFile };
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

    const DeleteFiles = async (ID) => {
        try {
            const response = await axiosInstance.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${ID}`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data.status === "success") {
                setFiles((prevUsers) => prevUsers.filter((user) => user._id !== ID));
                setModalStatus("success");
                setShowModal(true);
                return { success: true };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const UpdateFiles = async (bornID, values) => {
        try {
            const dataToSend = {
                category: values.categoryID || "",
                fullText: values.fullText || "",
                summary: values.summary || "",
                title: values.title || "",
                author: values.author ? values.author : null,
            };

            const response = await axiosInstance.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/UpdateFileDocument/${bornID}`,
                dataToSend,
                {
                    headers: { Authorization: `Bearer ${authToken}` },
                },
            );

            if (response.data && response.data.status === "success") {
                FetchFiles();
                setModalStatus("success");
                setShowModal(true);
                return { success: true };
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

    const MOveArchived = async (bornID, value) => {
        try {
            const dataToSend = {
                ArchivedStatus: value,
            };

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${bornID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                const newFile = response.data.data;
                fetchAchivedData();
                FetchFiles();
                setModalStatus("success");
                setShowModal(true);
                return { success: true, data: newFile };
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

    const UpdateStatus = async (bornID, values) => {
        try {
            let dataToSend = {
                status: values.status || "",
            };

            if (values.status === "Rejected") {
                if (!values.note || values.note.trim() === "") {
                    setCustomError("Note is required when status is Rejected.");
                    return;
                }
                dataToSend.suggestion = values.note;
            }

            const response = await axiosInstance.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${bornID}`, dataToSend, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (response.data && response.data.status === "success") {
                console.log("Status Data");
                const newFile = response.data.data;
                return { success: true, data: newFile };
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
    const getSpeficFile = async (ID) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/${ID}`, {
                withCredentials: true,
            });
            const user = res?.data?.data;
            setSpecificData(user);
            return { success: true, data: user };
        } catch (error) {
            console.error("Error fetching data:", error);
            return { success: false, data: null };
        }
    };

    const FetchArchiveFiles = useCallback(
        async (searchTerm = "", tags = []) => {
            if (!authToken) return;

            try {
                const res = await axiosInstance.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/ArchiveFile`, {
                    params: {
                        pageDeleted: currentPageDeleted,
                        pageForRestore: currentPageForRestore,
                        pageArchived: currentPageArchived,
                        pagePublic: currentPagePublic,
                        search: searchTerm,
                        tags: tags.join(","),
                    },
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Cache-Control": "no-cache",
                    },
                });

                const { deleted, forRestore, archived, public: publicData, counts, totalPages } = res.data;

                setDeletedData(deleted);
                setForRestoreData(forRestore);
                setArchivedData(archived);
                setPublicDatas(publicData);
                setCount(counts);
                setTotalPagesDeleted(totalPages.deleted);
                setTotalPagesForRestore(totalPages.forRestore);
                setTotalPagesArchived(totalPages.archived);
                setTotalPagesPublic(totalPages.public);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        [authToken, currentPageDeleted, currentPageForRestore, currentPageArchived, currentPagePublic],
    );

    const fetchAchivedData = useCallback(
        async (queryParams = {}) => {
            try {
                queryParams.limit = 9;
                const res = await axiosInstance.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/GetArchivedData`,
                    {},
                    {
                        withCredentials: true,
                        params: queryParams,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            "Cache-Control": "no-cache",
                        },
                    },
                );

                const { currentPage, totalPages, archivedStatusCounts, tags, counts } = res.data;
                const ArchivedData = res.data.data || [];
                setArchived(ArchivedData);
                setArchivedtotalpage(totalPages);
                setArchivedcurrentpage(currentPage);
                setCountAll(counts);
                setTags(tags);
            } catch (error) {
                console.error("Error fetching archived data:", error);
            }
        },
        [authToken],
    );

    const fetchPublicDisplay = useCallback(
        async (queryParams = {}) => {
            try {
                const res = await axiosInstance.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Files/DocumentPerYear`,
                    {},
                    {
                        withCredentials: true,
                        params: queryParams,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            "Cache-Control": "no-cache",
                        },
                    },
                );

                const ArchivedData = res.data || []; // array of year groups
                setPublic(ArchivedData);

                // Example: pag gusto mo lang first year’s pagination
                if (ArchivedData.length > 0) {
                    setPublictotalpage(ArchivedData[0].totalPages || 1);
                    setPubliccurrentpage(ArchivedData[0].currentPage || 1);
                } else {
                    setPublictotalpage(1);
                    setPubliccurrentpage(1);
                }
            } catch (error) {
                console.error("Error fetching archived data:", error);
            }
        },
        [authToken],
    );

    return (
        <FilesDisplayContext.Provider
            value={{
                isPublic,
                isPublictotalpage,
                isPubliccurrentpage,
                AddFiles,
                isFile,
                DeleteFiles,
                UpdateFiles,
                MOveArchived,
                UpdateStatus,
                InsertOfficer,
                isPublicData,
                setFiles,
                isSpecificData,
                getSpeficFile,
                FetchFiles,
                totalPages,
                currentPage,
                setCurrentPage,
                isTotaDocuments,
                isTodayDocuments,
                setFilters,
                filters,
                isActiveTags,
                customError,
                isLatestBill,
                isDeletedData,
                isForRestoreData,
                isArchivedData,
                isCount,
                isPublicDatas,
                fetchAchivedData,
                isArchived,
                Archivedtotalpage,
                Archivedcurrentpage,
                fetchPublicDisplay,
                CountAll,
                isTags,
                isLoading,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </FilesDisplayContext.Provider>
    );
};
