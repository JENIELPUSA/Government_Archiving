// File: src/components/ReusableFolder/AddAuthorModal.js
import React, { forwardRef } from "react";

const AddAuthorModal = forwardRef(({ isOpen, onClose, title, children }, ref) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                ref={ref}
                className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800"
            >
                <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h3 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                {children}
            </div>
        </div>
    );
});

AddAuthorModal.displayName = "Modal";

export default AddAuthorModal;