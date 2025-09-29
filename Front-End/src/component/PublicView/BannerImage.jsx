import React from "react";

const BannerImage = ({ selection }) => {
  // Siguraduhing hindi undefined
  const displayText = selection || "";

  return (
    <div
      className="relative w-full h-[500px] bg-cover bg-center"
      style={{ backgroundImage: "url('/images/capitol.png')" }}
    >
      {displayText && (
        <div
          className="absolute bottom-12 left-1/4 text-white font-extrabold rounded px-8 py-6 text-4xl first-letter:text-8xl first-letter:uppercase"
        >
          {displayText}
        </div>
      )}
    </div>
  );
};

export default BannerImage;
