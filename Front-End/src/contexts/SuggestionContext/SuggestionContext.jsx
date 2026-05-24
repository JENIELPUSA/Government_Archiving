import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";

import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
export const SuggestionContext = createContext();

export const useSuggestion = () => useContext(SuggestionContext);

export const SuggestionProvider = ({ children }) => {
    const { authToken } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        total: 0,
        currentPage: 1,
        totalPages: 1,
    });

    const [currentFilters, setCurrentFilters] = useState({
        page: 1,
        limit: 10,
        dateFrom: "",
        dateTo: "",
    });

    const API = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL;

    // =========================
    // AXIOS AUTH CONFIG
    // =========================
    const authConfig = {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Cache-Control": "no-cache",
        },
    };

    // =========================
    // GET ALL SUGGESTIONS
    // =========================
    const getAllSuggestions = useCallback(
        async (queryParams = {}) => {
            try {
                setLoading(true);
                setError(null);

                const {
                    page = 1,
                    limit = 10,
                    dateFrom = "",
                    dateTo = ""
                } = queryParams;

                const params = new URLSearchParams();

                params.append("page", page);
                params.append("limit", limit);

                if (dateFrom) {
                    params.append("dateFrom", dateFrom);
                }

                if (dateTo) {
                    params.append("dateTo", dateTo);
                }

                const res = await axios.get(
                    `${API}/api/v1/Suggestions?${params.toString()}`,
                    authConfig
                );

                setSuggestions(res.data.data);

                setPagination({
                    total: res.data.totalSuggestions,
                    currentPage: res.data.currentPage,
                    totalPages: res.data.totalPages,
                });

                setCurrentFilters({
                    page,
                    limit,
                    dateFrom,
                    dateTo,
                });

                return res.data;
            } catch (err) {
                console.error("Error fetching suggestions:", err);

                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        },
        [API, authToken]
    );

    // =========================
    // INITIAL FETCH
    // =========================
    useEffect(() => {
        if (authToken) {
            getAllSuggestions();
        }
    }, [authToken]);

    // =========================
    // CREATE
    // NO AUTH TOKEN
    // =========================
    const createSuggestion = useCallback(
        async (data) => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.post(
                    `${API}/api/v1/Suggestions`,
                    data
                );

                if (res.data.status === "Success") {
                    setModalStatus("success");
                    setShowModal(true);
                    return { success: true };
                } else {
                    setModalStatus("failed");
                    setShowModal(true);
                    return { success: false, error: "Unexpected response from server." };
                }

            } catch (err) {
                console.error("Error creating suggestion:", err);

                setError(
                    err.response?.data?.message || err.message
                );
            } finally {
                setLoading(false);
            }
        },
        [API]
    );

    // =========================
    // GET BY ID
    // =========================
    const getSuggestionById = useCallback(
        async (id) => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(
                    `${API}/api/v1/Suggestions/${id}`,
                    authConfig
                );

                return res.data.data;
            } catch (err) {
                console.error("Error fetching suggestion:", err);

                setError(
                    err.response?.data?.message || err.message
                );
            } finally {
                setLoading(false);
            }
        },
        [API, authToken]
    );

    // =========================
    // UPDATE
    // =========================
    const updateSuggestion = useCallback(
        async (id, data) => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.patch(
                    `${API}/api/v1/Suggestions/${id}`,
                    data,
                    authConfig
                );

                await getAllSuggestions(currentFilters);

                return res.data;
            } catch (err) {
                console.error("Error updating suggestion:", err);

                setError(
                    err.response?.data?.message || err.message
                );
            } finally {
                setLoading(false);
            }
        },
        [API, authToken, getAllSuggestions, currentFilters]
    );

    // =========================
    // DELETE
    // =========================
    const deleteSuggestion = useCallback(
        async (id) => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.delete(
                    `${API}/api/v1/Suggestions/${id}`,
                    authConfig
                );


                if (response.data.status === "success") {
                    return { success: true };
                    await getAllSuggestions(currentFilters);
                } else {
                    setModalStatus("failed");
                    setShowModal(true);
                    return { success: false };
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                setModalStatus("failed");
                setShowModal(true);
            }
        },
        [API, authToken, getAllSuggestions, currentFilters]
    );

    // =========================
    // REFRESH
    // =========================
    const refreshSuggestions = useCallback(async () => {
        await getAllSuggestions(currentFilters);
    }, [getAllSuggestions, currentFilters]);

    // =========================
    // CLEAR ERROR
    // =========================
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return (
        <SuggestionContext.Provider
            value={{
                suggestions,
                loading,
                error,
                pagination,
                currentFilters,
                setCurrentFilters,

                createSuggestion,
                getAllSuggestions,
                getSuggestionById,
                updateSuggestion,
                deleteSuggestion,
                refreshSuggestions,
                clearError,
            }}
        >
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={error}
            />
        </SuggestionContext.Provider>
    );
};