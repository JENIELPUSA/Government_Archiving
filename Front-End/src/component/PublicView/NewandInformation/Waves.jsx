import React from 'react';

const Waves = () => {
    return (
        <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-30 transform skew-y-6 -translate-y-1/2 z-0">
            <div className="absolute bottom-0 left-0 w-full h-full bg-blue-600 opacity-40 transform skew-y-12 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-red-600 opacity-40 transform -skew-y-6 translate-y-1/6"></div>
        </div>
    );
};

export default Waves;