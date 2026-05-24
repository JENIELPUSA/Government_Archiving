import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventContext } from '../../../contexts/EventContext/EventContext';
import CalendarCard from './Events/CalendarCard';
import MayEvents from './Events/MyEvent';

// Assets
import background from "../../../assets/Bacground.jpg";
import logo2 from "../../../assets/sideimage.png";

const CalendarEvent = () => {
    const { monthEvent = [] } = useContext(EventContext);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [selectedMonthName, setSelectedMonthName] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    // Kunin ang current month index (0-11) at current year
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const months = [
        { name: 'JAN', color: 'cyan' }, { name: 'FEB', color: 'cyan' },
        { name: 'MAR', color: 'cyan' }, { name: 'APR', color: 'blue' },
        { name: 'MAY', color: 'blue' }, { name: 'JUN', color: 'blue' },
        { name: 'JUL', color: 'cyan' }, { name: 'AUG', color: 'cyan' },
        { name: 'SEP', color: 'cyan' }, { name: 'OCT', color: 'blue' },
        { name: 'NOV', color: 'blue' }, { name: 'DEC', color: 'blue' }
    ];

    const getEventDetails = (isoString) => {
        const date = new Date(isoString);
        return {
            day: date.getUTCDate().toString().padStart(2, '0'),
            monthIndex: date.getUTCMonth()
        };
    };

    // I-filter ang months array bago i-map para ipakita lang ang current at upcoming months
    const calendarData = months
        .map((m, index) => {
            const filteredEvents = monthEvent
                .filter(e => getEventDetails(e.date).monthIndex === index)
                .map(e => ({
                    date: getEventDetails(e.date).day,
                    title: e.title,
                    description: e.description || '',
                    location: e.location || '',
                    time: e.time || '',
                    fullEvent: e
                }));
            return { month: m.name, color: m.color, events: filteredEvents, monthIndex: index };
        })
        .filter(data => data.monthIndex >= currentMonthIndex);

    const handleCardClick = (monthData) => {
        setSelectedMonth(monthData.monthIndex);
        setSelectedEvents(monthData.events);
        setSelectedMonthName(monthData.month);
        setSelectedColor(monthData.color);
    };

    const handleBackToCalendar = () => {
        setSelectedMonth(null);
        setSelectedEvents([]);
        setSelectedMonthName('');
        setSelectedColor('');
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center py-16 md:py-24 px-4 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${background})` }} />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-blue-900/90 to-emerald-900/95" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto">
                <motion.div 
                    className="text-center mb-12" 
                    initial={{ opacity: 0, y: -20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.8 }} 
                    viewport={{ once: true }}
                >
                    {/* Main Title */}
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
                        Our <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-yellow-400 bg-clip-text text-transparent">Event Calendar</span>
                    </h2>
                    
                    {/* Year Display */}
                    <div className="inline-flex items-center gap-3 mb-3">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400"></div>
                        <p className="text-blue-200 text-sm md:text-base font-semibold tracking-wider">
                            {currentYear}
                        </p>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400"></div>
                    </div>
                    
                    {/* Subtitle */}
                    <p className="text-blue-100/70 text-sm md:text-base max-w-2xl mx-auto mb-4">
                        Discover and join our upcoming events throughout the year
                    </p>
                    
                    {/* Decorative Line */}
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 mx-auto rounded-full" />
                </motion.div>

                <AnimatePresence mode="wait">
                    {!selectedMonth ? (
                        // Calendar Cards View
                        <motion.div 
                            key="calendar"
                            className="flex flex-col lg:flex-row gap-10 items-center lg:items-start"
                            initial={{ opacity: 0, x: -100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Side Image Section */}
                            <motion.div
                                className="w-full lg:w-1/4 flex flex-col items-center sticky top-24"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                            >
                                <div className="relative p-2 rounded-full border-4 border-white/20 shadow-2xl bg-white/5 backdrop-blur-sm">
                                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border-8 border-white/10 overflow-hidden bg-white flex items-center justify-center">
                                        <img
                                            src={logo2}
                                            alt="Calendar Logo"
                                            className="w-full h-full object-cover drop-shadow-2xl animate-pulse"
                                            style={{ animationDuration: '4s' }}
                                        />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full border-4 border-blue-900 shadow-lg animate-bounce" />
                                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full border-4 border-blue-900 shadow-lg animate-bounce" style={{ animationDelay: '0.5s' }} />
                                </div>

                                <div className="mt-8 text-center">
                                    <h3 className="text-white text-xl font-bold mb-2 tracking-tight">Public Events</h3>
                                    <p className="text-blue-100/60 text-sm max-w-[200px]">
                                        Click on any month to view detailed schedule
                                    </p>
                                    <div className="mt-4 flex justify-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-150"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse delay-300"></div>
                                    </div>
                                </div>
                            </motion.div>
                            
                            <div className="w-full lg:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {calendarData.map((data, idx) => (
                                    <CalendarCard
                                        key={idx}
                                        index={idx}
                                        month={data.month}
                                        events={data.events}
                                        color={data.color}
                                        onClick={() => handleCardClick(data)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        // MayEvents Detailed View
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 100 }}
                            transition={{ duration: 0.5 }}
                        >
                            <MayEvents
                                month={selectedMonthName}
                                events={selectedEvents}
                                color={selectedColor}
                                year={currentYear}
                                onBack={handleBackToCalendar}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default CalendarEvent;