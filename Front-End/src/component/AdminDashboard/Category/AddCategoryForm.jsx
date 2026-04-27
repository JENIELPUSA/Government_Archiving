import React, { useContext, useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import SuccessFailed from "../../../ReusableFolder/SuccessandField";
import LoadingOverlay from "../../../ReusableFolder/LoadingOverlay";

const AddCategoryForm = ({ onCancel, editableCategory }) => {
    const [CategoryName, setCategoryName] = useState(editableCategory?.category || "");
    const { AddCategory, UpdateCategory, customError } = useContext(CategoryContext);
    const [showModal, setShowModal] = useState(false);
    const [modalStatus, setModalStatus] = useState("success");
    const [loading, setLoading] = useState(false); // 🔹 loading state

    useEffect(() => {
        if (editableCategory) {
            setCategoryName(editableCategory.category);
        } else {
            setCategoryName("");
        }
    }, [editableCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // 🔹 start loading

        try {
            if (CategoryName.trim()) {
                if (editableCategory?._id) {
                    const result = await UpdateCategory({
                        _id: editableCategory._id,
                        category: CategoryName,
                    });
                } else {
                    await AddCategory({ category: CategoryName });
                }

                setCategoryName("");
                onCancel();
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setModalStatus("failed");
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            {loading && <LoadingOverlay />} {/* 🔹 show overlay when loading */}
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <button
                    onClick={onCancel}
                    disabled={loading} // 🔹 disable cancel while loading
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                    <X size={20} />
                </button>

                <form
                    onSubmit={handleSubmit}
                    className="mt-2 space-y-4"
                >
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{editableCategory ? "Edit Category" : "Add New Category"}</h4>

                    <div>
                        <label
                            htmlFor="CategoryName"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Category Name
                        </label>
                        <input
                            type="text"
                            id="CategoryName"
                            placeholder="Enter category name..."
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                            value={CategoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                            disabled={loading} // 🔹 disable input while loading
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="rounded-md bg-gray-300 px-4 py-2 text-sm hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            <Plus size={16} />
                            {editableCategory ? "Update Category" : "Add Category"}
                        </button>
                    </div>
                </form>
            </div>
            <SuccessFailed
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                status={modalStatus}
                error={customError}
            />
        </div>
    );
};

export default AddCategoryForm;
