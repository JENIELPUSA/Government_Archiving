import React, { createContext, useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "../../ReusableFolder/axioxInstance";

export const VisitorContext = createContext();

// Helper function to get or create session ID from sessionStorage
const getSessionId = () => {
    let sessionId = sessionStorage.getItem("visitorSessionId");
    if (!sessionId) {
        sessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem("visitorSessionId", sessionId);
        return { sessionId, isNew: true };
    }
    return { sessionId, isNew: false };
};

export const VisitorProvider = ({ children }) => {
    const [visitorCount, setVisitorCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isNewSession, setIsNewSession] = useState(false);
    const [todayVisits, setTodayVisits] = useState(0);
    const [uniqueSessions, setUniqueSessions] = useState(0);

    // Graph states
    const [visitorGraph, setVisitorGraph] = useState([]);
    const [graphLoading, setGraphLoading] = useState(false);
    const [graphError, setGraphError] = useState(null);

    const hasFetched = useRef(false);
    const sessionInfo = useRef(getSessionId());

    // Fetch visitor count with session tracking
    const fetchVisitorCounts = useCallback(async () => {
        // Prevent multiple fetches in the same session
        if (hasFetched.current) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { sessionId, isNew: frontendNewSession } = sessionInfo.current;
            // Make API request with session ID in headers
            const response = await axiosInstance.get("/api/v1/Visitor", {
                headers: {
                    "X-Session-Id": sessionId
                }
            });

            if (response.data && response.data.success) {
                setVisitorCount(response.data.count);
                setIsNewSession(response.data.isNewSession || false);

                if (response.data.stats) {
                    setTodayVisits(response.data.stats.todayVisits || 0);
                    setUniqueSessions(response.data.stats.uniqueSessions || 0);
                }

                hasFetched.current = true;
            } else {
                setError("Invalid response from server");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to fetch visitor count");
        } finally {
            setLoading(false);
        }
    }, []);

    // Track page view
    const trackPageView = useCallback(async (pageName) => {
        try {
            const { sessionId } = sessionInfo.current;
            await axiosInstance.post("/api/v1/Visitor/page-view",
                { page: pageName, timestamp: new Date().toISOString() },
                {
                    headers: {
                        "X-Session-Id": sessionId
                    }
                }
            );
        } catch (err) {
            // Don't set error state for page views to avoid UI disruption
        }
    }, []);

    // Reset visitor count (admin function)
    const resetVisitorCount = useCallback(async () => {
        try {
            setLoading(true);
            await axiosInstance.delete("/api/v1/Visitor/reset");

            // Reset local state
            setVisitorCount(0);
            setIsNewSession(false);
            setVisitorGraph([]);
            hasFetched.current = false;

            // Clear session storage to force new session on next visit
            sessionStorage.removeItem("visitorSessionId");
            sessionInfo.current = getSessionId();

            // Refetch the count
            await fetchVisitorCounts();
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset visitor count");
            return false;
        } finally {
            setLoading(false);
        }
    }, [fetchVisitorCounts]);

    // =========================
    // 📊 FETCH VISITOR GRAPH
    // =========================
    const fetchVisitorGraph = useCallback(async (from = "", to = "") => {
        setGraphLoading(true);
        setGraphError(null);

        try {
            // Get auth token from localStorage or context
            const token = localStorage.getItem("token");

            const response = await axiosInstance.get("/api/v1/Visitor/getgraph", {
                params: {
                    from: from || undefined,
                    to: to || undefined
                },
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined
                }
            });

            if (response.data && response.data.success) {
                setVisitorGraph(response.data.data || []);
                return response.data;
            } else {
                setGraphError("Failed to load graph data");
                setVisitorGraph([]);
            }
        } catch (err) {
            setGraphError(err.response?.data?.message || "Failed to fetch visitor graph");
            setVisitorGraph([]);
        } finally {
            setGraphLoading(false);
        }
    }, []);

    // Get visitor stats (admin function)
    const getVisitorStats = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axiosInstance.get("/api/v1/Visitor/stats", {
                headers: {
                    Authorization: token ? `Bearer ${token}` : undefined
                }
            });
            if (response.data && response.data.success) {
                return response.data.stats;
            }
            return null;
        } catch (err) {
            return null;
        }
    }, []);

    // Auto-fetch on mount (only once)
    useEffect(() => {
        if (!hasFetched.current) {
            fetchVisitorCounts();
        }
    }, [fetchVisitorCounts]);

    // Debug: Log when page is being closed or refreshed
    useEffect(() => {
        const handleBeforeUnload = () => {
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    const value = {
        // Visitor count states
        visitorCount,
        loading,
        error,
        isNewSession,
        todayVisits,
        uniqueSessions,

        // Graph states
        visitorGraph,
        graphLoading,
        graphError,

        // Functions
        fetchVisitorCounts,
        trackPageView,
        resetVisitorCount,
        getVisitorStats,
        fetchVisitorGraph
    };

    return (
        <VisitorContext.Provider value={value}>
            {children}
        </VisitorContext.Provider>
    );
};