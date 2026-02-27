import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem("token") || null);
    const [role, setRole] = useState(localStorage.getItem("role") || null);
    const [email, setEmail] = useState(localStorage.getItem("email") || null);
    const [first_name, setfirst_name] = useState(localStorage.getItem("first_name") || null);
    const [last_name, setlast_name] = useState(localStorage.getItem("last_name") || null);
    const [contact_number, setcontact_number] = useState(localStorage.getItem("contact_number") || null);
    const [userId, setUserID] = useState(localStorage.getItem("userId") || null);
    const [linkId, setlinkId] = useState(localStorage.getItem("linkId") || null);
    const [isLoading, setLoading] = useState(false);
    const [Designatedzone, setDesignatedzone] = useState(localStorage.getItem("Designatedzone") || null);
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
    const [Profile, setProfile] = useState("");
    useEffect(() => {
        if (authToken) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [authToken]);

    const login = async (inputEmail, password) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/login`,
                { email: inputEmail, password },
                { withCredentials: true },
            );

            if (res.data.status === "Success") {
                const { token, role, email: serverEmail, first_name, last_name, contact_number, userId, linkId, Designatedzone, theme } = res.data;

                localStorage.setItem("token", token);
                localStorage.setItem("role", role);
                localStorage.setItem("email", serverEmail);
                localStorage.setItem("first_name", first_name);
                localStorage.setItem("last_name", last_name);
                localStorage.setItem("contact_number", contact_number);
                localStorage.setItem("userId", userId);
                localStorage.setItem("linkId", linkId);
                localStorage.setItem("Designatedzone", Designatedzone);
                localStorage.setItem("authToken", token);
                localStorage.setItem("theme", theme);
                setAuthToken(token);
                setRole(role);
                setEmail(serverEmail);
                setfirst_name(first_name);
                setlast_name(last_name);
                setcontact_number(contact_number);
                setUserID(userId);
                setlinkId(linkId);
                setDesignatedzone(Designatedzone);
                setTheme(theme);

                axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

                return { success: true, role, userId };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        }
    };

    const fetchProfile = async () => {
        if (!authToken) return;

        try {
            const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/DisplayProfile`, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Cache-Control": "no-cache",
                },
            });

            // 🔥 Kunin ang data galing backend
            const profileData = res.data.data;

            // i-set sa state
            setProfile(profileData);
        } catch (error) {
            console.error("Error fetching profile:", error.response?.data || error.message);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("first_name");
        localStorage.removeItem("last_name");
        localStorage.removeItem("contact_number");
        localStorage.removeItem("userId");
        localStorage.removeItem("linkId");
        localStorage.removeItem("Designatedzone");
        localStorage.removeItem("authToken");

        // Clear state
        setAuthToken(null);
        setRole(null);
        setEmail(null);
        setfirst_name(null);
        setlast_name(null);
        setcontact_number(null);
        setUserID(null);
        setlinkId(null);
        setDesignatedzone(null);

        // Remove Axios headers
        delete axios.defaults.headers.common["Authorization"];

        window.location.href = "/login"; // Redirect to login page
    };

    const updateAvatar = async (file) => {
        if (!file || !authToken) throw new Error("No file or token");

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const res = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/UpdateAvatar`, formData, {
                headers: { Authorization: `Bearer ${authToken}` },
                withCredentials: true,
            });

            // Update local profile state with new avatar
            setProfile((prev) => ({
                ...prev,
                avatar: res.data.data.avatar,
            }));
            return { success: true };
        } catch (err) {
            console.error("updateAvatar error:", err.response?.data || err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const UpdateProfileInfo = async (dataID, values) => {
        console.log("values", values);

        try {
            const payload = {
                first_name: values.first_name || "",
                last_name: values.last_name || "",
                middle_name: values.middle_name || "",
                email: values.email || "",
                role: "admin",
                // If avatar is just a URL string
                avatar: values.avatar || null,
            };

            const response = await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/Admin/${dataID}`, payload, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.data?.status === "success") {
                FetchAdminData();
                setModalStatus("success");
                setShowModal(true);
            } else {
                return { success: false, error: "Unexpected response from server." };
            }
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.error || error.message || "Something went wrong.";

            setCustomError(message);
            setModalStatus("failed");
            setShowModal(true);

            return { success: false, error: message };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                authToken,
                role,
                email,
                first_name,
                last_name,
                contact_number,
                userId,
                linkId,
                Designatedzone,
                login,
                logout,
                Profile,
                fetchProfile,
                updateAvatar,UpdateProfileInfo
            }}
        >
            {children}
            <ToastContainer />
        </AuthContext.Provider>
    );
};

// Custom hook to use context
export const useAuth = () => useContext(AuthContext);
