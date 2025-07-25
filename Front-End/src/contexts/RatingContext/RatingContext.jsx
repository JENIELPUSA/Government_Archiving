import React, { createContext, useState, useContext, useCallback, useMemo } from "react";
import axios from "axios";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const RatingDisplayContext = createContext();

export const useComments = () => useContext(RatingDisplayContext);

export const RatingDisplayProvider = ({ children }) => {
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("");
    const [isRatings, setRatings] = useState([]);

    const getRatingsByPdfId = useCallback(
        async (pdfId) => {
            if (!pdfId) {
                setRatings({ averageRating: 0, totalRatingsCount: 0 });
                return null;
            }
            try {
                const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Ratings/${pdfId}`, {
                    withCredentials: true,
                    headers: {
                        "Cache-Control": "no-cache",
                    },
                });

                console.log("Ratings fetched:", response.data);

                if (response.status === 200) {
                    const { averageRating, totalRatingsCount } = response.data;

                    if (JSON.stringify(isRatings) !== JSON.stringify({ averageRating, totalRatingsCount })) {
                        setRatings({ averageRating, totalRatingsCount });
                    }

                    return { success: true, data: { averageRating, totalRatingsCount } };
                } else {
                    return { success: false, error: "Unexpected response from server." };
                }
            } catch (error) {
                console.error("Error fetching ratings:", error);
                setModalStatus("error");
                setShowModal(true);
                return [];
            }
        },
        [isRatings],
    );

    const createRatings = useCallback(
        async ({ pdfId, rating }) => {
            console.log(pdfId);
            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Ratings`,
                    { documentId: pdfId, rating },
                    { withCredentials: true },
                );

                if (response.data.status === "success") {
                    setModalStatus("success");
                    setShowModal(true);
                    getRatingsByPdfId(pdfId);
                    return { success: true, data: response };
                } else {
                    setModalStatus("failed");
                    setShowModal(true);
                    return { success: false, error: "Unexpected response from server." };
                }
            } catch (error) {
                console.error("Error creating rating:", error);
                setModalStatus("error");
                setShowModal(true);
                return { success: false, error };
            }
        },
        [getRatingsByPdfId],
    );

    const contextValue = useMemo(() => {
        return {
            createRatings,
            getRatingsByPdfId,
            showModal,
            setShowModal,
            modalStatus,
            isRatings,
        };
    }, [createRatings, getRatingsByPdfId, showModal, setShowModal, modalStatus, isRatings]);

    return (
        <RatingDisplayContext.Provider value={contextValue}>
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </RatingDisplayContext.Provider>
    );
};
