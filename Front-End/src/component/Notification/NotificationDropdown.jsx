import { Bell, CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { useNotificationDisplay } from "../../contexts/NotificationContext/NotificationContext";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
const timeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const NotificationDropdown = () => {
    const { getSpeficFile} = useContext(FilesDisplayContext);
    const navigate = useNavigate();
    const { notify: notifications, setNotify: setNotifications, markNotificationAsRead } = useNotificationDisplay();
    const [open, setOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const ref = useRef(null);
    const { linkId } = useContext(AuthContext);
    const toggleDropdown = () => {
        setOpen((prev) => !prev);
        if (open) setShowAll(false);
    };

    const markAllAsRead = useCallback(() => {
        setNotifications((prev) =>
            prev.map((n) => {
                const updatedViewers = n.viewers.map((v) => (v.user?.toString() === linkId?.toString() ? { ...v, isRead: true } : v));
                return { ...n, viewers: updatedViewers };
            }),
        );
        notifications.forEach((n) => {
            markNotificationAsRead(n._id);
        });
    }, [notifications, markNotificationAsRead, linkId, setNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
                setShowAll(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.reduce((count, notif) => {
        if (Array.isArray(notif.viewers)) {
            notif.viewers.forEach((viewer) => {
                if (viewer.user?.toString() === linkId?.toString() && viewer.isRead === false) {
                    count += 1;
                }
            });
        }
        return count;
    }, 0);

    const displayed = showAll ? notifications : notifications.slice(0, 5);
    const hasUnread = unreadCount > 0;

    return (
        <div
            className="relative"
            ref={ref}
        >
            <button
                onClick={toggleDropdown}
                className={`relative flex items-center justify-center rounded-full p-2 transition-all duration-300 ${
                    open
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50"
                        : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
                aria-label="Notifications"
            >
                <Bell
                    size={20}
                    className="shrink-0"
                />
                {hasUnread && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-0 top-0 flex h-5 w-5 -translate-y-1/4 translate-x-1/4 transform items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm"
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute right-0 z-[999] mt-3 w-80 origin-top overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
                    >
                        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 dark:from-gray-900 dark:to-gray-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
                                    {hasUnread && (
                                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm dark:bg-blue-600">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={toggleDropdown}
                                    className="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {hasUnread && (
                            <div className="flex justify-end border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-900">
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 transition-all hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                >
                                    <CheckCircle size={14} /> Mark All as Read
                                </button>
                            </div>
                        )}

                        <div className="custom-scrollbar max-h-[60vh] overflow-y-auto">
                            {displayed.length > 0 ? (
                                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {displayed.map((notif) => {
                                        const isUnread = notif.viewers?.some((v) => v.user?.toString() === linkId?.toString() && !v.isRead);

                                        return (
                                            <motion.li
                                                key={notif._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`dark:hover:bg-gray-750 relative transition-all duration-200 hover:bg-gray-50 ${
                                                    isUnread ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                                                }`}
                                            >
                                                {isUnread && <div className="absolute left-0 top-0 h-full w-1 bg-blue-500"></div>}
                                                <button
                                                    onClick={async () => {

                                                      console.log("notify",notif)
                                                        const result = await getSpeficFile(notif.FileId);
                                                        if (result.success && result.data) {
                                                            navigate(`/dashboard/pdf-viewer/${notif.FileId}`, { state: { fileData: result.data } });
                                                        } else {
                                                            console.warn("No file data retrieved.");
                                                        }

                                                        const viewerIndex = notif.viewers.findIndex(
                                                            (viewer) => viewer.user?.toString() === linkId?.toString(),
                                                        );

                                                        if (viewerIndex !== -1 && !notif.viewers[viewerIndex].isRead) {
                                                            markNotificationAsRead(notif._id);
                                                            setNotifications((prev) =>
                                                                prev.map((n) => {
                                                                    if (n._id === notif._id) {
                                                                        const updatedViewers = n.viewers.map((v) =>
                                                                            v.user?.toString() === linkId?.toString() ? { ...v, isRead: true } : v,
                                                                        );
                                                                        return { ...n, viewers: updatedViewers };
                                                                    }
                                                                    return n;
                                                                }),
                                                            );
                                                        }
                                                    }}
                                                    className="block w-full px-4 py-3 text-left"
                                                >
                                                    <div className="flex items-start">
                                                        <div className="mr-3 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                                                            <Bell size={16} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p
                                                                className={`mb-1 text-sm ${
                                                                    isUnread
                                                                        ? "font-semibold text-gray-900 dark:text-white"
                                                                        : "text-gray-700 dark:text-gray-300"
                                                                }`}
                                                            >
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(notif.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            </motion.li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center px-4 py-8 text-center"
                                >
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <Bell
                                            size={28}
                                            className="text-gray-400 dark:text-gray-500"
                                        />
                                    </div>
                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No notifications</p>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You're all caught up!</p>
                                </motion.div>
                            )}
                        </div>

                        {notifications.length > 5 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="dark:hover:bg-gray-750 sticky bottom-0 flex w-full items-center justify-center gap-2 border-t border-gray-200 bg-white py-3 text-sm font-medium text-blue-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400"
                            >
                                {showAll ? (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 15l7-7 7 7"
                                            />
                                        </svg>
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                        View all ({notifications.length})
                                    </>
                                )}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
