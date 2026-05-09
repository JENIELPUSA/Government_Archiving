import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../ReusableFolder/axioxInstance";
import SuccessFailed from "../../ReusableFolder/SuccessandField";

export const EventContext = createContext();

export const EventDisplayProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [monthEvent, setMonthEvent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { authToken } = useContext(AuthContext);

  // PAGINATION + SEARCH
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const limit = 6;

  // MODAL
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [customError, setCustomError] = useState("");

  // FETCH EVENTS
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Events`,
        {
          params: {
            page: currentPage,
            limit,
            search: searchTerm,
          },
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (res.data.status === "success") {
        setEvents(res.data.data);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(error.response?.data?.message || "Failed to fetch events.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsMonth = async () => {
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Events/currentmonth`
      );

      if (res.data.status === "success") {
        setMonthEvent(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching month events:", error);
      setError(error.response?.data?.message || "Failed to fetch month events.");
    }
  };

  // AUTO FETCH EVENTS (with pagination and search)
  useEffect(() => {
    if (!authToken) return;
    
    const delayDebounce = setTimeout(() => {
      fetchEvents();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, searchTerm, authToken]);

  // AUTO FETCH MONTH EVENTS (no dependencies - runs once on mount)
  useEffect(() => {
    fetchEventsMonth();
  }, []);

  // ADD EVENT
  const AddEvent = async (values) => {
    try {
      const res = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Events`,
        values,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (res.data.status === "success") {
        await fetchEvents();
        setModalStatus("success");
        setCustomError("");
        setShowModal(true);
      }
    } catch (error) {
      setCustomError(error.response?.data?.message || "Failed to add event.");
      setModalStatus("failed");
      setShowModal(true);
    }
  };

  console.log("monthEvent",monthEvent)

  // UPDATE EVENT
  const UpdateEvent = async (id, updatedValues) => {
    try {
      const res = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Events/${id}`,
        updatedValues,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (res.data.status === "success") {
        setEvents((prev) =>
          prev.map((event) => (event._id === id ? res.data.data : event))
        );

        setModalStatus("success");
        setCustomError("");
        setShowModal(true);
      }
    } catch (error) {
      setCustomError(error.response?.data?.message || "Failed to update event.");
      setModalStatus("failed");
      setShowModal(true);
    }
  };

  // DELETE EVENT
  const DeleteEvent = async (id) => {
    try {
      const res = await axiosInstance.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Events/${id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (res.data.status === "success") {
        await fetchEvents();
        setModalStatus("success");
        setCustomError("");
        setShowModal(true);
      }
    } catch (error) {
      setCustomError(error.response?.data?.message || "Failed to delete event.");
      setModalStatus("failed");
      setShowModal(true);
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        monthEvent,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        totalPages,
        totalCount,
        fetchEvents,
        AddEvent,
        UpdateEvent,
        DeleteEvent,
      }}
    >
      {children}

      <SuccessFailed
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
        message={modalStatus === "failed" ? customError : ""}
      />
    </EventContext.Provider>
  );
};