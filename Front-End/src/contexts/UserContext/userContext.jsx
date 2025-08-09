import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export const UserDisplayContext = createContext();

export const UserDisplayProvider = ({ children }) => {
  const [isUser, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Optional: Fetch user data if needed without token
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`,
        {
          withCredentials: true,
        }
      );

      const user = res?.data?.data;
      setUser(user);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <UserDisplayContext.Provider
      value={{
        isUser,
        loading,
        error,
        refreshUser: fetchUserData,
      }}
    >
      {children}
    </UserDisplayContext.Provider>
  );
};
