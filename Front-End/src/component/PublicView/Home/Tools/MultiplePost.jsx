import React, { useState } from 'react';

const App = () => {
  const [events, setEvents] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files) => {
    if (files.length === 0) return;

    // VALIDATION: Sinisigurado nito na 5 larawan lang ang maximum na pwedeng i-upload sa isang event.
    if (files.length > 5) {
      alert("Maaari ka lang mag-upload ng maximum na 5 larawan kada event.");
      return;
    }

    const newEventImages = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    const newEvent = {
      images: newEventImages,
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
    };

    setEvents(prevEvents => [...prevEvents, newEvent]);
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
    const files = e.dataTransfer.files;
    processFiles(files);
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    processFiles(files);
  };

  const handleInputChange = (eventIndex, field, value) => {
    const newEvents = [...events];
    newEvents[eventIndex][field] = value;
    setEvents(newEvents);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-800 p-8">
      {/* Upload Images Section */}
      <section className="container mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload at I-manage ang mga Larawan</h2>
        <div className="p-6 bg-white rounded-xl shadow-lg">
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex justify-center items-center h-48 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200
              ${isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
          >
            <div className="text-center">
              <p className="text-gray-500 text-lg font-semibold">I-drag at i-drop ang mga larawan dito</p>
              <p className="text-gray-400 text-sm mt-2">o i-click para mag-upload (Max 5)</p>
            </div>
            {/* Hidden file input to be triggered by the label */}
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <div className="mt-6 space-y-8">
            {events.map((event, eventIndex) => (
              <div key={eventIndex} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex flex-col space-y-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700">Event Date:</label>
                  <input
                    type="date"
                    value={event.date}
                    onChange={(e) => handleInputChange(eventIndex, 'date', e.target.value)}
                    className="w-full p-2 border rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                  />
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => handleInputChange(eventIndex, 'title', e.target.value)}
                    placeholder="Event Title..."
                    className="w-full p-2 border rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                  />
                  <textarea
                    value={event.description}
                    onChange={(e) => handleInputChange(eventIndex, 'description', e.target.value)}
                    placeholder="Description..."
                    rows="2"
                    className="w-full p-2 border rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {event.images.map((image, imageIndex) => (
                    <div key={imageIndex} className="flex flex-col items-center">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded-lg shadow-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1 truncate w-full text-center">{image.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
