import React from "react";
import { BriefcaseIcon, MapMarkerIcon } from "./IconComponents";
import { User, Pencil, Trash } from "lucide-react";

const ProfileCard = ({ member, onDelete, onEdit }) => {
    const { memberInfo, files = [], count } = member;
    const getAvatarUrl = () => {
        // Check sa root level ng member (para sa Ex-Official)
        if (member.avatar?.url) {
            return member.avatar.url;
        }
        // Check kung string ang avatar sa root level
        if (member.avatar && typeof member.avatar === 'string') {
            return member.avatar;
        }
        // Check sa memberInfo (para sa regular members)
        if (memberInfo?.avatar?.url) {
            return memberInfo.avatar.url;
        }
        if (memberInfo?.avatar && typeof memberInfo.avatar === 'string') {
            return memberInfo.avatar;
        }
        // Check sa avatarUrl na ginawa natin sa normalization
        if (member.avatarUrl) {
            return member.avatarUrl;
        }
        // Default avatar kung wala
        return "https://randomuser.me/api/portraits/men/64.jpg";
    };

    // Helper function para makuha ang position
    const getPosition = () => {
        let basePosition = "";
        let subPosition = "";
        
        // Kunin ang base position
        if (member.Position) basePosition = member.Position;
        else if (memberInfo?.Position) basePosition = memberInfo.Position;
        else if (member.position) basePosition = member.position;
        else basePosition = "Board Member";
        
        // Kunin ang subPosition
        if (member.subPosition) subPosition = member.subPosition;
        else if (memberInfo?.subPosition) subPosition = memberInfo.subPosition;
        
        // I-concatenate kung may subPosition
        if (subPosition && subPosition.trim() !== "") {
            return `${basePosition} - ${subPosition}`;
        }
        
        return basePosition;
    };

    // Helper function para makuha ang district
    const getDistrict = () => {
        if (member.district) return member.district;
        if (memberInfo?.district) return memberInfo.district;
        return "";
    };

    // Helper function para makuha ang full name
    const getFullName = () => {
        if (member.fullName) return member.fullName;
        if (memberInfo?.fullName) return memberInfo.fullName;
        return `${member.first_name || ''} ${member.last_name || ''}`.trim() || "Unknown";
    };

    // Kalkulasyon para sa mga counts
    const resolutionCount = files.filter((file) => file.category === "Resolution").length;
    const ordinanceCount = files.filter((file) => file.category === "Ordinance").length;

    const onDeletehandle = (e) => {
        e.stopPropagation(); // Iwasan ang anumang bubble events
        onDelete(member._id || member.memberInfo?._id);
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(member);
    };

    const avatarUrl = getAvatarUrl();
    const position = getPosition();
    const district = getDistrict();
    const fullName = getFullName();

    return (
        <div className="relative w-full overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800 md:rounded-3xl">
            {/* Action buttons positioned at top-right */}
            <div className="absolute right-3 top-3 z-10 flex gap-2">
                <button
                    className="flex items-center justify-center rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
                    onClick={handleEditClick}
                    title="Edit"
                >
                    <Pencil size={16} />
                </button>
                <button
                    className="flex items-center justify-center rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                    onClick={onDeletehandle}
                    title="Delete"
                >
                    <Trash size={16} />
                </button>
            </div>

            <div className="flex flex-col items-stretch md:flex-row">
                {/* Avatar Section */}
                <div className="flex w-full flex-col items-center justify-center bg-blue-50 p-4 dark:bg-blue-900 md:w-1/3">
                    <div className="relative">
                        <img
                            src={avatarUrl}
                            alt={fullName || "Profile"}
                            className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-md sm:h-20 sm:w-20 md:h-24 md:w-24"
                            onError={(e) => {
                                // Fallback kung hindi mag-load ang image
                                e.target.src = "https://randomuser.me/api/portraits/men/64.jpg";
                            }}
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="w-full p-3 md:w-2/3 md:p-4 lg:p-6">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h5 className="line-clamp-1 text-lg font-bold text-gray-800 dark:text-gray-100 sm:text-xl">
                            {fullName}
                        </h5>
                    </div>

                    <div className="mt-1 space-y-1 text-gray-600 dark:text-gray-300 md:mt-2">
                        <p className="flex items-center text-xs dark:text-gray-300 md:text-sm">
                            <BriefcaseIcon />
                            <span className="ml-1 truncate">{position}</span>
                        </p>
                        
                        {district && district.trim() !== "" && (
                            <p className="flex items-center gap-1 text-xs dark:text-gray-300 md:text-sm">
                                <User className="h-4 w-4" />
                                <span className="truncate">{district}</span>
                            </p>
                        )}

                        <p className="flex items-center text-[10px] text-gray-500 dark:text-gray-400 md:text-xs">
                            <MapMarkerIcon />
                            <span className="ml-1">Government Official</span>
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-600 md:mt-3 md:pt-3">
                        <div className="grid grid-cols-3 gap-1 text-center md:gap-2">
                            <div className="flex flex-col items-center">
                                <h6 className="text-[10px] font-semibold text-gray-700 dark:text-gray-200 md:text-sm">Total Files</h6>
                                <strong className="text-sm font-extrabold text-gray-900 dark:text-white md:text-lg">{count || 0}</strong>
                            </div>
                            <div className="flex flex-col items-center border-l border-gray-200 dark:border-gray-600">
                                <h6 className="text-[10px] font-semibold text-gray-700 dark:text-gray-200 md:text-sm">Resolution</h6>
                                <strong className="text-sm font-extrabold text-gray-900 dark:text-white md:text-lg">{resolutionCount}</strong>
                            </div>
                            <div className="flex flex-col items-center border-l border-gray-200 dark:border-gray-600">
                                <h6 className="text-[10px] font-semibold text-gray-700 dark:text-gray-200 md:text-sm">Ordinance</h6>
                                <strong className="text-sm font-extrabold text-gray-900 dark:text-white md:text-lg">{ordinanceCount}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;