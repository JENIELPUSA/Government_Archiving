import React from "react";

const BannerImage = ({ selection }) => {
  // Mapping ng selection para sa display
  const displayText = {
    Board_Member: "Board Member",
    Vice_Governor: "Vice Governor",
  }[selection] || selection || ""; // default sa original o empty string

  console.log("displayText", displayText);

  return (
    <div
      className="relative w-full h-64 sm:h-[500px] bg-cover bg-center"
      style={{ backgroundImage: "url('/images/capitol.png')" }}
    >
      {displayText && (
        <div
          className="absolute bottom-8 sm:bottom-12 left-1/4 transform -translate-x-1/2 text-center text-white font-extrabold rounded px-4 py-2 sm:px-8 sm:py-6 w-full max-w-3xl text-xl sm:text-4xl first-letter:text-5xl sm:first-letter:text-8xl first-letter:uppercase"
        >
          {displayText}
        </div>
      )}
    </div>
  );
};

export default BannerImage;
