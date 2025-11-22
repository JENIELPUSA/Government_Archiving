import React from 'react';

const MapSection = () => {
  return (
    <section className="relative w-full h-[500px] bg-blue-50">
      {/* Map Card */}
      <div className="group overflow-hidden w-full h-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.8008751617217!2d124.4071681108963!3d11.56612798858736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a78ca4a4ed2563%3A0xdf64c9ca39745dc9!2sBiliran%20Provincial%20Capitol-Building!5e0!3m2!1sen!2sph!4v1756898261063!5m2!1sen!2sph"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          title="Biliran Provincial Capitol"
          className="w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Info Card */}
      <div className="absolute top-6 left-6 bg-white bg-opacity-90 p-6 rounded-2xl shadow-xl max-w-xs z-20 border-l-4 border-red-600">
        <h3 className="text-xl font-bold text-blue-900 mb-2">Visit Us</h3>
        <p className="text-gray-700 text-sm mb-4">
          Biliran Provincial Capitol<br />
          Naval, Biliran<br />
          Philippines 6543
        </p>
        <a
          href="https://goo.gl/maps/YourMapLink"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1"
        >
          Get Directions <span>&rarr;</span>
        </a>
      </div>
    </section>
  );
};

export default MapSection;
