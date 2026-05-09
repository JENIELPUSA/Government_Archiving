import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";

function EditForm({ isOpen, document, onSave, onClose }) {
  const {UpdateFiles}=useContext(FilesDisplayContext)
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [summary, setSummary] = useState("");
    const [author, setAuthor] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (document) {
            setTitle(document.title || "");
            setCategory(document.category || "");
            setSummary(document.summary || "");
            setAuthor(document.author || "");
        }
    }, [document]);

    if (!isOpen) return null;

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  const updatedDoc = {
    ...document,
    title,
    category,
    summary,
    author,
  };

  try {
    await UpdateFiles(updatedDoc._id,updatedDoc);  
    console.log("Update",updatedDoc)        
    onClose();                  
  } catch (error) {
    console.error("Update failed:", error);
  } finally {
    setIsSubmitting(false);
  }
};


    const isFormValid = title.trim() !== "" && category.trim() !== "" && summary.trim() !== "" && author.trim() !== "";

    const modalTitle = document ? "Edit Document" : "Add Document";
    const buttonText = document ? "Update" : "Add";
    const submittingButtonText = document ? "Updating..." : "Adding...";

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
            >
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-white">{modalTitle}</h2>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label
                            htmlFor="title"
                            className="block text-sm text-gray-700 dark:text-gray-300"
                        >
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="category"
                            className="block text-sm text-gray-700 dark:text-gray-300"
                        >
                            Category
                        </label>
                        <input
                            id="category"
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="summary"
                            className="block text-sm text-gray-700 dark:text-gray-300"
                        >
                            Summary
                        </label>
                        <textarea
                            id="summary"
                            rows="4"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label
                            htmlFor="author"
                            className="block text-sm text-gray-700 dark:text-gray-300"
                        >
                            Author
                        </label>
                        <input
                            id="author"
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            required
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !isFormValid}
                            className={`rounded-lg px-5 py-2 font-medium text-white ${
                                isSubmitting || !isFormValid ? "cursor-not-allowed bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {isSubmitting ? submittingButtonText : buttonText}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default EditForm;
