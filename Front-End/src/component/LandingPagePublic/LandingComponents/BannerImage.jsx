import React from "react";

const BannerImage = ({ selection }) => {
  // Mapping ng selection para sa display
  const displayText = {
    Board_Member: "BOARD MEMBER",
    Vice_Governor: "VICE GOVERNOR",
  }[selection]?.toUpperCase() || selection?.toUpperCase() || "";

  return (
    <div
      className="relative w-full h-72 sm:h-[550px] bg-cover bg-center"
      style={{ backgroundImage: "url('/images/banner2.jpg')" }}
    >
      {displayText && (
        <div
          className="
            absolute 
            bottom-10 sm:bottom-14
            left-1/2 
            transform -translate-x-1/2 
            text-center 
            text-white 
            font-black 
            uppercase
            tracking-wide
            drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]
            px-6 py-3 sm:px-8 sm:py-5
            w-full
            text-3xl
            sm:text-5xl
            md:text-6xl
            lg:text-7xl
          "
        >
          {displayText}
        </div>
      )}
    </div>
  );
};

export default BannerImage;