import React, { useState, useRef, useContext, useEffect } from "react";
import { ThemeProviderContext } from "../../../contexts/theme-context";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import { AuthContext } from "../../../contexts/AuthContext";
import LoadingOverlay from "../../../ReusableFolder/ArchivingLoadingAnimation";
import { DepartmentContext } from "../../../contexts/DepartmentContext/DepartmentContext";
import { CategoryContext } from "../../../contexts/CategoryContext/CategoryContext";
import { FiUploadCloud, FiFileText, FiUser, FiBook, FiTag, FiBriefcase, FiX } from "react-icons/fi";

const UploadForm = () => {
   const { AddFiles } = useContext(FilesDisplayContext);
  const { linkId } = useContext(AuthContext);
  const { isDepartment } = useContext(DepartmentContext);
  const { isCategory } = useContext(CategoryContext);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState(""); // bagong state para sa category
  const [summary, setSummary] = useState("");
  const [author, setAuthor] = useState("");
  const [fileError, setFileError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [isCategoryLoading, setCategoryLoading] = useState(true);
  const [isDepartmentLoading, setDepartmentLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDepartmentLoading(false);
      setCategoryLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleFile = (file) => {
    setFileError("");
    if (!file) {
      setFileError("Please select a PDF document to upload.");
      setSelectedFile(null);
      return;
    }
    if (file.type !== "application/pdf") {
      setFileError("Invalid file type. Only PDF allowed.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setUploadMessage("");
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 1) {
      setFileError("Only one file allowed.");
      setSelectedFile(null);
    } else {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setFileError("");
    setTitleError("");
    setUploadMessage("");

    let valid = true;
    if (!selectedFile) {
      setFileError("Please select a file.");
      valid = false;
    }
    if (!title.trim()) {
      setTitleError("Title is required.");
      valid = false;
    }
    if (!department.trim()) {
      setUploadMessage("Please select a department.");
      valid = false;
    }

    if (!valid) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("department", department); // Department _id
    formData.append("category", category);     // Category _id
    formData.append("summary", summary);
    formData.append("author", author);
    formData.append("admin", linkId);

    try {
      setLoading(true);
      setUploadMessage(`Uploading "${selectedFile.name}"...`);
      await AddFiles(formData);
      setSelectedFile(null);
      setTitle("");
      setDepartment("");
      setCategory("");
      setSummary("");
      setAuthor("");
      setUploadMessage("File uploaded successfully.");
    } catch (err) {
      console.error(err);
      setUploadMessage("Upload failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleUpload} 
      className="relative  w-full rounded-2xl bg-gradient-to-br from-white/50 to-blue-50/30 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl dark:from-slate-800/70 dark:to-slate-900/80 dark:ring-1 dark:ring-gray-900"
    >
      {isLoading && (
        <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center rounded-2xl bg-white/90 backdrop-blur-xl dark:bg-gray-900/95">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-gray-500 border-t-transparent"></div>
            <FiUploadCloud className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl text-blue-600" />
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
            Uploading <span className="font-bold text-blue-600">{selectedFile?.name}</span>...
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait while we process your document</p>
        </div>
      )}

      <div className="w-full rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800/50">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Upload New Document</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fill details and select PDF file</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
            <FiFileText size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-full">
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiFileText className="text-blue-500" /> 
                  Title <span className="text-red-500">*</span>
                </label>
                {isDepartmentLoading ? (
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => { setTitle(e.target.value); setTitleError(""); }}
                      className={`w-full rounded-xl border px-4 py-3 pl-10 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                        titleError 
                          ? "border-red-400 focus:ring-red-300 dark:border-red-500" 
                          : "border-gray-300 focus:border-blue-400 focus:ring-blue-300 dark:border-gray-600"
                      } dark:bg-gray-700/50 dark:text-gray-200`}
                      placeholder="e.g., Annual Financial Report"
                    />
                    <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    {titleError && <p className="mt-1.5 text-sm text-red-500">{titleError}</p>}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiBriefcase className="text-blue-500" /> 
                  Department
                </label>
                {isDepartmentLoading ? (
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                ) : (
                  <div className="relative">
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                    >
                      <option value="">Select Department</option>
                      {isDepartment && isDepartment.map((dept) => (
                        <option key={dept._id} value={dept._id}>{dept.department}</option>
                      ))}
                    </select>
                    <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiTag className="text-blue-500" /> 
                  Category
                </label>
                {isCategoryLoading ? (
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
                ) : (
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                    >
                      <option value="">Select Category</option>
                      {isCategory && isCategory.map((cat) => (
                        <option key={cat._id} value={cat._id}>{cat.category}</option>
                      ))}
                    </select>
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FiUser className="text-blue-500" /> 
                Author
              </label>
              {isDepartmentLoading ? (
                <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                    placeholder="e.g., Jane Doe"
                  />
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <FiBook className="text-blue-500" /> 
                Summary
              </label>
              {isDepartmentLoading ? (
                <div className="h-20 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              ) : (
                <div className="relative">
                  <textarea
                    rows="3"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-10 shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200"
                    placeholder="Brief summary of the document..."
                  ></textarea>
                  <FiBook className="absolute left-3 top-4 text-gray-400" />
                </div>
              )}
            </div>

            <div className="pt-2">
              {isDepartmentLoading ? (
                <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3.5 font-medium text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg disabled:opacity-80"
                >
                  <FiUploadCloud className="transition-transform group-hover:scale-110" />
                  {isLoading ? "Uploading..." : "Upload Document"}
                </button>
              )}
            </div>

            {!isDepartmentLoading && uploadMessage && (
              <p className={`text-center text-sm font-medium ${
                uploadMessage.includes("success") 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-gray-700 dark:text-gray-300"
              }`}>
                {uploadMessage}
              </p>
            )}
          </div>

          {/* Right Column - File Upload */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Document File</h3>
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                PDF only
              </span>
            </div>
            
            {isDepartmentLoading ? (
              <div className="h-64 w-full animate-pulse rounded-xl border-2 border-dashed bg-gray-100 dark:border-gray-700 dark:bg-gray-800/30" />
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed p-5 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                    : fileError
                    ? "border-red-400 bg-red-50/50 dark:border-red-500 dark:bg-red-900/10"
                    : "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/20"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf"
                />
                
                <div className="pointer-events-none flex flex-col items-center justify-center py-8">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                    <FiUploadCloud size={28} />
                  </div>
                  <p className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                    {selectedFile ? "File Selected" : "Click to select or drag file"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedFile ? selectedFile.name : "Max file size: 10MB"}
                  </p>
                  <button
                    type="button"
                    className={`mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 ${
                      selectedFile ? "block" : "hidden"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    Change File
                  </button>
                </div>
                
                <div className="absolute inset-0 -z-10 grid grid-cols-4 gap-1.5 opacity-10 [&>div]:bg-blue-500">
                  {[...Array(16)].map((_, i) => <div key={i} className="h-full w-full rounded" />)}
                </div>
              </div>
            )}

            {fileError && (
              <div className="mt-3 flex items-start rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <div className="mr-2 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                  <FiX size={14} />
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>
              </div>
            )}

            {selectedFile && (
              <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50/80 p-3 dark:bg-emerald-900/20">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    <FiFileText size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 line-clamp-1 dark:text-gray-200">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <FiX size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default UploadForm;