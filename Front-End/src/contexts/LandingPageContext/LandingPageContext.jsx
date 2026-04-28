import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const LandingPageContext = createContext();

export const LandingPageProvider = ({ children }) => {
    // Gagamitin na lang ang authToken sa Save (admin actions)
    const { authToken } = useContext(AuthContext);

    const [landingData, setLandingData] = useState({
        title: "",
        subtitle: "",
        Mission: "",
        Vission: "",
        avatar: [],
    });

    const [loading, setLoading] = useState(true);
    const [customError, setCustomError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");

    const BASE_URL = `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/landing`;

    // 1. FETCH - Tinanggal ang authToken dito
    const FetchLandingPage = useCallback(async () => {
        setLoading(true);
        try {
            // Public GET request
            const res = await axios.get(BASE_URL);

            const data = res.data?.data || {};
            setLandingData({
                title: data.title || "",
                subtitle: data.subtitle || "",
                Mission: data.Mission || "",
                Vission: data.Vission || "",
                Display: data.Display || false,
                avatar: Array.isArray(data.avatar) ? data.avatar : [],
            });
        } catch (error) {
            console.error("Error fetching landing page:", error);
        } finally {
            setLoading(false);
        }
    }, [BASE_URL]); // Stable dependency

    useEffect(() => {
        FetchLandingPage();
    }, [FetchLandingPage]);

    // 2. SAVE - Dito lang kailangan ang authToken
    const SaveLandingPage = async (values) => {
        try {
            const formData = new FormData();
            formData.append('title', values.title || "");
            formData.append('subtitle', values.subtitle || "");
            formData.append('Mission', values.Mission || "");
            formData.append('Vission', values.Vission || "");

            if (values.avatar?.length > 0) {
                values.avatar.forEach((item) => {
                    if (item instanceof File) formData.append('avatar', item);
                    else if (item.file instanceof File) formData.append('avatar', item.file);
                    else if (item.url && !item.url.startsWith('blob:')) {
                        formData.append('existingAvatars', JSON.stringify(item));
                    }
                });
            }

            const response = await axios.post(BASE_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`
                },
            });

            if (response.data) {
                setModalStatus("success");
                setShowModal(true);
                FetchLandingPage();
                return response.data;
            }
        } catch (error) {
            setModalStatus("failed");
            setCustomError(error.response?.data?.message || "Failed to update content.");
            setShowModal(true);
            throw error;
        }
    };

    // 3. Local Helpers (Naka-useCallback para hindi mag-trigger ng re-render sa child components)
    const AddAvatarLocal = useCallback((files) => {
        const newImages = Array.from(files).map((file) => ({
            url: URL.createObjectURL(file),
            public_id: `temp_${Math.random().toString(36).substring(2, 10)}`,
            file,
        }));

        setLandingData((prev) => ({
            ...prev,
            avatar: [...(prev.avatar || []), ...newImages],
        }));
    }, []);

    const DeleteAvatarLocal = useCallback((public_id) => {
        setLandingData((prev) => {
            const deletedImg = prev.avatar.find(img => img.public_id === public_id);
            if (deletedImg?.url?.startsWith('blob:')) URL.revokeObjectURL(deletedImg.url);

            return {
                ...prev,
                avatar: prev.avatar.filter((img) => img.public_id !== public_id),
            };
        });
    }, []);

    // 4. MEMOIZED CONTEXT VALUE - Ito ang sikreto para hindi "maraming render"
    const contextValue = useMemo(() => ({
        landingData,
        loading,
        FetchLandingPage,
        SaveLandingPage,
        AddAvatarLocal,
        DeleteAvatarLocal,
        setLandingData,
        setCustomError,
        setShowModal,
        setModalStatus
    }), [landingData, loading, FetchLandingPage, SaveLandingPage, AddAvatarLocal, DeleteAvatarLocal]);

    return (
        <LandingPageContext.Provider value={contextValue}>
            {children}
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                errorMessage={customError}
            />
        </LandingPageContext.Provider>
    );
};