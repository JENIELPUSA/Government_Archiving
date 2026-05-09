import React, { useEffect, useRef } from 'react';
import { X, Clock, MapPin, AlignLeft, Calendar } from 'lucide-react';

const AddEventModal = ({ isOpen, onClose, onAdd, newEvent, setNewEvent, isEditMode = false }) => {
  const modalRef = useRef(null);
  const formRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Close modal with Escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300 mx-auto my-8"
      >
        {/* Header - Fixed */}
        <div className="sticky top-0 bg-white z-10 px-6 md:px-10 py-6 md:py-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50/50">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Event' : 'Record New Event'}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
              {isEditMode ? 'Update your event details.' : 'Add a new entry to your database.'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 shadow-sm border border-transparent hover:border-slate-200 flex-shrink-0"
            aria-label="Close modal"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
        
        {/* Form - Scrollable */}
        <form 
          ref={formRef}
          onSubmit={onAdd} 
          className="px-6 md:px-10 py-6 md:py-8 space-y-5 md:space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar"
        >
          <div className="space-y-4 md:space-y-5">
            
            {/* Field: Title */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-600">
                <AlignLeft size={14} /> Title <span className="text-red-500">*</span>
              </label>
              <input 
                required 
                type="text" 
                placeholder="e.g., Annual Tech Conference"
                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-sm font-medium placeholder:text-slate-300"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                autoFocus
              />
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {/* Field: Date */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-600">
                  <Calendar size={14} /> Date <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="date" 
                  className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-sm font-medium"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>

              {/* Field: Time */}
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-600">
                  <Clock size={14} /> Time <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="time" 
                  className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-sm font-medium"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
            </div>
            
            {/* Field: Location */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-600">
                <MapPin size={14} /> Location
              </label>
              <input 
                type="text" 
                placeholder="e.g., Conference Hall A, Makati City"
                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-sm font-medium placeholder:text-slate-300"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </div>

            {/* Field: Description */}
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 transition-colors group-focus-within:text-blue-600">
                <AlignLeft size={14} /> Description
              </label>
              <textarea 
                rows="3" 
                placeholder="Briefly explain the purpose of the event..."
                className="w-full px-4 md:px-5 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all resize-none text-sm font-medium placeholder:text-slate-300"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              ></textarea>
              <p className="text-xs text-slate-400 mt-1">
                {newEvent.description?.length || 0}/500 characters
              </p>
            </div>
          </div>

          {/* Action Buttons - Sticky on mobile */}
          <div className="sticky bottom-0 bg-white pt-4 pb-2 -mb-2 flex flex-col sm:flex-row gap-3 md:gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="order-2 sm:order-1 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all text-sm active:scale-[0.98]"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="order-1 sm:order-2 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 font-bold text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all text-sm active:scale-[0.98]"
            >
              {isEditMode ? 'Update Event' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddEventModal;