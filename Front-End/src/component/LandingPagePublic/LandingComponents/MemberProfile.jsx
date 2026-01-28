import React, { useEffect, useState, useCallback } from "react";
import {
    FaTimes,
    FaInfoCircle,
    FaUserCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import UnifiedFileTable from "./SBMemberModal/UnifiedFileTable";
import MemberCard from "./SBMemberModal/MemberCard";

const termLabels = {
    "1st_term": "1st Term",
    "2nd_term": "2nd Term",
    "3rd_term": "3rd Term",
};

// --- COMPONENT: MEMBER MODAL ---
export const MemberModal = ({
    member,
    closeModal,
    FilesByPosition = [],
    fetchFilesByPosition,
    PositioncurentPage = 1,
    PositiontotalPage = 1,
    Totaldata = 0,
}) => {
    const [activeFilter, setActiveFilter] = useState("Chairperson");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback((page = 1, search = "") => {
        if (member?._id && fetchFilesByPosition) {
            setIsLoading(true);
            fetchFilesByPosition(member._id, activeFilter, page, search)
                .finally(() => setIsLoading(false));
        }
    }, [member?._id, activeFilter, fetchFilesByPosition]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        fetchData(1, ""); 
        setSearchTerm("");
        return () => { document.body.style.overflow = "unset"; };
    }, [member?._id, activeFilter]); 

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => fetchData(1, searchTerm), 600); 
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    if (!member) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-blue-900/40 p-2 backdrop-blur-[2px]"
                onClick={closeModal}
            >
                <motion.div
                    initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="relative max-h-[95vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Integrated Header: Profile is now part of the Header Background */}
                    <div className="relative bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-900 px-6 py-8">
                        <button onClick={closeModal} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
                            <FaTimes size={14} />
                        </button>
                        
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                            {member.avatar?.url ? (
                                <img src={member.avatar.url} alt="Official" className="h-32 w-28 rounded-xl border-4 border-white/20 object-cover shadow-2xl transition-transform hover:scale-105" />
                            ) : (
                                <div className="flex h-32 w-28 items-center justify-center rounded-xl border-4 border-white/20 bg-white/10 text-white/50 shadow-2xl">
                                    <FaUserCircle size={60} />
                                </div>
                            )}
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-md">Hon. {member.first_name} {member.last_name}</h2>
                                <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                                    <span className="rounded-md bg-blue-500/30 px-2 py-1 text-[10px] font-bold uppercase text-blue-100 backdrop-blur-sm">{member.Position}</span>
                                    <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold uppercase text-white/80 backdrop-blur-sm">{termLabels[member.term] || "Active"}</span>
                                    <span className="rounded-md bg-emerald-500/30 px-2 py-1 text-[10px] font-bold uppercase text-emerald-100 backdrop-blur-sm">{member.district}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                            <div className="space-y-5 lg:col-span-4">
                                <div className="rounded-xl border border-gray-100 bg-gray-50/30 p-4">
                                    <h4 className="mb-2 flex items-center gap-1 text-[9px] font-bold uppercase text-gray-400"><FaInfoCircle /> About</h4>
                                    <p className="text-[11px] leading-relaxed text-gray-600 line-clamp-[8]">{member.detailInfo || "No biography available."}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="mb-2 text-[9px] font-bold uppercase text-gray-400">Position Filters</p>
                                    <FilterBtn label="Chairperson" count={member.isChairperson} active={activeFilter === "Chairperson"} onClick={() => setActiveFilter("Chairperson")} color="blue" />
                                    <FilterBtn label="Vice-Chair" count={member.isViceChairperson} active={activeFilter === "Vice-Chairperson"} onClick={() => setActiveFilter("Vice-Chairperson")} color="emerald" />
                                    <FilterBtn label="Member" count={member.isMember} active={activeFilter === "Member"} onClick={() => setActiveFilter("Member")} color="amber" />
                                </div>
                            </div>

                            <div className="lg:col-span-8">
                                <UnifiedFileTable
                                    FilesByPosition={FilesByPosition}
                                    PositioncurentPage={PositioncurentPage}
                                    PositiontotalPage={PositiontotalPage}
                                    Totaldata={Totaldata}
                                    onPageChange={(p) => fetchData(p, searchTerm)}
                                    onSearchChange={setSearchTerm}
                                    searchTerm={searchTerm}
                                />
                                {isLoading && <p className="mt-2 text-center text-[10px] text-blue-500 font-bold animate-pulse tracking-widest">SYNCHRONIZING DOCUMENTS...</p>}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const FilterBtn = ({ label, count, active, onClick, color }) => {
    const colorMap = {
        blue: active ? "bg-blue-600 text-white shadow-md scale-[1.02]" : "text-blue-600 bg-white hover:bg-blue-50 border-blue-100",
        emerald: active ? "bg-emerald-600 text-white shadow-md scale-[1.02]" : "text-emerald-600 bg-white hover:bg-emerald-50 border-emerald-100",
        amber: active ? "bg-amber-600 text-white shadow-md scale-[1.02]" : "text-amber-600 bg-white hover:bg-amber-50 border-amber-100",
    };
    return (
        <button onClick={onClick} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-[10px] font-bold transition-all ${colorMap[color]}`}>
            <span className="uppercase">{label}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[8px] ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"}`}>{count || 0}</span>
        </button>
    );
};

export const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-center gap-3">
            <div className="h-12 w-10 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2"><div className="h-3 w-3/4 rounded bg-gray-200" /><div className="h-2 w-1/2 rounded bg-gray-100" /></div>
        </div>
        <div className="mt-4 h-8 w-full rounded-lg bg-gray-50" />
    </div>
);

const CommitteeUI = { MemberCard, MemberModal, UnifiedFileTable, SkeletonCard };
export default CommitteeUI;