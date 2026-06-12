import React, { useEffect, useState } from "react";

// SUB-COMPONENT: Light UI Basketball Score Flip Card na may MAS MALINAW na Background User Icon
const FlipCard = ({ targetValue, onCountComplete }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [animate, setAnimate] = useState(false);
    const [hasCompleted, setHasCompleted] = useState(false);

    useEffect(() => {
        if (hasCompleted) return;

        const interval = setInterval(() => {
            setDisplayValue(prev => {
                const newValue = prev + 1;
                if (newValue >= targetValue) {
                    clearInterval(interval);
                    setHasCompleted(true);
                    if (onCountComplete) {
                        onCountComplete();
                    }
                    return targetValue;
                }
                setAnimate(true);
                return newValue;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [targetValue, onCountComplete, hasCompleted]);

    const handleAnimationEnd = () => {
        setAnimate(false);
    };

    return (
        <div className="relative flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-b-4 border-b-blue-500 w-24 h-32 md:w-32 md:h-40 text-center font-mono overflow-hidden select-none">
            {/* Label */}
            <span className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 z-10">
                Visitors
            </span>
            
            {/* Number Container */}
            <div className="relative w-full flex-1 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 text-4xl md:text-6xl font-black text-blue-600 overflow-hidden">
                
                {/* MAS MALINAW NA BACKGROUND USER ICON */}
                <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none z-0">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" /* Mas kapal na linya para mas malinaw */
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-16 h-16 md:w-24 md:h-24 text-blue-300" /* Light blue para kumapit sa theme */
                    >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>

                {/* Gitnang Guhit ng Flip Card */}
                <div className="absolute w-full h-[1px] bg-slate-300 top-1/2 left-0 z-10 opacity-70" />
                
                {/* Display Value */}
                <span 
                    onAnimationEnd={handleAnimationEnd} 
                    className={`inline-block transform ${animate ? 'animate-flip' : ''} drop-shadow-sm z-20`}
                >
                    {String(displayValue).padStart(2, '0')}
                </span>
            </div>
        </div>
    );
};

export default FlipCard;