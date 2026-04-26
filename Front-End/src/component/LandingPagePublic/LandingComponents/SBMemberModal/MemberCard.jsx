import React from "react";
import { motion } from "framer-motion";
import { FaUser, FaChevronRight } from "react-icons/fa";

export const MemberCard = ({ member, openModal }) => {
    // Utility function para ayusin ang formatting (e.g., first_district -> First District)
    const formatText = (text) => {
        if (!text) return "";
        return text
            .toString()
            .replace(/_/g, " ") 
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) 
            .join(' ');
    };

    const rawPosition = member?.Position || member?.position || "Member";
    const displayPosition = formatText(rawPosition);
    const displayTerm = formatText(member?.term || "1st Term");
    
    // Kunin ang district detail
    const displayDistrict = member?.district ? formatText(member.district) : null;
    
    // Pangalan na isasama ang middle name
    const displayName = () => {
        const firstName = member?.first_name || "";
        const middleName = member?.middle_name || "";
        const lastName = member?.last_name || "";
        
        // Kung may middle name, isama ito
        if (middleName) {
            return `${firstName} ${middleName.charAt(0)}. ${lastName}`;
        }
        
        return `${firstName} ${lastName}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            // Compact width para sa professional directory look
            className="group flex w-full max-w-[350px] min-h-[160px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-300"
        >
            <div className="flex items-start gap-4">
                {/* Profile Image Container */}
                <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                    {member?.avatar?.url ? (
                        <img 
                            src={member.avatar.url} 
                            alt={member?.last_name} 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-200">
                            <FaUser size={35} />
                        </div>
                    )}
                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-yellow-400 shadow-sm border border-white" />
                </div>

                {/* Member Details */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <h2 className="mb-2 truncate text-[14px] font-[900] uppercase tracking-tight text-[#1e3a8a]">
                        {displayName()}
                    </h2>

                    <div className="space-y-1.5">
                        {/* Position */}
                        <p className="flex items-center text-[10px] font-bold text-gray-700">
                            <span className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                            {displayPosition}
                        </p>

                        {/* District - Idinagdag dito */}
                        {displayDistrict && (
                            <p className="flex items-center text-[10px] font-bold text-gray-500 italic">
                                <span className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300" />
                                {displayDistrict}
                            </p>
                        )}

                        {/* Extra Roles */}
                        {member?.roles?.map((role, index) => (
                            <p key={index} className="flex items-center text-[10px] font-bold text-gray-700">
                                <span className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                {formatText(role)}
                            </p>
                        ))}
                        
                        {/* Term */}
                        <p className="flex items-center text-[10px] font-bold text-gray-700">
                            <span className="mr-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                            {displayTerm}
                        </p>
                    </div>

                    {/* View Profile Link */}
                    <div className="mt-auto pt-4">
                        <button 
                            onClick={() => openModal(member)} 
                            className="group/btn flex items-center text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            View Full Profile 
                            <FaChevronRight className="ml-1 transition-transform group-hover/btn:translate-x-1" size={8} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MemberCard;