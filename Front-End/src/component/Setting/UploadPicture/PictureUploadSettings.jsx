import React, { useContext, useState } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import PictureFormModal from "./PictureFormModal";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import LandingPage from "../LandingPage/LandingPage";

// Pagination Component
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange, loading }) => {
    // Safety checks para maiwasan ang NaN
    const safeTotalItems = parseInt(totalItems) || 0;
    const safeItemsPerPage = parseInt(itemsPerPage) || 5;
    const totalPages = Math.ceil(safeTotalItems / safeItemsPerPage);

    // Debug logs
    console.log("Pagination Debug:", {
        originalTotalItems: totalItems,
        safeTotalItems,
        originalItemsPerPage: itemsPerPage,
        safeItemsPerPage,
        totalPages,
        currentPage
    });

    // Huwag mag-render kung walang pages
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="mt-4 flex justify-center space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
                Previous
            </button>

            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    className={`px-3 py-1 border rounded ${
                        currentPage === page 
                            ? "bg-blue-500 text-white" 
                            : "bg-white text-black hover:bg-gray-100"
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
            >
                Next
            </button>
        </div>
    );
};

const PictureUploadSettings = () => {
    const { 
        AddNotification, 
        pictures,          
        totalNews,         
        currentPage,       
        setCurrentPage,    
        itemsPerPage,      
        DeletePicture, 
        UpdatePicture,
        updatePriorityNumber, 
        loading
    } = useContext(NewsDisplayContext);


    const [enablePictureUpload, setEnablePictureUpload] = useState(false);
    const [showPictureModal, setShowPictureModal] = useState(false);
    const [editingPicture, setEditingPicture] = useState(null);
    const [priorityOptions] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
    const [updatingPriority, setUpdatingPriority] = useState(null); // Para sa loading state

    // Compute total pages safely
    const safeTotalNews = parseInt(totalNews) || 0;
    const safeItemsPerPage = parseInt(itemsPerPage) || 5;
    const totalPages = Math.ceil(safeTotalNews / safeItemsPerPage);

    const handlePageChange = (page) => {
        console.log("Changing to page:", page);
        setCurrentPage(page);
    };

    const handleAddPicture = async (newPicture) => {
        const imageFile = newPicture.imageFile || newPicture.image || null;
        const valuesToSend = {
            title: newPicture.title,
            date: newPicture.date,
            excerpt: newPicture.excerpt,
            category: newPicture.category,
            priorityNumber: newPicture.priorityNumber === "" ? null : newPicture.priorityNumber, // Convert empty string to null for N/A
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
        } catch (err) {
            alert("Unexpected error: " + (err.message || err));
        }
    };

    const handleEditPicture = (picture) => {
        setEditingPicture(picture);
        setShowPictureModal(true);
    };

    const handleDeletePicture = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await DeletePicture(id);
                alert("Deleted successfully!");
            } catch (err) {
                alert("Failed to delete picture: " + (err.message || err));
            }
        }
    };

    const handlePriorityChange = async (pictureId, newPriority) => {
        setUpdatingPriority(pictureId); // Show loading state for this specific row
        
        try {
            // Convert "N/A" (empty string) to null or 0 based on your API requirement
            const priorityValue = newPriority === "" ? null : parseInt(newPriority);
            const result = await updatePriorityNumber(pictureId, priorityValue);
        
        } catch (error) {
            console.error("Error updating priority:", error);
            alert("Failed to update priority: " + (error.error || error.message || "Unknown error"));
        } finally {
            setUpdatingPriority(null); // Remove loading state
        }
    };

    // Show loading
    if (loading && (!pictures || pictures.length === 0)) {
        return (
            <div className="mb-8 mt-8">
                <h2 className="mb-4 text-xl font-bold">Set-Up Public-Access Dashboard</h2>
                <div className="text-center p-8">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }

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
                    {/* Page Info Indicator */}
                    <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
                        <span className="font-semibold">Page {currentPage} of {totalPages || 1}</span>
                        <span className="mx-2">|</span>
                        <span>Total Items: {safeTotalNews}</span>
                        <span className="mx-2">|</span>
                        <span>Items per page: {safeItemsPerPage}</span>
                    </div>

                    {/* Admin Table View */}
                    <div className="mb-10">
                        <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">Manage Content</h3>
                        
                        {pictures && pictures.length > 0 ? (
                            <>
                                <div className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                                    <table className="min-w-full bg-white dark:bg-gray-700">
                                        <thead>
                                            <tr className="bg-gray-100 dark:bg-gray-600">
                                                <th className="px-4 py-2 text-left text-xs">Priority #</th>
                                                <th className="px-4 py-2 text-left text-xs">Title</th>
                                                <th className="px-4 py-2 text-left text-xs">Category</th>
                                                <th className="px-4 py-2 text-left text-xs">Image</th>
                                                <th className="px-4 py-2 text-center text-xs">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pictures.map((picture) => (
                                                <tr key={picture._id || picture.id} className="border-b border-gray-200 dark:border-gray-600">
                                                    <td className="px-4 py-2 text-sm">
                                                        <select
                                                            value={picture.priorityNumber || ""}
                                                            onChange={(e) => handlePriorityChange(picture._id, e.target.value)}
                                                            className={`border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                                updatingPriority === picture._id ? "opacity-50 cursor-wait" : ""
                                                            }`}
                                                            disabled={loading || updatingPriority === picture._id}
                                                        >
                                                            <option value="">N/A</option>
                                                            {priorityOptions.map(priority => (
                                                                <option key={priority} value={priority}>
                                                                    {priority}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {updatingPriority === picture._id && (
                                                            <span className="ml-2 text-xs text-blue-500">Updating...</span>
                                                        )}
                                                    </td>
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
                                                        <button 
                                                            className="text-blue-500 hover:text-blue-700" 
                                                            onClick={() => handleEditPicture(picture)}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button 
                                                            className="text-red-500 hover:text-red-700" 
                                                            onClick={() => handleDeletePicture(picture._id)}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <Pagination
                                    totalItems={safeTotalNews}
                                    itemsPerPage={safeItemsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                    loading={loading}
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

