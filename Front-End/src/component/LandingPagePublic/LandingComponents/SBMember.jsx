import React, { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { SbMemberDisplayContext } from "../../../contexts/SbContext/SbContext";
import BannerImage from "./BannerImage";
import { FaSearch, FaUserAlt, FaArrowUp, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Breadcrumb from "./Breadcrumb";
import { User } from "lucide-react";
import OfficialProfileLayout from "../LandingComponents/MayorLayout";

/**
 * HELPER FUNCTION: Get position with replacement logic
 * ONLY for Ex-Officials, regular members remain unchanged
 */
const getDisplayPosition = (member) => {
    const originalPos = member.Position || member.position || member.role || "Member";
    const trimmedPos = originalPos.trim();
    
    // ONLY replace if member is Ex-Official
    if (member.isExOfficial === true) {
        return "ExOfficial"; // Change to "Ex-Official" if preferred
    }
    
    // Regular Sangguniang Members - keep original position
    return originalPos;
};


const MemberCard = ({ member, onClick }) => {
    const getFullName = () => {
        if (member.fullName) return member.fullName;
        if (member.full_name) return member.full_name;
        if (member.first_name && member.last_name) {
            const middleInitial = member.middle_name && member.middle_name !== "" 
                ? ` ${member.middle_name.charAt(0)}.` 
                : "";
            return `${member.first_name}${middleInitial} ${member.last_name}`;
        }
        return "Unknown Member";
    };
    
    // Helper function para makuha ang display position na may subPosition
    const getDisplayPosition = () => {
        let basePosition = member.Position || member.position || "Board Member";
        let subPosition = member.subPosition;
        
        // Kung may subPosition at hindi empty, i-concatenate
        if (subPosition && subPosition.trim() !== "") {
            return `${basePosition} - ${subPosition}`;
        }
        return basePosition;
    };
    
    // Helper function para makuha ang district/district info
    const getDistrictInfo = () => {
        if (member.district) return `District ${member.district}`;
        if (member.districtInfo) return member.districtInfo;
        if (member.detailInfo) return member.detailInfo;
        return "";
    };
    
    // Helper function para makuha ang term display
    const getTermDisplay = () => {
        if (member.displayTerm) return member.displayTerm;
        if (member.term_from && member.term_to) {
            const fromYear = new Date(member.term_from).getFullYear();
            const toYear = new Date(member.term_to).getFullYear();
            return `${fromYear} - ${toYear}`;
        }
        if (member.year_from && member.year_to) {
            return `${member.year_from} - ${member.year_to}`;
        }
        if (member.term) return member.term;
        return "";
    };
    
    // Helper function para makuha ang avatar URL
    const getAvatarUrl = () => {
        if (member.avatar?.url) return member.avatar.url;
        if (member.avatar && typeof member.avatar === 'string') return member.avatar;
        if (member.avatarUrl) return member.avatarUrl;
        return null;
    };

    const fullName = getFullName();
    const displayPosition = getDisplayPosition();
    const districtInfo = getDistrictInfo();
    const termDisplay = getTermDisplay();
    const avatarUrl = getAvatarUrl();
    const memberType = member.isExOfficial ? "Ex-Official" : "Regular Member";
    const memberTypeColor = member.isExOfficial ? "text-emerald-600" : "text-blue-600";

    return (
        <div
            onClick={() => onClick(member)}
            className="group cursor-pointer rounded-xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
        >
            {/* Avatar Section - Centered */}
            <div className="relative mb-3 overflow-hidden rounded-lg bg-gradient-to-br from-blue-50 to-gray-100 aspect-square flex items-center justify-center mx-auto">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={fullName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            e.target.src = "https://randomuser.me/api/portraits/men/64.jpg";
                        }}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <User className="h-12 w-12 text-gray-400" />
                    </div>
                )}
            </div>
            
            {/* Member Info Section - Centered Text */}
            <div className="text-center space-y-1.5">
                {/* Name */}
                <h3 className="text-xs font-bold text-gray-800 line-clamp-2 min-h-[2rem] group-hover:text-blue-700 uppercase">
                    Hon. {fullName}
                </h3>
                
                {/* Position with SubPosition */}
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-700">
                    {displayPosition}
                </p>

                
                {/* Term Display */}
                {termDisplay && (
                    <p className="text-[8px] text-gray-400 font-medium">
                        Term: {termDisplay}
                    </p>
                )}
                
                {/* SubPosition highlight (if available and not already shown in position) */}
                {member.subPosition && !displayPosition.includes(member.subPosition) && (
                    <div className="mt-1 pt-1 border-t border-gray-100">
                        <span className="text-[8px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                            {member.subPosition}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

const TermGroup = ({ group, isExpanded, onToggle, onMemberClick, isLatestTerm }) => {
    const [members, setMembers] = useState(group.members || []);
    const [innerLoading, setInnerLoading] = useState(false);

    // Filter at Sorting Logic
    const sortedAll = [...members].sort((a, b) => (parseInt(a.priorityNumber) || 99) - (parseInt(b.priorityNumber) || 99));
    
    // Kunin ang mga Ex-Officials (isExOfficial === true)
    const exOfficials = sortedAll.filter(m => m.isExOfficial === true);
    
    // Kunin ang mga regular members (hindi Ex-Official)
    const regularMembers = sortedAll.filter(m => m.isExOfficial !== true);

    const fetchTermMembers = useCallback(async () => {
        setInnerLoading(true);
        try {
            const response = await axios.get(`/api/v1/Files/PublicGetAuthorwithFiles?term=${group.term}`);
            if (response.data) {
                let fetchedMembers = response.data.members || response.data.data || [];
                
                // ONLY modify Ex-Officials, leave regular members as is
                fetchedMembers = fetchedMembers.map(member => {
                    if (member.isExOfficial === true) {
                        return {
                            ...member,
                            Position: "ExOfficial", // Change to "Ex-Official" if preferred
                        };
                    }
                    // Regular members - no changes
                    return member;
                });
                
                setMembers(fetchedMembers);
            }
        } catch (error) {
            console.error("Error fetching term members:", error);
        } finally {
            setInnerLoading(false);
        }
    }, [group.term]);

    useEffect(() => {
        if (isExpanded && members.length === 0) fetchTermMembers();
    }, [isExpanded, fetchTermMembers, members.length]);

    return (
        <div className={`mb-4 overflow-hidden rounded-2xl bg-white transition-all ${isExpanded ? "shadow-xl ring-1 ring-blue-100" : "shadow-sm border border-gray-100"}`}>
            {/* Header / Term Toggle */}
            <div onClick={onToggle} className="flex cursor-pointer items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isLatestTerm ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <FaUserAlt />
                    </div>
                    <div>
                        <h2 className="text-lg font-black uppercase text-gray-900 leading-none">
                            Term {group.term}
                            {isLatestTerm && <span className="ml-2 text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded">ACTIVE</span>}
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Legislative Body</p>
                    </div>
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                    <FaChevronRight className="text-gray-300" />
                </div>
            </div>

            {/* Expanded Content */}
            <div className={`${isExpanded ? "block" : "hidden"} p-6 bg-slate-50/50 border-t border-gray-50`}>
                {innerLoading ? (
                    <div className="text-center py-10 text-[10px] font-black text-gray-400 uppercase animate-pulse">Loading Officials...</div>
                ) : (
                    <div className="space-y-12">
                        
                        {/* REGULAR MEMBERS SECTION - No changes, display as is */}
                        {regularMembers.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-[10px] font-black text-blue-900 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-widest">Sangguniang Members</h3>
                                    <div className="h-[1px] flex-1 bg-blue-100"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {regularMembers.map((m, i) => (
                                        <MemberCard key={m._id || i} member={m} onClick={onMemberClick} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* EX-OFFICIALS SECTION - Only these will show "ExOfficial" */}
                        {exOfficials.length > 0 && (
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">Ex-Officio Members</h3>
                                    <div className="h-[1px] flex-1 bg-emerald-100"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                    {exOfficials.map((m, i) => (
                                        <MemberCard key={m._id || i} member={m} onClick={onMemberClick} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* EMPTY STATE */}
                        {members.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-[10px] font-bold uppercase italic">No records available for this term.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * MAIN PAGE COMPONENT
 */
const SBmember = ({ onBack }) => {
    const { isGroupPublicAuthor, DisplayPublicAuthor, loading, setLoading } = useContext(SbMemberDisplayContext);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    const [activeTermIndex, setActiveTermIndex] = useState(0); 
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            await DisplayPublicAuthor({ search: searchTerm });
            setLoading(false);
        };
        const debounce = setTimeout(fetch, 500);
        return () => clearTimeout(debounce);
    }, [searchTerm, DisplayPublicAuthor, setLoading]);

    console.log("isGroupPublicAuthor", isGroupPublicAuthor);

    useEffect(() => {
        const handleScroll = () => setShowBackToTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (selectedMember) return <OfficialProfileLayout member={selectedMember} onBack={() => setSelectedMember(null)} />;

    return (
        <div className="min-h-screen bg-blue-950 pb-24">
            <BannerImage selection={"SP Members"} />
            <Breadcrumb position={"SP Members"} onBack={onBack} />

            <div className="mx-auto mt-12 max-w-7xl px-6">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
    <h1 className="text-3xl font-bold text-gray-400 uppercase tracking-tight">
        Legislative <span className="text-gray-400">Profiles</span>
    </h1>

    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
        Official Registry of Board Members
    </p>
</div>
                    <div className="relative w-full md:w-80">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input
                            type="text"
                            placeholder="Search name or position..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border-none bg-white py-3 pl-12 shadow-sm ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 placeholder:text-gray-300"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl" />)}
                        </div>
                    ) : (
                        isGroupPublicAuthor?.map((group, index) => (
                            <TermGroup
                                key={index}
                                group={group}
                                isExpanded={activeTermIndex === index}
                                isLatestTerm={index === 0}
                                onToggle={() => setActiveTermIndex(activeTermIndex === index ? null : index)}
                                onMemberClick={setSelectedMember}
                            />
                        ))
                    )}
                </div>
            </div>

            <button 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} 
                className={`fixed bottom-10 right-10 p-4 bg-blue-600 text-white rounded-full shadow-2xl transition-all duration-500 z-50 hover:bg-blue-700 ${showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
            >
                <FaArrowUp />
            </button>
        </div>
    );
};

export default SBmember;