import React, { createContext, useState, useContext, useCallback, useMemo } from "react";
import axios from "axios";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import { AuthContext } from "../AuthContext";
export const CommentsDisplayContext = createContext();

export const useComments = () => useContext(CommentsDisplayContext);

export const CommentDisplayProvider = ({ children }) => {
    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [modalStatus, setModalStatus] = useState("");
    const [isComments, setComments] = useState([]);
    const [allcomments, setAllComments] = useState([]);
    const { authToken } = useContext(AuthContext);
    const createComment = useCallback(async ({ pdfId, commentText }) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Comments`,
                { pdfId, commentText },
                { withCredentials: true },
            );

            if (res.data.status === "success") {
                setModalStatus("success");
                setShowModal(true);
                getCommentsByPdfId(pdfId);
                return { success: true };
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            console.error("Error creating comment:", error);
            setModalStatus("error");
            setShowModal(true);
            return { success: false, error };
        }
    }, []);

    const getCommentsByPdfId = useCallback(
        async (pdfId) => {
            if (!pdfId) {
                setComments([]);
                return null;
            }
            try {
                const res = await axios.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Comments/getComments`,
                    { pdfId },
                    { withCredentials: true },
                );
                if (JSON.stringify(isComments) !== JSON.stringify(res.data.data || [])) {
                    setComments(res.data.data || []);
                }
                return res.data.data;
            } catch (error) {
                console.error("Error fetching comments:", error);
                setModalStatus("error");
                setShowModal(true);
                return [];
            }
        },
        [isComments],
    );

    const getAllComments = useCallback(async () => {
        if (!authToken) return;

        setLoading(true);
        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Comments/allComments`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const allComments = res?.data?.data;
            console.log("Check Component", allComments);
            setAllComments(allComments);
        } catch (error) {
            console.error("Error fetching all comments:", error);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    const UpdateStatus = async (commentId, newStatus) => {
        try {
            const dataToSend = {
                status: newStatus || "",
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Comments/${commentId}`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            const updated = response.data?.updatedComment || response.data?.data;

            if (updated) {
                // Update comment in local state
                setAllComments((prevComments) => prevComments.map((comment) => (comment._id === updated._id ? { ...comment, ...updated } : comment)));

                setModalStatus("success");
                setShowModal(true);
            } else {
                setModalStatus("failed");
                setShowModal(true);
                return { success: false, error: "No updated comment returned from server." };
            }
        } catch (error) {
            let errorMessage = "Unexpected error occurred.";

            if (error.response?.data) {
                const err = error.response.data;
                errorMessage = typeof err === "string" ? err : err.message || err.error || errorMessage;
            } else if (error.request) {
                errorMessage = "No response from the server.";
            } else {
                errorMessage = error.message || errorMessage;
            }

            setCustomError(errorMessage);
            setModalStatus("failed");
            setShowModal(true);
        }
    };

    const contextValue = useMemo(() => {
        return {
            createComment,
            getCommentsByPdfId,
            showModal,
            setShowModal,
            modalStatus,
            isComments,
            getAllComments,
            setAllComments,
            allcomments,
            UpdateStatus,
        };
    }, [
        createComment,
        getCommentsByPdfId,
        showModal,
        setShowModal,
        modalStatus,
        isComments,
        allcomments,
        getAllComments,
        setAllComments,
        UpdateStatus,
    ]);

    return (
        <CommentsDisplayContext.Provider value={contextValue}>
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </CommentsDisplayContext.Provider>
    );
};
