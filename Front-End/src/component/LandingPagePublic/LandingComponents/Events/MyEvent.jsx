import React from 'react';
import { motion } from 'framer-motion';

const MayEvents = ({ month, events, color, onBack }) => {
    const headerGradient = color === 'cyan'
        ? 'from-blue-600 to-cyan-500'
        : 'from-indigo-700 to-blue-600';

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => parseInt(a.date) - parseInt(b.date));

    return (
        <motion.div
            className="w-full max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Back Button */}
            <div className="mb-6">
                <motion.button
                    onClick={onBack}
                    className="group flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all duration-300"
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-semibold">Back to Calendar</span>
                </motion.button>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className={`bg-gradient-to-r ${headerGradient} p-8 text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                                {month} <span className="text-white/70">2026</span>
                            </h2>
                            <p className="text-white/80 text-sm font-medium">
                                {events.length} {events.length === 1 ? 'Event' : 'Events'} Scheduled
                            </p>
                        </div>
                        <div className="hidden md:block text-right">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Events Timeline - Removed max-h-[600px] */}
                <div className="p-6 md:p-8">
                    {sortedEvents.length > 0 ? (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-cyan-400"></div>
                            
                            <div className="space-y-6">
                                {sortedEvents.map((event, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="relative pl-12 md:pl-14"
                                    >
                                        {/* Timeline dot */}
                                        <div className="absolute left-0 top-1 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-4 border-blue-500 shadow-lg flex items-center justify-center">
                                            <span className="text-blue-600 font-black text-sm md:text-base">
                                                {event.date}
                                            </span>
                                        </div>

                                        {/* Event Card */}
                                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ml-2">
                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                {event.time && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {event.time}
                                                    </span>
                                                )}
                                                {event.location && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        </svg>
                                                        {event.location}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                {event.title}
                                            </h3>
                                            
                                            {event.description && (
                                                <p className="text-gray-600 leading-relaxed">
                                                    {event.description}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <svg className="w-20 h-20 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-lg font-medium">No events scheduled for {month}</p>
                            <p className="text-sm mt-2">Check back later for updates!</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MayEvents;