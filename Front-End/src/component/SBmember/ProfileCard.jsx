import React, { useState } from "react";
import { EditIcon, BriefcaseIcon, MapMarkerIcon } from "./IconComponents";
import { Mail, Pencil, Trash, Database } from "lucide-react";
import PopupTable from "./PopupTable";

const ProfileCard = ({ member, onDelete, onEdit }) => {
    // Added onEdit prop
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { memberInfo, files = [], count } = member;

    const resolutionCount = files.filter((file) => file.category === "Resolution").length;
    const ordinanceCount = files.filter((file) => file.category === "Ordinance").length;

    const handleCardClick = () => {
        if (count > 0) {
            setIsModalOpen(true);
        }
    };

    console.log("trace", memberInfo);

    const closeModal = () => setIsModalOpen(false);

    const onDeletehandle = () => {
        onDelete(member._id);
    };
    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(member);
    };

    return (
        <>
            <div
                className="w-full cursor-pointer overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800 md:rounded-3xl"
                onClick={handleCardClick}
            >
                <div className="flex flex-col items-stretch md:flex-row">
                    <div className="flex w-full flex-col items-center justify-center bg-blue-50 p-4 dark:bg-blue-900 md:w-1/3">
                        <div className="relative">
                            <img
                                src={memberInfo?.avatar?.url || "https://randomuser.me/api/portraits/men/64.jpg"}
                                alt={memberInfo?.fullName || "Profile"}
                                className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-md sm:h-20 sm:w-20 md:h-24 md:w-24"
                            />
                        </div>
                    </div>

                    <div className="w-full p-3 md:w-2/3 md:p-4 lg:p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h5 className="line-clamp-1 text-lg font-bold text-gray-800 dark:text-gray-100 sm:text-xl md:text-2xl">
                                {memberInfo?.fullName}
                            </h5>
                            <div className="flex gap-2">
                                {/* Edit Button - now calls handleEditClick */}
                                <button
                                    className="flex items-center justify-center rounded-full border border-blue-500 px-2 py-1 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-500 hover:text-white md:px-4 md:text-sm"
                                    onClick={handleEditClick}
                                >
                                    <EditIcon />
                                    <span className="xs:inline hidden">Edit</span>
                                </button>

                                <button
                                    className="flex items-center justify-center rounded-full border border-red-500 px-2 py-1 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white md:px-4 md:text-sm"
                                    onClick={onDeletehandle}
                                >
                                    <Trash />
                                    <span className="xs:inline hidden">Delete</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-1 space-y-1 text-gray-600 dark:text-gray-300 md:mt-2">
                            <p className="flex items-center text-xs dark:text-gray-300 md:text-sm">
                                <BriefcaseIcon />
                                <span className="truncate">{memberInfo?.Position}</span>
                            </p>
                            <p className="flex items-center gap-1 text-xs dark:text-gray-300 md:text-sm">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{memberInfo?.email}</span>
                            </p>
                            <p className="flex items-center text-[10px] text-gray-500 dark:text-gray-400 md:text-xs">
                                <MapMarkerIcon />
                                <span>Government Official</span>
                            </p>
                        </div>

                        <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-600 md:mt-3 md:pt-3">
                            <div className="grid grid-cols-3 gap-1 text-center md:gap-2">
                                <div className="flex flex-col items-center">
                                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-200 md:text-sm">Total Files</h6>
                                    <strong className="text-sm font-extrabold text-gray-900 dark:text-white md:text-lg">{count}</strong>
                                </div>
                                <div className="flex flex-col items-center border-l border-gray-200 dark:border-gray-600">
                                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-200 md:text-sm">Resolution</h6>
                                    <strong className="text-sm font-extrabold text-gray-900 dark:text-white md:text-lg">{resolutionCount}</strong>
                                </div>
                                <div className="flex flex-col items-center border-l border-gray-200 dark:border-gray-600">
                                    <h6 className="text-xs font-semibold text-gray-700 dark:text-gray-200 md:text-sm">Ordinance</h6>
                                    <strong className="text-sm font-extrabold text-gray-900 dark:text-white md:text-lg">{ordinanceCount}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <PopupTable
                isOpen={isModalOpen}
                onClose={closeModal}
                files={files}
                memberInfo={memberInfo}
                count={count}
            />
        </>
    );
};

export default ProfileCard;
