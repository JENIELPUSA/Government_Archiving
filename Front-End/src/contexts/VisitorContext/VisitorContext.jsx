import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback,
    useMemo
} from "react";

import axiosInstance from "../../ReusableFolder/axioxInstance";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import { AuthContext } from "../AuthContext";

export const VisitorContext = createContext();

export const VisitorProvider = ({ children }) => {

    const { authToken } = useContext(AuthContext);

    const [visitorCount, setVisitorCount] = useState(0);

    const [visitorGraph, setVisitorGraph] = useState({});
    const [graphLoading, setGraphLoading] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [customError, setCustomError] = useState("");

    // =========================
    // FIX: stable config
    // =========================
    const authConfig = useMemo(() => ({
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${authToken}`,
            "Cache-Control": "no-cache",
        },
    }), [authToken]);

    // =========================
    // GET VISITOR COUNT
    // =========================
    const fetchVisitorCount = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Visitor`,
                authConfig
            );

            if (res.data.success) {
                setVisitorCount(res.data.count);
            }

        } catch (error) {
            setError(error.response?.data?.message || "Failed visitor count");
        } finally {
            setLoading(false);
        }
    }, [authConfig]);

    // =========================
    // 📊 GET VISITOR GRAPH (SAFE)
    // =========================
    const fetchVisitorGraph = useCallback(async (from = "", to = "") => {
        try {
            setGraphLoading(true);

            const res = await axiosInstance.get(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Visitor/getgraph`,
                {
                    params: { from, to },
                    ...authConfig
                }
            );

            if (res.data.success) {
                setVisitorGraph(res.data.data);
            }

        } catch (error) {
            setError(error.response?.data?.message || "Failed graph");
        } finally {
            setGraphLoading(false);
        }
    }, [authConfig]);

    // =========================
    // AUTO FETCH ONLY COUNT
    // =========================
    useEffect(() => {
        if (authToken) {
            fetchVisitorCount();
            fetchVisitorGraph();
        }
    }, [authToken, fetchVisitorCount, fetchVisitorGraph]);


    console.log("visitorGraph", visitorGraph)

    return (
        <VisitorContext.Provider value={{
            visitorCount,
            fetchVisitorCount,

            visitorGraph,
            fetchVisitorGraph,
            graphLoading,

            loading,
            error,
        }}>
            {children}

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                message={modalStatus === "failed" ? customError : ""}
            />
        </VisitorContext.Provider>
    );
};