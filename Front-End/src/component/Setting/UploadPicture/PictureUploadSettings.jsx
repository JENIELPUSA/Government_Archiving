import React, { useContext, useState, useMemo } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import PictureFormModal from "./PictureFormModal";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import LandingPage from "../LandingPage/LandingPage";

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pages = [...Array(totalPages).keys()].map((i) => i + 1);

    if (totalPages <= 1) return null;

    return (
        <div className="mt-4 flex justify-center space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md bg-gray-200 px-3 py-1 text-gray-800 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200"
            >
                Previous
            </button>
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`rounded-md px-3 py-1 ${
                        currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                    }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md bg-gray-200 px-3 py-1 text-gray-800 disabled:opacity-50 dark:bg-gray-600 dark:text-gray-200"
            >
                Next
            </button>
        </div>
    );
};

const PictureUploadSettings = () => {
    const { AddNotification, pictures, DeletePicture, UpdatePicture } = useContext(NewsDisplayContext);
    const [enablePictureUpload, setEnablePictureUpload] = useState(false);
    const [showPictureModal, setShowPictureModal] = useState(false);
    const [editingPicture, setEditingPicture] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const paginatedPictures = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return pictures.slice(startIndex, endIndex);
    }, [pictures, currentPage, itemsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAddPicture = async (newPicture) => {
        const imageFile = newPicture.imageFile || newPicture.image || null;
        const valuesToSend = {
            title: newPicture.title,
            date: newPicture.date,
            excerpt: newPicture.excerpt,
            category: newPicture.category,
            image: imageFile,
        };

        try {
            if (editingPicture !== null) {
                await UpdatePicture(editingPicture._id, valuesToSend);
            } else {
                const result = await AddNotification(valuesToSend);
                if (!result || result.success !== true) {
                    const errorMsg = result && result.error ? result.error : "Unknown error";
                    alert("Failed to save notification: " + errorMsg);
                    return;
                }
            }

            setShowPictureModal(false);
            setEditingPicture(null);
            setCurrentPage(1); 
        } catch (err) {
            alert("Unexpected error: " + (err.message || err));
        }
    };

    const handleEditPicture = (picture) => {
        setEditingPicture(picture);
        setShowPictureModal(true);
    };

    const handleDeletePicture = async (id) => {
        try {
            await DeletePicture(id);
        } catch (err) {
            alert("Failed to delete picture: " + (err.message || err));
        }
    };

    return (
        <div className="mb-8 mt-8">
            <h2 className="mb-4 text-xl font-bold">Set-Up Public-Access Dashboard</h2>
            
            {/* Toggle Switch Container */}
            <div className="mb-4 flex items-center justify-between">
                <label className="flex cursor-pointer items-center">
                    <span className="mr-3 font-medium">
                        {enablePictureUpload ? "Hide Public Dashboard" : "Show Public Dashboard"}
                    </span>
                    <div
                        className={`relative h-6 w-12 rounded-full transition-colors ${
                            enablePictureUpload ? "bg-green-500" : "bg-gray-300"
                        }`}
                        onClick={() => setEnablePictureUpload(!enablePictureUpload)}
                    >
                        <div
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                enablePictureUpload ? "translate-x-7 transform" : "translate-x-1"
                            }`}
                        ></div>
                    </div>
                </label>

                {enablePictureUpload && (
                    <button
                        className="flex items-center rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 transition-colors"
                        onClick={() => {
                            setEditingPicture(null);
                            setShowPictureModal(true);
                        }}
                    >
                        <FaPlus className="mr-1" /> Add Picture
                    </button>
                )}
            </div>

            {/* Conditional Rendering for Table and LandingPage */}
            {enablePictureUpload ? (
                <>
                    {/* Admin Table View */}
                    <div className="mb-10">
                        <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">Manage Content</h3>
                        {pictures.length > 0 ? (
                            <>
                                <div className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                                    <table className="min-w-full bg-white dark:bg-gray-700">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-600">
                                                <th className="px-4 py-2 text-left text-xs">Title</th>
                                                <th className="px-4 py-2 text-left text-xs">Category</th>
                                                <th className="px-4 py-2 text-left text-xs">Image</th>
                                                <th className="px-4 py-2 text-center text-xs">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedPictures.map((picture) => (
                                                <tr key={picture._id || picture.id} className="border-b border-gray-200 dark:border-gray-600">
                                                    <td className="px-4 py-2 text-sm">{picture.title}</td>
                                                    <td className="px-4 py-2 text-sm">{picture.category}</td>
                                                    <td className="px-4 py-2">
                                                        {picture.avatar?.url ? (
                                                            <img
                                                                src={picture.avatar.url}
                                                                alt={picture.title}
                                                                className="h-8 w-12 rounded object-cover"
                                                            />
                                                        ) : "N/A"}
                                                    </td>
                                                    <td className="flex justify-center space-x-3 px-4 py-2">
                                                        <button className="text-blue-500" onClick={() => handleEditPicture(picture)}><FaEdit /></button>
                                                        <button className="text-red-500" onClick={() => handleDeletePicture(picture._id)}><FaTrash /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <Pagination
                                    totalItems={pictures.length}
                                    itemsPerPage={itemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <p className="text-gray-500 italic">No pictures uploaded yet.</p>
                        )}
                    </div>

                    {/* The Landing Page Preview Section */}
                    <div className="border-t pt-8">
                        <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">Live Preview</h3>
                        <div className="rounded-xl border-4 border-dashed border-gray-200 p-4 dark:border-gray-600">
                            <LandingPage />
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-lg bg-gray-50 p-10 text-center dark:bg-gray-800">
                    <p className="text-gray-500">Dashboard preview is currently disabled. Toggle the switch above to manage content and view the Landing Page.</p>
                </div>
            )}

            {showPictureModal && (
                <PictureFormModal
                    isOpen={showPictureModal}
                    onClose={() => {
                        setShowPictureModal(false);
                        setEditingPicture(null);
                    }}
                    onSave={handleAddPicture}
                    picture={editingPicture}
                    categories={["Documentation", "News", "Announcement"]}
                />
            )}
        </div>
    );
};

export default PictureUploadSettings;