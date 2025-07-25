import React, { useState, useEffect, useContext } from "react";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
const NotePopupModal = ({ isOpen,data,onClose }) => {
    const { UpdateStatus } = useContext(FilesDisplayContext);
    const [noteContent, setNoteContent] = useState("");
    const [message, setMessage] = useState({ text: "", type: "", visible: false });

    useEffect(() => {
        if (!isOpen) {
            setNoteContent("");
            setMessage({ text: "", type: "", visible: false });
        }
    }, [isOpen]);

    const showMessage = (text, type) => {
        setMessage({ text, type, visible: true });
        setTimeout(() => {
            setMessage({ text: "", type: "", visible: false });
        }, 3000);
    };

    const handleCancel = () => {
        setNoteContent("");
    };

  const handleSubmit = async () => {
    if (noteContent.trim() === "") {
        showMessage("Note content cannot be empty.", "error");
        return;
    }

    const { status, ...rest } = data || {};

    const noteData = {
        note: noteContent,
        status: status?.status || "",
        ...rest,
    };
    try {
        await UpdateStatus(noteData.ID, noteData);
        setNoteContent("");
        showMessage("Note submitted successfully!", "success");
        onClose();
    } catch (error) {
        console.error("Error updating status:", error);
        showMessage("Failed to submit note. Please try again.", "error");
    }
};

    const messageBoxClasses = `
        mt-4 p-3 rounded text-center text-sm
        ${message.visible ? "" : "hidden"}
        ${message.type === "success" ? "bg-green-100 text-green-800" : ""}
        ${message.type === "error" ? "bg-red-100 text-red-800" : ""}
    `;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                <h2 className="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-gray-100">Add Rejection Note</h2>

                <textarea
                    className="w-full rounded-md border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    rows={5}
                    placeholder="Write your reason for rejection..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                ></textarea>

                <div className={messageBoxClasses}>
                    <p>{message.text}</p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        onClick={handleCancel}
                        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotePopupModal;
