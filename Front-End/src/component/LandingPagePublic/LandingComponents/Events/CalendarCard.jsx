import React from 'react';
import { motion } from 'framer-motion';

const CalendarCard = ({ month, events, color, index, onClick }) => {
    const headerGradient = color === 'cyan'
        ? 'from-blue-600 to-cyan-500'
        : 'from-indigo-700 to-blue-600';
    
    // Get first 3 events for display
    const displayedEvents = events.slice(0, 3);
    const hasMoreEvents = events.length > 3;

    return (
        <motion.div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-gray-100 cursor-pointer hover:shadow-3xl transition-all"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3 } }}
            onClick={onClick}
        >
            <div className={`bg-gradient-to-r ${headerGradient} text-white text-center py-2 font-black tracking-widest text-xs`}>
                {month}
            </div>

            <div className="p-2 text-sm flex flex-col gap-1 bg-white">
                {events.length > 0 ? (
                    <>
                        {displayedEvents.map((event, idx) => (
                            <div key={idx} className="flex gap-2 py-0.5 border-b border-gray-50 last:border-0 group/item items-start">
                                <div className="bg-blue-50 rounded-md px-1.5 py-0.5 min-w-[32px] text-center font-bold text-blue-700 group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors duration-300 text-[10px] leading-tight">
                                    {event.date}
                                </div>
                                <div className="flex-1">
                                    <span className="text-gray-700 font-medium leading-tight text-[10px] pt-0.5 block line-clamp-1">
                                        {event.title}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {hasMoreEvents && (
                            <div className="text-center mt-0">
                                <span className="text-blue-600 text-[9px] font-semibold">
                                    +{events.length - 3} more
                                </span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center py-3 text-gray-400 italic text-[9px]">
                        No events
                    </div>
                )}
            </div>

            {/* Click indicator */}
            <div className="bg-gray-50 px-2 py-1 border-t border-gray-100 text-center">
                <span className="text-gray-400 text-[7px] font-semibold uppercase tracking-wider">
                    Click to view →
                </span>
            </div>
        </motion.div>
    );
};

export default CalendarCard;