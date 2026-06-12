import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const LandingPageContext = createContext();

export const LandingPageProvider = ({ children }) => {
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

  const FetchLandingPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE_URL);
      const data = res.data?.data || {};
      setLandingData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        Mission: data.Mission || "",
        Vission: data.Vission || "",
        avatar: Array.isArray(data.avatar) ? data.avatar : [],
      });
    } catch (error) {
      console.error("Error fetching landing page:", error);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    FetchLandingPage();
  }, [FetchLandingPage]);

  const SaveLandingPage = async (payload) => {
    try {
      const response = await axios.post(BASE_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.data) {
        setModalStatus("success");
        setShowModal(true);
        FetchLandingPage(); // refresh data
        return response.data;
      }
    } catch (error) {
      setModalStatus("failed");
      setCustomError(error.response?.data?.message || "Failed to update content.");
      setShowModal(true);
      throw error;
    }
  };

  const contextValue = useMemo(
    () => ({
      landingData,
      loading,
      FetchLandingPage,
      SaveLandingPage,
      setLandingData,
      setCustomError,
      setShowModal,
      setModalStatus,
    }),
    [landingData, loading, FetchLandingPage, SaveLandingPage]
  );

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