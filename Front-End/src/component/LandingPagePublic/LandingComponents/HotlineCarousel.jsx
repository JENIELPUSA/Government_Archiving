import React from "react";

const HotlineCarousel = () => {
  const hotlines = [
    { id: 1, name: "PNP", number: "0915-641-9144, 0947-147-3364", description: "Philippine National Police" },
    { id: 2, name: "BFP", number: "(053) 500-9546", description: "Bureau of Fire Protection" },
    { id: 3, name: "PROVINCIAL HOSPITAL", number: "(053)500-9319", description: "Emergency Medical Services" },
    { id: 5, name: "COAST GUARD", number: "0975 189 3951", description: "Philippine Coast Guard" },
    { id: 6, name: "BILECO", number: "0905 255 9119", description: "Biliran Electric Cooperative" },
    { id: 7, name: "PROVINCIAL DISASTER", number: "0961-215-2797", description: "Disaster Risk Reduction and Management" },
        { id: 8, name: "PDRRMO ", number: "(053) 500-0091", description: "Provincial Disaster Risk Reduction and Management Office" },
  ];

  return (
    <div className="relative z-20 w-full overflow-hidden border-t-4 border-red-600 bg-blue-950 py-3">
      <div className="flex animate-marquee space-x-4">
        {[...hotlines, ...hotlines].map((hotline, index) => (
          <div
            key={`${hotline.id}-${index}`}
            className="flex-shrink-0 transform rounded-md bg-white/10 px-3 py-2 text-center shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white/20"
          >
            <h3 className="text-sm font-bold text-white drop-shadow">{hotline.name}</h3>
            <div className="my-1 h-0.5 w-8 bg-yellow-400 mx-auto"></div>
            <p className="text-lg font-black text-yellow-300 tracking-wide drop-shadow">{hotline.number}</p>
            <p className="text-[10px] text-blue-100 font-medium max-w-[140px]">{hotline.description}</p>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h2 className="text-xl font-black text-white mb-1 drop-shadow-lg">🚨 BILIRAN EMERGENCY HOTLINES</h2>
        <p className="text-yellow-200 font-semibold text-xs drop-shadow-md">I-save ang mga numerong ito! Save These Numbers!</p>
      </div>

      <style jsx>{`
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default HotlineCarousel;
