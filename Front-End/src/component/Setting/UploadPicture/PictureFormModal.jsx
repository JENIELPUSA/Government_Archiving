import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSave, FaTimes, FaCloudUploadAlt, FaTrash, FaSpinner } from 'react-icons/fa';

const PictureFormModal = ({ isOpen, onClose, onSave, picture, categories = [] }) => {
  // State variables remain the same
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (picture) {
      setTitle(picture.title || '');
      setDate(picture.date ? picture.date.slice(0, 10) : '');
      setExcerpt(picture.excerpt || '');
      setCategory(picture.category || '');
      setImagePreview(picture.avatar?.url || '');
      setImageFile(null);
    } else {
      resetForm();
    }
  }, [picture]);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setExcerpt('');
    setCategory('');
    setImageFile(null);
    setImagePreview('');
    setErrors({});
    setIsLoading(false); // Reset loading state
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!date) newErrors.date = 'Date is required';
    if (!excerpt.trim()) newErrors.excerpt = 'Description is required';
    if (!category) newErrors.category = 'Category is required';
    if (!imagePreview && !imageFile) newErrors.image = 'Image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files[0]) handleImageChange(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) handleImageChange(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true); // Set loading to true when saving starts
    
    try {
      await onSave({
        title,
        date,
        excerpt,
        category,
        imageFile,
        imagePreview,
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsLoading(false); // Set loading to false when save completes
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {picture ? 'Edit Picture' : 'Add New Picture'}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
            disabled={isLoading} // Disable close button when loading
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Landscape layout with two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form Fields */}
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  value={title}
                  onChange={(e) => !isLoading && setTitle(e.target.value)}
                  placeholder="Enter title"
                  disabled={isLoading} // Disable input when loading
                />
                {errors.title && <p className="mt-1 text-red-500 text-sm">{errors.title}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  value={date}
                  onChange={(e) => !isLoading && setDate(e.target.value)}
                  disabled={isLoading} // Disable input when loading
                />
                {errors.date && <p className="mt-1 text-red-500 text-sm">{errors.date}</p>}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.excerpt ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  value={excerpt}
                  onChange={(e) => !isLoading && setExcerpt(e.target.value)}
                  placeholder="Enter description"
                  rows={4}
                  disabled={isLoading} // Disable textarea when loading
                />
                {errors.excerpt && <p className="mt-1 text-red-500 text-sm">{errors.excerpt}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  value={category}
                  onChange={(e) => !isLoading && setCategory(e.target.value)}
                  disabled={isLoading} // Disable select when loading
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-red-500 text-sm">{errors.category}</p>}
              </div>
            </div>
            
            {/* Right Column - Image Upload */}
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Picture <span className="text-red-500">*</span>
                </label>
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all h-full flex flex-col justify-center
                    ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : errors.image 
                          ? 'border-red-500' 
                          : 'border-gray-300 dark:border-gray-600'
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onDragOver={isLoading ? undefined : handleDragOver}
                  onDragLeave={isLoading ? undefined : handleDragLeave}
                  onDrop={isLoading ? undefined : handleDrop}
                  onClick={isLoading ? undefined : () => fileInputRef.current?.click()}
                  style={isLoading ? { pointerEvents: 'none' } : {}}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isLoading} // Disable file input when loading
                  />
                  
                  {imagePreview ? (
                    <div className="relative h-full flex flex-col">
                      <div className="flex-grow flex items-center justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-72 w-auto object-contain rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        aria-label="Remove image"
                        disabled={isLoading} // Disable remove button when loading
                      >
                        <FaTrash className="mr-2" /> Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 dark:text-gray-500" />
                      <p className="font-medium text-lg">
                        {isDragging ? 'Drop image here' : 'Click or drag image to upload'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supports JPG, PNG, WEBP (max 5MB)
                      </p>
                      <button 
                        className="mt-2 px-4 py-2 bg-blue-100 dark:bg-gray-700 rounded-lg text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        disabled={isLoading} // Disable browse button when loading
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
                {errors.image && <p className="mt-1 text-red-500 text-sm">{errors.image}</p>}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
          <button 
            className="px-5 py-2.5 font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onClose}
            disabled={isLoading} // Disable cancel button when loading
          >
            Cancel
          </button>
          <button 
            className="px-5 py-2.5 font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            onClick={handleSubmit}
            disabled={isLoading} // Disable save button when loading
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" /> {picture ? 'Update' : 'Save'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PictureFormModal;