import React, { useEffect, useState, useCallback } from "react";
import skyImg from "../../../assets/Sky.png";
import mountainImg from "../../../assets/Mountain.png";
import forestImg from "../../../assets/Forest.png";

const Hero = ({ formData }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleScroll = useCallback(() => setScrollY(window.scrollY), []);
    const handleMouseMove = useCallback((e) => {
        if (isMobile) return;
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 30;
        const y = (clientY / window.innerHeight - 0.5) * 30;
        setMousePosition({ x, y });
    }, [isMobile]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        if (!isMobile) window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [handleScroll, handleMouseMove, isMobile]);

    const shadowProgress = Math.min(scrollY / 600, 1);
    const dynamicShadow = {
        filter: `drop-shadow(0px ${10 * shadowProgress}px ${30 * shadowProgress}px rgba(0,0,0,${0.4 + shadowProgress * 0.6}))`
    };

    // OPACITY SCROLL EFFECT
    const opacityProgress = Math.min(scrollY / 400, 1);
    const textContainerOpacity = Math.max(1 - opacityProgress, 0);

    const mobileFactor = isMobile ? 0.3 : 1;
    const mouseFactor = isMobile ? 0 : 0.3;

    // FIXED: Subtle parallax values - all layers move at similar speeds
    const parallaxValues = {
        sky: { y: scrollY * 0.03 * mobileFactor + mousePosition.y * mouseFactor * 0.03, x: mousePosition.x * mouseFactor * 0.03 },
        mountain: { y: scrollY * 0.05 * mobileFactor + mousePosition.y * mouseFactor * 0.05, x: mousePosition.x * mouseFactor * 0.05 },
        text: { y: scrollY * 0.07 * mobileFactor + mousePosition.y * mouseFactor * 0.07, x: mousePosition.x * mouseFactor * 0.07 },
        forest: { y: scrollY * 0.09 * mobileFactor + mousePosition.y * mouseFactor * 0.09, x: mousePosition.x * mouseFactor * 0.09 },
    };

    // LOGIC PARA SA AUTO-RESIZE NG TEXT LAMANG
    const titleText = formData?.title || "Default Title";
    const subtitleText = formData?.subtitle || "Default Subtitle";

    // Dynamic sizing para sa Title (One line)
    const getTitleFontSize = () => {
        if (titleText.length > 20) return "clamp(0.6rem, 2vw, 1.2rem)";
        if (titleText.length > 12) return "clamp(0.8rem, 2.5vw, 1.8rem)";
        return "clamp(1rem, 3.5vw, 2.5rem)";
    };

    // Dynamic sizing para sa Subtitle (One line)
    const getSubtitleFontSize = () => {
        if (subtitleText.length > 15) return "clamp(1.2rem, 6vw, 5rem)";
        if (subtitleText.length > 10) return "clamp(1.8rem, 8vw, 7rem)";
        return "clamp(2.5rem, 11vw, 9.5rem)";
    };

    return (
        <div className="relative h-[200vh] w-full overflow-x-hidden bg-[#0b0f0b] font-sans">
            <div className="sticky top-0 h-screen overflow-hidden">
                
                {/* Sky Background */}
                <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${skyImg})`, transform: `translate(${parallaxValues.sky.x}px, ${parallaxValues.sky.y}px) scale(1.1)` }} />

                {/* Mountain Layer */}
                <div className={`absolute left-1/2 z-10 -translate-x-1/2 transition-all duration-[2500ms] ease-out ${isVisible ? "bottom-[20%] opacity-100" : "bottom-[-10%] opacity-0"}`}
                    style={{ transform: `translateX(calc(-50% + ${parallaxValues.mountain.x}px)) translateY(${parallaxValues.mountain.y}px)` }}>
                    <img src={mountainImg} alt="Mountain" className="h-auto select-none" style={{ height: isMobile ? "90vh" : "120vh", width: "auto", minWidth: isMobile ? "180vw" : "110vw", objectFit: "contain", objectPosition: "bottom center" }} />
                </div>

                {/* Text Container with Opacity Scroll Effect */}
                <div
                    className="absolute left-1/2 z-20 flex -translate-x-1/2 flex-col items-center w-[95%] select-none pointer-events-none"
                    style={{
                        top: isMobile ? "45%" : "50%",
                        transition: "transform 3000ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease",
                        transform: isVisible
                            ? `translate(calc(-50% + ${parallaxValues.text.x}px), calc(-50% + ${parallaxValues.text.y}px))`
                            : `translate(-50%, 600px)`,
                        opacity: isVisible ? textContainerOpacity : 0,
                        ...dynamicShadow
                    }}
                >
                    {/* TITLE */}
                    <h1
                        className="font-bold uppercase text-white w-full text-center whitespace-nowrap"
                        style={{
                            marginBottom: "0.25rem",
                            lineHeight: "1.2",
                            fontSize: getTitleFontSize(),
                            letterSpacing: titleText.length > 15 ? "0.1em" : "0.3em",
                            transition: "font-size 0.3s ease"
                        }}
                    >
                        {titleText}
                    </h1>

                    {/* SUBTITLE */}
                    <h1
                        className="font-black uppercase text-white w-full text-center whitespace-nowrap"
                        style={{ 
                            lineHeight: "0.9",
                            fontSize: getSubtitleFontSize(),
                            letterSpacing: isMobile ? "0.01em" : "0.05em",
                            transition: "font-size 0.3s ease"
                        }}
                    >
                        {subtitleText}
                    </h1>
                </div>

                {/* Forest Layer */}
                <div className="absolute bottom-0 left-0 z-30 w-full bg-no-repeat"
                    style={{ backgroundImage: `url(${forestImg})`, height: isMobile ? "35vh" : "40vh", backgroundSize: "100% 100%", backgroundPosition: "bottom center", transform: `translate(${parallaxValues.forest.x}px, ${parallaxValues.forest.y}px) scale(1.05)` }} />

                {/* Gradient Overlay */}
                <div className="pointer-events-none absolute bottom-0 left-0 z-40 w-full bg-gradient-to-t from-black via-black/80 to-transparent"
                    style={{ height: isMobile ? "12vh" : "18vh" }} />
            </div>

            <div className="h-screen bg-black"></div>
        </div>
    );
};

export default Hero;