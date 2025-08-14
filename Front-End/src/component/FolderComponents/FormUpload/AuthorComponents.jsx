import React from "react";
import { FiX, FiMail } from "react-icons/fi";
const AuthorComponent = ({
  showAuthorModal,
  setShowAuthorModal,
  newAuthorFirstName,
  setNewAuthorFirstName,
  newAuthorLastName,
  setNewAuthorLastName,
  newAuthorMiddleName,
  setNewAuthorMiddleName,
  newAuthorEmail,
  setNewAuthorEmail,
  newAuthorPosition,
  setNewAuthorPosition,
  customAuthorError,
  setCustomAuthorError,
  handleAddNewAuthor
}) => {
  if (!showAuthorModal) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Add New Author
            </h3>
            <button
              type="button"
              onClick={() => setShowAuthorModal(false)}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter first name"
                  value={newAuthorFirstName}
                  onChange={(e) => {
                    setNewAuthorFirstName(e.target.value);
                    setCustomAuthorError("");
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm ${
                    customAuthorError && !newAuthorFirstName.trim()
                      ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                      : "border-gray-300 focus:border-blue-400 focus:ring-blue-300 dark:border-gray-600"
                  } dark:bg-gray-700/50 dark:text-gray-200`}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter last name"
                  value={newAuthorLastName}
                  onChange={(e) => {
                    setNewAuthorLastName(e.target.value);
                    setCustomAuthorError("");
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm ${
                    customAuthorError && !newAuthorLastName.trim()
                      ? "border-red-400 focus:ring-red-300 dark:border-red-500"
                      : "border-gray-300 focus:border-blue-400 focus:ring-blue-300 dark:border-gray-600"
                  } dark:bg-gray-700/50 dark:text-gray-200`}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Middle Name
              </label>
              <input
                type="text"
                placeholder="Enter middle name"
                value={newAuthorMiddleName}
                onChange={(e) => setNewAuthorMiddleName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Position
              </label>
              <input
                type="text"
                placeholder="Enter position"
                value={newAuthorPosition}
                onChange={(e) => setNewAuthorPosition(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FiMail className="text-blue-500" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter email"
                  value={newAuthorEmail}
                  onChange={(e) => setNewAuthorEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pl-10 text-sm dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                />
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {customAuthorError && (
              <p className="mt-1 text-sm text-red-500">{customAuthorError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAuthorModal(false)}
                className="flex-1 rounded-lg bg-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewAuthor}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Add Author
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorComponent;