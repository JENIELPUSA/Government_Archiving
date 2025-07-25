import { Bell, ChevronsLeft, Moon, Sun } from "lucide-react";
import PropTypes from "prop-types";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotificationDropdown from "../component/Notification/NotificationDropdown";
import { NotificationDisplayContext } from "../contexts/NotificationContext/NotificationContext";

export const Header = ({ collapsed, setCollapsed }) => {
    const { notify, markNotificationAsRead } = useContext(NotificationDisplayContext);
    const { role } = useContext(AuthContext);
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    const [userNotifications, setUserNotifications] = useState([]);
    useEffect(() => {
        const html = document.documentElement;
        html.classList.toggle("dark", theme === "dark");
        localStorage.setItem("theme", theme);
    }, [theme]);

    useEffect(() => {
        if (notify) {
            setUserNotifications(notify);
        }
    }, [notify]);

    return (
        <header className="relative z-10 flex flex-col justify-center rounded-2xl border bg-white/30 px-4 py-4 text-gray-800 shadow-lg backdrop-blur-lg transition-colors dark:border-gray-700 dark:bg-slate-800/30 dark:text-white">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-x-3">
                    <button
                        className="btn-ghost size-10 rounded-full text-gray-800 transition-colors hover:bg-gray-800/10 dark:text-white dark:hover:bg-white/20"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronsLeft className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
                    </button>
                    <h1 className="text-xl font-bold">Welcome back Admin!</h1>
                </div>

                <div className="flex items-center gap-x-3">
                    <button
                        className="btn-ghost size-10 rounded-full text-gray-800 transition-colors hover:bg-gray-800/10 dark:text-white dark:hover:bg-white/20"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        <Sun
                            size={20}
                            className="dark:hidden"
                        />
                        <Moon
                            size={20}
                            className="hidden dark:block"
                        />
                    </button>

                    {/* Notification dropdown renders here */}
                    <NotificationDropdown
                        notifications={userNotifications}
                        setNotifications={setUserNotifications}
                        markNotificationAsRead={markNotificationAsRead}
                    />

                    <button className="size-10 overflow-hidden rounded-full border-2 border-gray-800 dark:border-white">
                        <img
                            src="https://placehold.co/40x40/cccccc/000000?text=User"
                            alt="profile image"
                            className="size-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/40x40/cccccc/000000?text=Error";
                            }}
                        />
                    </button>
                </div>
            </div>

            {role === "admin" ? (
                <p className="ml-14 text-sm font-medium opacity-90">
                    You're logged in as an <span className="font-semibold">Admin</span>. Here are the available modules for you:
                </p>
            ) : role === "officer" ? (
                <p className="ml-14 text-sm font-medium opacity-90">
                    You're logged in as an <span className="font-semibold">Officer</span>. These are your available tools:
                </p>
            ) : null}
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
