import React from "react";
import MyLogo from "../../../assets/logo-login.png";
import PNPLogo from "../../../assets/PNP.png";
import CoastGuardLogo from "../../../assets/coastguard.png";
import BFP from "../../../assets/BFP.png";

const Sidebar = () => {
    const hotlines = [
        {
            number: "(053) 500-9319",
            name: "Biliran Provincial Hospital (BPH)",
            icon: "🏥",
        },
        {
            number: "0975 189 3951, 0998 585 8072",
            name: "Coast Guard Station Biliran",
            icon: "⚓",
        },
        {
            number: "(053) 500-9546",
            name: "Naval Fire Station",
            icon: "🚒",
        },
        {
            number: "0915 641 9144, 0947 147 3364",
            name: "Biliran Police Provincial Office",
            icon: "👮",
        },
        {
            number: "(053) 500-0091",
            name: "PDRRMO (Provincial Disaster Risk Reduction and Management Office)",
            icon: "🚨",
        },
    ];

    const handleCall = (number) => {
        const cleanNumber = number.replace(/[^\d+]/g, "");
        window.open(`tel:${cleanNumber}`, "_self");
    };

    const headerLogos = [CoastGuardLogo, PNPLogo, MyLogo, BFP];

    return (
        <aside className="w-full bg-gray-300 rounded-2xl">
            {/* Header with Logos */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-4 text-center text-white rounded-t-2xl">
                {/* Overlapping Logos */}
                <div className="mb-4 flex justify-center -space-x-4">
                    {headerLogos.map((logo, i) => (
                        <div
                            key={i}
                            className="h-12 w-12 rounded-full bg-white shadow-lg ring-2 ring-white"
                        >
                            <img
                                src={logo}
                                alt={`Logo ${i + 1}`}
                                className="h-full w-full rounded-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Title */}
                <h2 className="mb-1 text-lg font-bold">Biliran Hotlines</h2>
                <p className="text-xs text-blue-100">
                    Emergency and Essential Services
                </p>
            </div>

            {/* Hotline List */}
            <div className="p-3">
                <div className="mb-3">
                    <h3 className="mb-1 text-sm font-semibold text-white">
                        Emergency Contacts
                    </h3>
                    <p className="text-xs text-white">
                        Tap to call available numbers directly
                    </p>
                </div>

                <div className="space-y-2">
                    {hotlines.map((hotline, index) => (
                        <div
                            key={index}
                            onClick={() => handleCall(hotline.number)}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all duration-200 hover:bg-blue-50"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
                                {hotline.icon}
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs font-semibold text-gray-800">
                                    {hotline.number}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {hotline.name}
                                </p>
                            </div>
                            <div className="text-blue-500">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                    />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;