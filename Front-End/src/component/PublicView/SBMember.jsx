import React, { useState, useEffect, useContext } from "react";
import { SbMemberDisplayContext } from "../../contexts/SbContext/SbContext";

const MemberCard = ({ member, openModal }) => (
    <div className="flex items-start bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <img
            src={member.memberInfo?.avatar?.url  || "https://randomuser.me/api/portraits/men/64.jpg"}
            alt="Profile Picture"
            className="mr-4 h-44 w-28 object-cover"
        />
        <div className="flex-grow">
            <h2 className="mb-1 text-lg font-bold text-gray-900">
                {member.memberInfo?.first_name} {member.memberInfo?.last_name}
            </h2>
            <p className="text-sm font-medium text-gray-600">{member.district || member.memberInfo?.district}</p>
            <p className="text-sm font-medium capitalize text-gray-600">{member.memberInfo.Position || member.memberInfo.position}</p>

            <button
                onClick={() => openModal(member)}
                className="mt-2 inline-block text-sm font-bold text-blue-700 hover:underline focus:outline-none"
            >
                View Profile
            </button>
        </div>
    </div>
);

const MemberModal = ({ member, closeModal }) => {
    if (!member) return null;

    const district = member.district || member.memberInfo?.district;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-h-screen w-11/12 max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl md:p-8">
                <div className="flex justify-end">
                    <button
                        onClick={closeModal}
                        className="text-2xl font-bold text-gray-500 hover:text-gray-900"
                    >
                        &times;
                    </button>
                </div>
                <div className="mt-4 flex flex-col items-start space-y-6 md:flex-row md:space-x-6 md:space-y-0">
                    <div className="w-full flex-shrink-0 md:w-1/3">
                        <img
                            src={(member.memberInfo?.avatar?.url  || member.memberInfo?.avatar?.url || "https://randomuser.me/api/portraits/men/64.jpg").replace(
                                "112x176",
                                "300x450",
                            )}
                            alt="Member Profile Picture"
                            className="h-auto w-full object-cover shadow-md"
                        />
                    </div>
                    <div className="w-full md:w-2/3">
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                            {member.memberInfo?.first_name} {member.memberInfo?.last_name}
                        </h2>
                        <div className="mb-4 text-base font-medium text-gray-600">
                            <strong className="capitalize">{member.memberInfo.Position || member.memberInfo.Position}</strong> <br />
                            {district && <span>District {district}</span>} <br />
                            <br />
                            <span>{member.memberInfo.detailInfo}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-4 text-center md:grid-cols-3">
                            <div className="rounded-lg bg-gray-100 p-4">
                                <p className="text-3xl font-bold text-blue-600">{member.count || 0}</p>
                                <p className="text-sm font-medium text-gray-500">Total na Batas</p>
                            </div>
                            <div className="rounded-lg bg-gray-100 p-4">
                                <p className="text-3xl font-bold text-blue-600">{member.resolutionCount || 0}</p>
                                <p className="text-sm font-medium text-gray-500">Total na Resolution</p>
                            </div>
                            <div className="rounded-lg bg-gray-100 p-4">
                                <p className="text-3xl font-bold text-blue-600">{member.ordinanceCount || 0}</p>
                                <p className="text-sm font-medium text-gray-500">Total na Ordinance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const { isGroupFiles } = useContext(SbMemberDisplayContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    const openModal = (member) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
    };

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // Filter and search functionality
    const filteredisGroupFiles =
        isGroupFiles?.filter((member) => {
            const name = `${member.memberInfo?.first_name || ""} ${member.memberInfo?.last_name || ""}`.toLowerCase();
            const matchesSearch = name.includes(searchTerm.toLowerCase());

            const district = member.district || member.memberInfo?.district || "";
            const matchesFilter = filterType === "all" || (filterType === "district" && district) || (filterType === "party-list" && !district);

            return matchesSearch && matchesFilter;
        }) || [];

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="mx-auto max-w-7xl bg-white p-6 shadow-lg md:p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">List Of SB Member</h1>
                    <p className="mt-1 text-base font-bold text-red-500 md:text-lg">Total Member: ({filteredisGroupFiles.length})</p>
                </header>

                <div className="mb-6 flex flex-col items-center justify-between space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                    <div className="w-full md:w-3/5">
                        <input
                            type="text"
                            placeholder="Search Name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative w-full md:w-2/5 lg:w-1/4">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full appearance-none rounded-md border border-gray-300 bg-white p-3 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">LAHAT</option>
                            <option value="party-list">PARTY-LIST</option>
                            <option value="district">DISTRITO</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg
                                className="h-4 w-4 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {filteredisGroupFiles.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">No Data</div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredisGroupFiles.map((member) => (
                            <MemberCard
                                key={member._id || member.id}
                                member={member}
                                openModal={openModal}
                            />
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <MemberModal
                    member={selectedMember}
                    closeModal={closeModal}
                />
            )}

            <button
                id="backToTopBtn"
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 rounded-full bg-blue-500 p-3 text-white shadow-lg transition-opacity duration-300 ${
                    showBackToTop ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-label="Bumalik sa taas"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                </svg>
            </button>
        </div>
    );
};

export default App;
