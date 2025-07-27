import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { FilesDisplayContext } from "../../contexts/FileContext/FileContext";
import SuccessFailed from "../../ReusableFolder/SuccessandField";
import { useNavigate } from "react-router-dom";
const NotePopupModal = ({ isOpen, data, onClose }) => {
    const { UpdateStatus } = useContext(FilesDisplayContext);
    const [noteContent, setNoteContent] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const [modalStatus, setModalStatus] = useState("success");
    useEffect(() => {
        if (!isOpen) {
            setNoteContent("");
        }
    }, [isOpen]);

    const handleCancel = () => {
        setNoteContent("");
        onClose(); // Optional: Also close when cancel is clicked
    };

    const handleSubmit = async () => {
        if (noteContent.trim() === "") {
            toast.error("Note content cannot be empty.");
            return;
        }

        const { status, ...rest } = data || {};

        const noteData = {
            note: noteContent,
            status: status?.status || "",
            ...rest,
        };

        try {
            const result = await UpdateStatus(noteData.ID, noteData);
            if (result.success) {
                setModalStatus("success");
                setShowModal(true);
                setNoteContent("");
                setTimeout(() => {
                    onClose();
                    navigate("/dashboard");
                }, 1000);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to submit note. Please try again.");
        }
    };

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

            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
            />
        </div>
    );
};

export default NotePopupModal;
