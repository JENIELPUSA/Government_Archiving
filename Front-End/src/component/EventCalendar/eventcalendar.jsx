import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  Plus, Search, CalendarDays, ChevronLeft, ChevronRight, 
  Trash2, Edit2, X, FileText, MapPin, Clock, AlertCircle,
  Calendar, Tag, ChevronDown
} from 'lucide-react';
import AddEventModal from './AddEventModal';
import { EventContext } from '../../contexts/EventContext/EventContext';

const EventCalendar = () => {
  const { 
    events, loading, searchTerm, setSearchTerm, 
    AddEvent, DeleteEvent, UpdateEvent 
  } = useContext(EventContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  const [eventData, setEventData] = useState({
    date: '', time: '', title: '', description: '', location: ''
  });

  // --- HELPER FUNCTIONS ---
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  
  const changeMonth = (inc) => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + inc, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const formatDateToYMD = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getEventsForDay = (day) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${month}-${dayStr}`;

    const dayEvents = events.filter(event => {
      const eventDateStr = formatDateToYMD(event.date);
      const matchesDate = eventDateStr === targetDateStr;
      
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesDate && matchesSearch;
    });

    return dayEvents.sort((a, b) => a.time.localeCompare(b.time));
  };

  // --- CORE FUNCTIONS ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    let formattedDate = eventData.date;
    if (eventData.date && !eventData.date.includes('T')) {
      formattedDate = `${eventData.date}T00:00:00.000Z`;
    }
    
    const finalData = {
      title: eventData.title,
      description: eventData.description,
      date: formattedDate,
      time: eventData.time,
      location: eventData.location
    };
    
    try {
      if (isEditMode) {
        await UpdateEvent(eventData._id, finalData);
      } else {
        await AddEvent(finalData);
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await DeleteEvent(id);
        setShowEventDetails(false);
        setSelectedEvent(null);
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const resetForm = () => {
    setEventData({ date: '', time: '', title: '', description: '', location: '' });
    setSelectedEvent(null);
    setIsEditMode(false);
  };

  const handleOpenAdd = (day = null) => {
    resetForm();
    let selectedDate = '';
    if (day) {
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      selectedDate = `${year}-${month}-${dayStr}`;
    }
    setEventData(prev => ({ ...prev, date: selectedDate }));
    setIsModalOpen(true);
  };

  const handleEditClick = (event) => {
    setIsEditMode(true);
    setSelectedEvent(event);
    const formattedDate = formatDateToYMD(event.date);
    setEventData({ 
      ...event, 
      date: formattedDate
    });
    setIsModalOpen(true);
    setShowEventDetails(false);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Statistics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length;
  const monthlyEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentMonth.getMonth() && 
           eventDate.getFullYear() === currentMonth.getFullYear();
  }).length;

  // --- RENDER CALENDAR GRID ---
  const renderGrid = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const prevMonthLastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="min-h-[140px] bg-gray-50 border border-gray-100 p-3">
          <div className="text-sm font-medium text-gray-400">
            {prevMonthLastDay - i}
          </div>
          <div className="mt-2 text-center text-gray-300 text-xs">No events</div>
        </div>
      );
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayEvents = getEventsForDay(d);
      const today = new Date();
      const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
      const isToday = today.toDateString() === currentDate.toDateString();
      const isSunday = currentDate.getDay() === 0;
      const hasEvents = dayEvents.length > 0;

      days.push(
        <div 
          key={d} 
          className={`min-h-[140px] border border-gray-100 p-3 transition-all duration-200 ${
            isToday ? 'bg-blue-50 shadow-inner' : 'bg-white hover:bg-gray-50'
          }`}
        >
          {/* Date Header */}
          <div className="flex justify-between items-start mb-3">
            <div className={`
              w-8 h-8 flex items-center justify-center text-sm font-semibold rounded-full transition-all
              ${isToday ? 'bg-blue-600 text-white shadow-md' : ''}
              ${isSunday && !isToday ? 'text-red-500' : ''}
              ${!isToday && !isSunday ? 'text-gray-700' : ''}
            `}>
              {d}
            </div>
            
            <button 
              onClick={() => handleOpenAdd(d)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-all duration-200 p-1.5 rounded-full hover:bg-blue-50"
              title="Add event"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* Events Container */}
          <div className="space-y-2 max-h-[100px] overflow-y-auto custom-scrollbar">
            {!hasEvents ? (
              <div className="text-center py-2">
                <div className="text-gray-300 text-xs">✨ No events</div>
              </div>
            ) : (
              dayEvents.map((event, idx) => (
                <div
                  key={event._id || idx}
                  onClick={() => handleEventClick(event)}
                  className={`
                    px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 
                    flex items-center gap-2 text-xs shadow-sm hover:shadow-md
                    bg-gradient-to-r from-blue-600 to-blue-700 text-white
                    hover:from-blue-700 hover:to-blue-800
                  `}
                >
                  <span className="font-mono font-bold shrink-0 text-xs">{event.time}</span>
                  <span className="truncate flex-1 font-medium">{event.title}</span>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }
    
    // Fill remaining cells
    const totalCells = days.length;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="min-h-[140px] bg-gray-50 border border-gray-100 p-3">
          <div className="text-sm font-medium text-gray-400">
            {i}
          </div>
          <div className="mt-2 text-center text-gray-300 text-xs">No events</div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-[1600px] mx-auto p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg">
                <CalendarDays className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Event Calendar
                </h1>
                <p className="text-sm text-gray-500 mt-1">Manage and organize your schedule</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by title, description, or location..." 
                  className="pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-80 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none shadow-sm"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {/* Add Event Button */}
              <button
                onClick={() => handleOpenAdd()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus size={18} />
                <span className="text-sm font-semibold">Add New Event</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Events</p>
                <p className="text-2xl font-bold text-gray-800">{totalEvents}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <CalendarDays size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-800">{upcomingEvents}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock size={20} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">This Month</p>
                <p className="text-2xl font-bold text-gray-800">{monthlyEvents}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <AlertCircle size={20} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={goToToday} 
                  className="px-5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Today
                </button>
                
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                  <button 
                    onClick={() => changeMonth(-1)} 
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    onClick={() => changeMonth(1)} 
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 min-w-[200px]">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-500 text-xs">Today highlighted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className={`py-3 text-center text-xs font-bold uppercase tracking-wider ${day === 'Sunday' ? 'text-red-500' : 'text-gray-600'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Main Calendar Grid */}
          <div className="grid grid-cols-7">
            {loading ? (
              <div className="col-span-7 py-32 text-center">
                <div className="inline-flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
                  <p className="text-gray-500 font-medium">Loading events...</p>
                </div>
              </div>
            ) : (
              renderGrid()
            )}
          </div>
        </div>

        {/* Event Details Bottom Drawer */}
        {showEventDetails && selectedEvent && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
              onClick={() => setShowEventDetails(false)}
            />
            
            {/* Drawer */}
            <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
              <div className="bg-white rounded-t-2xl shadow-2xl max-w-4xl mx-auto">
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
                
                {/* Header */}
                <div className="px-6 pt-2 pb-4 border-b border-gray-100 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-100 p-1.5 rounded-lg">
                        <CalendarDays size={18} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Event Details
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h3>
                  </div>
                  <button
                    onClick={() => setShowEventDetails(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-400" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Date */}
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <Calendar size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Date</p>
                          <p className="text-sm font-medium text-gray-700 mt-0.5">
                            {formatDisplayDate(selectedEvent.date)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Time */}
                      <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <div className="bg-green-600 p-2 rounded-lg">
                          <Clock size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Time</p>
                          <p className="text-sm font-medium text-gray-700 mt-0.5">{selectedEvent.time}</p>
                        </div>
                      </div>
                      
                      {/* Location */}
                      {selectedEvent.location && (
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                          <div className="bg-purple-600 p-2 rounded-lg">
                            <MapPin size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Location</p>
                            <p className="text-sm font-medium text-gray-700 mt-0.5">{selectedEvent.location}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Column */}
                    <div>
                      {/* Description */}
                      {selectedEvent.description && (
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-gray-500" />
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</p>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedEvent.description}
                          </p>
                        </div>
                      )}
                      
                      {!selectedEvent.description && (
                        <div className="p-3 bg-gray-50 rounded-xl text-center">
                          <p className="text-sm text-gray-400">No description provided</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => {
                      setShowEventDetails(false);
                      handleEditClick(selectedEvent);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit Event
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, selectedEvent._id)}
                    className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-all duration-200 border border-red-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Event
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add/Edit Modal */}
        <AddEventModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          onAdd={handleSubmit} 
          newEvent={eventData}
          setNewEvent={setEventData}
          isEditMode={isEditMode}
        />
      </div>

      {/* Custom Styles */}
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
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default EventCalendar;