import { useContext, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import socket from "../socket.js";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext.jsx";
import { NotificationDisplayContext } from "../../contexts/NotificationContext/NotificationContext.jsx";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext.jsx";

const SocketListener = () => {
    const { role, linkId } = useAuth();
    const { setFiles } = useContext(FilesDisplayContext);
    const { setNotify } = useContext(NotificationDisplayContext);
    const { setOfficerData } = useContext(OfficerDisplayContext);

    const formatNotification = (data, fallbackMessage = "You have a new notification") => ({
        _id: data._id || (data.data && data.data._id) || Math.random().toString(36).substr(2, 9),
        message: data.message || fallbackMessage,
        createdAt: data.createdAt || new Date().toISOString(),
        viewers: [
            {
                user: linkId,
                isRead: false,
            },
        ],
    });

    // Register user with socket
    useEffect(() => {
        if (!linkId || !role) return;
        socket.emit("register-user", linkId, role);
    }, [linkId, role]);

    useEffect(() => {
        if (!linkId || !role) return;

        // Notification when a document is updated
        const handleDocumentNotification = (notification) => {
            const formatted = formatNotification(notification, "📄 Document updated.");
            setNotify((prev) => {
                const exists = prev.some((n) => n._id === formatted._id);
                if (exists) return prev;
                return [formatted, ...prev];
            });

            const updatedDoc = notification.data;
            if (!updatedDoc?._id) return;

            setFiles((prev) => prev.map((f) => (f._id === updatedDoc._id ? { ...f, ...updatedDoc } : f)));

            setOfficerData((prev) => {
                const filtered = prev.filter((f) => f._id !== updatedDoc._id);
                return [updatedDoc, ...filtered]; 
            });
        };

        const handleNewDocumentNotification = (notification) => {
            const formatted = formatNotification(notification, "📄 New document submitted to you.");
            setNotify((prev) => [formatted, ...prev]);

            const newDoc = notification.data;
            const oldDoc = notification.old;

            if (oldDoc?._id) {
                setFiles((prev) => prev.filter((f) => f._id !== oldDoc._id));
            }

            if (newDoc?._id) {
                setFiles((prev) => [...prev, newDoc]);
                setOfficerData((prev) => {
                    const filtered = prev.filter((f) => f._id !== (oldDoc?._id || newDoc._id));
                    return [newDoc, ...filtered];
                });
            }
        };

        const handleUpdateFileData = (updatedDoc) => {
            if (!updatedDoc?._id) return;

            setFiles((prev) => prev.map((f) => (f._id === updatedDoc._id ? { ...f, ...updatedDoc } : f)));

            if (role === "officer") {
                setOfficerData((prev) => prev.map((f) => (f._id === updatedDoc._id ? { ...f, ...updatedDoc } : f)));
            }
        };


        socket.on("SentDocumentNotification", handleDocumentNotification);
        socket.on("SentNewDocuNotification", handleNewDocumentNotification);
        socket.on("UpdateFileData", handleUpdateFileData);


        return () => {
            socket.off("SentDocumentNotification", handleDocumentNotification);
            socket.off("SentNewDocuNotification", handleNewDocumentNotification);
            socket.off("UpdateFileData", handleUpdateFileData);
        };
    }, [linkId, role, setNotify, setFiles, setOfficerData]);

    return null;
};

export default SocketListener;
