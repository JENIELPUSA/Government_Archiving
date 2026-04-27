import React, { useContext, useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { DepartmentContext } from "../../../contexts/DepartmentContext/DepartmentContext";

const AddDepartmentForm = ({ onCancel, editableDepartment }) => {
    const [departmentName, setDepartmentName] = useState(editableDepartment?.department || "");
    const { AddDepartment, UpdateDepartment } = useContext(DepartmentContext);

    useEffect(() => {
        if (editableDepartment) {
            setDepartmentName(editableDepartment.department);
        } else {
            setDepartmentName("");
        }
    }, [editableDepartment]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (departmentName.trim()) {
                if (editableDepartment?._id) {
                    await UpdateDepartment({
                        _id: editableDepartment._id,
                        department: departmentName,
                    });
                } else {
                    await AddDepartment({ department: departmentName });
                }

                setDepartmentName("");
                onCancel();
            }
        } catch (error) {
            console.error("Form submission error:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                >
                    <X size={20} />
                </button>

                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {editableDepartment ? "Edit Department" : "Add New Department"}
                    </h4>

                    <div>
                        <label
                            htmlFor="departmentName"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Department Name
                        </label>
                        <input
                            type="text"
                            id="departmentName"
                            placeholder="Enter department name..."
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                            value={departmentName}
                            onChange={(e) => setDepartmentName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-md bg-gray-300 px-4 py-2 text-sm hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            <Plus size={16} />
                            {editableDepartment ? "Update Department" : "Add Department"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDepartmentForm;
