import { useContext, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import socket from "../socket.js";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext.jsx";
import { NotificationDisplayContext } from "../../contexts/NotificationContext/NotificationContext.jsx";
import { OfficerDisplayContext } from "../../contexts/OfficerContext/OfficerContext.jsx";
import { SbMemberDisplayContext } from "../../contexts/SbContext/SbContext.jsx";
import { FolderContext } from "../../contexts/FolderContext/FolderContext.jsx";

const SocketListener = () => {
    const { role, linkId } = useAuth();
    const { fetchSpecificData, fetchSpecifiCategory } = useContext(FolderContext);
    const { setFiles } = useContext(FilesDisplayContext);
    const { setNotify, fetchNotifications } = useContext(NotificationDisplayContext);
    const { setOfficerData, FetchOfficerFiles } = useContext(OfficerDisplayContext);
    const { FetchDropdown } = useContext(SbMemberDisplayContext);

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

    useEffect(() => {
        if (!linkId || !role) return;
        socket.emit("register-user", linkId, role);
    }, [linkId, role]);

    useEffect(() => {
        if (!linkId || !role) return;

        // Notification when a document is updated
        const handleDocumentNotification = (notification) => {
            fetchNotifications();
            const updatedDoc = notification.data;
            if (!updatedDoc?._id) return;
            FetchOfficerFiles();
        };

        const handleSigup = async () => {
            await FetchDropdown();
        };

        const handleNewDocumentNotification = (notification) => {
            fetchNotifications();
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

        const handleDocuData = (dataDocu) => {
            fetchSpecificData(dataDocu.folderID, { categoryId: dataDocu.category });
        };

        const handleUpdateFileData = (updatedDoc) => {
            setFiles((prev) => prev.map((f) => (f._id === updatedDoc._id ? { ...f, ...updatedDoc } : f)));
            FetchOfficerFiles();
        };

        const handleDeleteDocument = (deleteData) => {
            fetchSpecifiCategory(deleteData.folderID ,{});
            fetchSpecificData(deleteData.folderID, { categoryId: deleteData.categoryID });
        };

        const handleAddDocument = (Adddata) => {
            fetchSpecifiCategory(Adddata.folderID ,{});
            fetchSpecificData(Adddata.folderID, { categoryId: Adddata.category });
        };

        socket.on("newUserSignup", handleSigup);
        socket.on("UpdateFileDocuData", handleDocuData);
        socket.on("SentDocumentNotification", handleDocumentNotification);
        socket.on("SentNewDocuNotification", handleNewDocumentNotification);
        socket.on("UpdateFileData", handleUpdateFileData);
        socket.on("DeleteDocument", handleDeleteDocument);
        socket.on("AddOldFile", handleAddDocument);

        return () => {
            socket.off("UpdateFileDocuData", handleDocuData);
            socket.off("SentDocumentNotification", handleDocumentNotification);
            socket.off("SentNewDocuNotification", handleNewDocumentNotification);
            socket.off("UpdateFileData", handleUpdateFileData);
        };
    }, [linkId, role, setNotify, setFiles, setOfficerData]);

    return null;
};

export default SocketListener;
