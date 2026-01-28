import React from "react";
import { motion } from "framer-motion";
import { FaBriefcase, FaMapMarkerAlt, FaUserCircle, FaChevronRight } from "react-icons/fa";

export const MemberCard = ({ member, openModal }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
    >
        <div className="flex items-start gap-3">
            {member?.avatar?.url ? (
                <img src={member.avatar.url} alt="Profile" className="h-14 w-12 rounded-lg object-cover transition-all group-hover:scale-105" />
            ) : (
                <div className="flex h-14 w-12 items-center justify-center rounded-lg bg-gray-50 text-gray-300 group-hover:text-blue-400">
                    <FaUserCircle size={30} />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <h2 className="truncate text-xs font-black uppercase tracking-tight text-gray-800">{member?.first_name} {member?.last_name}</h2>
                <div className="mt-1 space-y-0.5">
                    <p className="flex items-center text-[9px] font-bold uppercase text-blue-500">
                        <FaBriefcase className="mr-1" size={8} /> {member?.Position || "Member"}
                    </p>
                    <p className="flex items-center text-[9px] font-medium text-gray-400">
                        <FaMapMarkerAlt className="mr-1 text-red-300" size={8} /> {member.district || "District Office"}
                    </p>
                </div>
            </div>
        </div>
        <button onClick={() => openModal(member)} className="mt-4 w-full rounded-lg bg-gray-50 py-2 text-[9px] font-bold text-gray-600 hover:bg-blue-600 hover:text-white transition-all">
            View <FaChevronRight className="ml-1 inline text-[7px]" />
        </button>
    </motion.div>
);

export default MemberCard;