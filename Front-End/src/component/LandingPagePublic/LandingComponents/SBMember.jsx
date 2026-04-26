import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import BannerImage from "./BannerImage";
import { FaSearch, FaUserAlt, FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Breadcrumb from "./Breadcrumb";
import { User } from "lucide-react";
import OfficialProfileLayout from "../LandingComponents/MayorLayout";

// --- MEMBER CARD ---
const MemberCard = ({ member, onClick }) => {
    const getPosition = (member) => {
        if (member.Position) return member.Position;
        if (member.position) return member.position;
        if (member.role) return member.role;
        if (member.designation) return member.designation;
        if (member.title) return member.title;
        if (member.official_position) return member.official_position;
        if (member.officialPosition) return member.officialPosition;
        return "Member";
    };

    const getFullName = (member) => {
        if (member.fullName) return member.fullName;
        if (member.full_name) return member.full_name;
        if (member.first_name && member.last_name) return `${member.first_name} ${member.last_name}`;
        if (member.firstName && member.lastName) return `${member.firstName} ${member.lastName}`;
        return "Unknown Member";
    };

    return (
        <div
            onClick={() => onClick(member)}
            className="group cursor-pointer rounded-xl border border-gray-100 bg-gray-50/50 p-3 text-center transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 hover:shadow-md"
        >
            <div className="relative mb-3 overflow-hidden rounded-lg bg-gray-200 aspect-[3/4] flex items-center justify-center border border-gray-100">
                {member.avatar?.url ? (
                    <img
                        src={member.avatar.url}
                        alt={getFullName(member)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <User className="h-10 w-10 text-gray-400" />
                )}
            </div>
            <h3 className="text-[11px] font-bold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-700">
                Hon. {getFullName(member)}
            </h3>
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-wider mt-1">
                {getPosition(member)}
            </p>
        </div>
    );
};

// --- TERM GROUP WITH API-BASED PAGINATION ---
const TermGroup = ({ group, isExpanded, onToggle, onMemberClick, isLatestTerm }) => {
    const [members, setMembers] = useState(group.members || []);
    const [internalPage, setInternalPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [innerLoading, setInnerLoading] = useState(false);

    const fetchTermMembers = useCallback(async (page) => {
        setInnerLoading(true);
        try {
            const response = await axios.get(`/api/v1/Files/PublicGetAuthorwithFiles?term=${group.term}&page=${page}`);
            if (response.data) {
                setMembers(response.data.members || response.data.data || []);
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching term members:", error);
        } finally {
            setInnerLoading(false);
        }
    }, [group.term]);

    useEffect(() => {
        if (isExpanded && internalPage > 1) {
            fetchTermMembers(internalPage);
        }
    }, [internalPage, isExpanded, fetchTermMembers]);

    const handleNext = (e) => {
        e.stopPropagation();
        if (internalPage < totalPages) setInternalPage(p => p + 1);
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        if (internalPage > 1) setInternalPage(p => p - 1);
    };

    return (
        <div className={`mb-4 overflow-hidden rounded-2xl transition-all duration-500 bg-white ${
            isExpanded ? "ring-4 ring-blue-500/20 shadow-2xl" : "shadow-lg"
        }`}>
            {/* HEADER */}
            <div onClick={onToggle} className="relative flex cursor-pointer items-center justify-between p-6 hover:bg-gray-50 transition-all">
                <div className={`absolute left-0 h-full w-1.5 ${isLatestTerm ? "bg-blue-600" : (isExpanded ? "bg-blue-400" : "bg-transparent")}`} />
                <div className="flex items-center gap-5 pl-2">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isLatestTerm ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <FaUserAlt className="text-sm" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase text-gray-900 md:text-lg">
                            {group.term}
                            {isLatestTerm && <span className="ml-3 rounded-md bg-blue-600 px-2 py-1 text-[9px] text-white">CURRENT</span>}
                        </h2>
                        <p className="text-xs font-semibold text-gray-500">Term Period Directory</p>
                    </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border transition-transform ${isExpanded ? "rotate-180 bg-blue-50 text-blue-600" : "text-gray-300"}`}>
                    ▼
                </div>
            </div>
            
            {/* CONTENT */}
            <div className={`transition-all duration-700 ease-in-out overflow-hidden ${isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="p-8 border-t border-gray-100">
                    {innerLoading ? (
                        <div className="grid grid-cols-2 gap-5 sm:grid-cols-5 animate-pulse">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {members.map((member, index) => (
                                    <MemberCard key={member._id || index} member={member} onClick={onMemberClick} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                                    <span className="text-[11px] font-bold text-gray-400 uppercase">Page {internalPage} of {totalPages}</span>
                                    <div className="flex gap-2">
                                        <button 
                                            disabled={internalPage === 1} 
                                            onClick={handlePrev} 
                                            className="p-2 rounded-lg border hover:border-blue-500 disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            <FaChevronLeft size={12}/>
                                        </button>
                                        <button 
                                            disabled={internalPage === totalPages} 
                                            onClick={handleNext} 
                                            className="p-2 rounded-lg border hover:border-blue-500 disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            <FaChevronRight size={12}/>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const SBmember = ({ onBack }) => {
    const { isGroupPublicAuthor, DisplayPublicAuthor, loading, setLoading } = useContext(SbMemberDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    
    // BINAGO: Sa halip na object, index ang itatago natin. Default ay 0 (unang term).
    const [activeTermIndex, setActiveTermIndex] = useState(0); 
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            await DisplayPublicAuthor({ search: searchTerm });
            setLoading(false);
        };
        const debounce = setTimeout(fetch, 400);
        return () => clearTimeout(debounce);
    }, [searchTerm, DisplayPublicAuthor, setLoading]);

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Function para siguradong isa lang ang naka-open
    const handleToggle = (index) => {
        setActiveTermIndex(prevIndex => (prevIndex === index ? null : index));
    };

    if (selectedMember) return <OfficialProfileLayout member={selectedMember} onBack={() => setSelectedMember(null)} />;

    return (
        <div className="min-h-screen bg-blue-950 pb-24">
            <BannerImage selection={"SP Members"} />
            <Breadcrumb position={"SP Members"} onBack={onBack} />

            <div className="mx-auto mt-12 max-w-7xl px-6">
                <div className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
                    <div>
                        <h1 className="text-4xl font-black text-white">Legislative <span className="text-blue-400">Directory</span></h1>
                        <p className="text-blue-200/60">Official registry organized by legislative terms.</p>
                    </div>
                    <div className="relative lg:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/50" />
                        <input
                            type="text"
                            placeholder="Search name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl bg-white/10 py-4 pl-12 text-white ring-1 ring-white/20 focus:ring-2 focus:ring-blue-500 placeholder:text-blue-200/40"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {isGroupPublicAuthor?.map((group, index) => (
                            <TermGroup
                                key={index}
                                group={group}
                                // Ang isExpanded ay true lamang kung ang index ay tumutugma sa activeTermIndex
                                isExpanded={activeTermIndex === index}
                                isLatestTerm={index === 0}
                                onToggle={() => handleToggle(index)}
                                onMemberClick={setSelectedMember}
                            />
                        ))}
                    </div>
                )}
            </div>

            <button 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
                className={`fixed bottom-10 right-10 p-4 bg-blue-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:bg-blue-700 ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
            >
                <FaArrowUp/>
            </button>
        </div>
    );
};

export default SBmember;