import React, { useContext, useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import PictureFormModal from './PictureFormModal';
import { NewsDisplayContext } from '../../../contexts/NewsContext/NewsContext';

const PictureUploadSettings = () => {
  const { AddNotification, pictures, setPictures } = useContext(NewsDisplayContext);
  const [enablePictureUpload, setEnablePictureUpload] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [editingPicture, setEditingPicture] = useState(null);
   console.log("PICTURE",pictures)
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
      const result = await AddNotification(valuesToSend);

      if (!result || result.success !== true) {
        const errorMsg = (result && result.error) ? result.error : 'Unknown error';
        alert('Failed to save notification: ' + errorMsg);
        return;
      }

      // Update pictures from context
      if (editingPicture !== null) {
        setPictures(pictures.map(pic =>
          pic._id === editingPicture._id
            ? {
                ...pic,
                title: newPicture.title,
                date: newPicture.date,
                excerpt: newPicture.excerpt,
                category: newPicture.category,
                imageUrl: newPicture.imagePreview || pic.imageUrl,
                imageFile: imageFile || pic.imageFile,
              }
            : pic
        ));
      } else {
        // Add new picture
        setPictures([
          ...pictures,
          {
            _id: result.data._id, // assuming backend returns _id
            title: newPicture.title,
            date: newPicture.date,
            excerpt: newPicture.excerpt,
            category: newPicture.category,
            imageUrl: newPicture.imagePreview || '',
            imageFile: imageFile || null,
          },
        ]);
      }

      setShowPictureModal(false);
      setEditingPicture(null);
    } catch (err) {
      alert('Unexpected error: ' + (err.message || err));
    }
  };

  const handleEditPicture = (picture) => {
    setEditingPicture(picture);
    setShowPictureModal(true);
  };

  const handleDeletePicture = (id) => {
    setPictures(pictures.filter(pic => pic._id !== id));
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4">Set-Up Public-Access Dashboard</h2>
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center cursor-pointer">
          <span className="mr-3">Enable Picture Upload</span>
          <div 
            className={`relative w-12 h-6 rounded-full transition-colors ${enablePictureUpload ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => setEnablePictureUpload(!enablePictureUpload)}
          >
            <div 
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enablePictureUpload ? 'transform translate-x-7' : 'translate-x-1'}`}
            ></div>
          </div>
        </label>
        
        {enablePictureUpload && (
          <button 
            className="flex items-center bg-blue-500 text-white px-3 py-1 rounded"
            onClick={() => {
              setEditingPicture(null);
              setShowPictureModal(true);
            }}
          >
            <FaPlus className="mr-1" /> Add Picture
          </button>
        )}
      </div>
      
      {enablePictureUpload && pictures.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-600">
                <th className="py-2 px-4 text-left">ID</th>
                <th className="py-2 px-4 text-left">Title</th>
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Excerpt</th>
                <th className="py-2 px-4 text-left">Category</th>
                <th className="py-2 px-4 text-left">Image</th>
                <th className="py-2 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pictures.map((picture) => (
                <tr key={picture._id || picture.id} className="border-b border-gray-200 dark:border-gray-600">
                  <td className="py-2 px-4">{picture._id || picture.id}</td>
                  <td className="py-2 px-4">{picture.title}</td>
                  <td className="py-2 px-4">{picture.date}</td>
                  <td className="py-2 px-4">{picture.excerpt}</td>
                  <td className="py-2 px-4">{picture.category}</td>
                  <td className="py-2 px-4">
                    {picture.avatar?.url ? (
                      <a href={picture.avatar?.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={picture.avatar?.url}
                          alt={picture.title}
                          className="w-16 h-10 object-contain rounded"
                        />
                      </a>
                    ) : (
                      'No Image'
                    )}
                  </td>
                  <td className="py-2 px-4 flex justify-center space-x-2">
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
          categories={['News', 'Announcement', 'Event', 'Documentation','Carousel']} 
        />
      )}
    </div>
  );
};

export default PictureUploadSettings;
