import React, { useEffect, useState, useCallback } from "react";
import skyImg from "../../../assets/Sky.png";
import mountainImg from "../../../assets/Mountain.png";
import forestImg from "../../../assets/Forest.png";
import logo from "../../../assets/logo-login.png";

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleScroll = useCallback(() => {
        setScrollY(window.scrollY);
    }, []);

    const handleMouseMove = useCallback(
        (e) => {
            if (isMobile) return;

            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 40;
            const y = (clientY / window.innerHeight - 0.5) * 40;
            setMousePosition({ x, y });
        },
        [isMobile],
    );

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);

        if (!isMobile) {
            window.addEventListener("mousemove", handleMouseMove);
        }

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [handleScroll, handleMouseMove, isMobile]);

    const mobileFactor = isMobile ? 0.3 : 1;
    const mouseFactor = isMobile ? 0 : 0.3;

    const parallaxValues = {
        sky: {
            y: scrollY * 0.1 * mobileFactor + mousePosition.y * mouseFactor * 0.1,
            x: mousePosition.x * mouseFactor * 0.1,
        },
        mountain: {
            y: scrollY * 0.3 * mobileFactor + mousePosition.y * mouseFactor * 0.3,
            x: mousePosition.x * mouseFactor * 0.3,
        },
        text: {
            y: scrollY * 0.5 * mobileFactor + mousePosition.y * mouseFactor * 0.5,
            x: mousePosition.x * mouseFactor * 0.5,
        },
        logo: {
            y: scrollY * 0.4 * mobileFactor + mousePosition.y * mouseFactor * 0.4,
            x: mousePosition.x * mouseFactor * 0.4,
        },
        forest: {
            y: scrollY * 0.7 * mobileFactor + mousePosition.y * mouseFactor * 0.7,
            x: mousePosition.x * mouseFactor * 0.7,
        },
    };

    return (
        <div className="relative h-[200vh] w-full overflow-x-hidden bg-[#0b0f0b] font-sans">
            <div className="sticky top-0 h-screen overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${skyImg})`,
                        transform: `translate(${parallaxValues.sky.x}px, ${parallaxValues.sky.y}px)`,
                        transition: isMobile ? "transform 0.3s ease-out" : "transform 0.1s ease-out",
                    }}
                />

                <div
                    className={`absolute left-1/2 z-10 -translate-x-1/2 transition-all duration-[2500ms] ease-out ${isVisible ? "bottom-0 opacity-100" : "bottom-[-10%] opacity-0"}`}
                    style={{
                        transform: `translateX(calc(-50% + ${parallaxValues.mountain.x}px)) translateY(${parallaxValues.mountain.y}px)`,
                    }}
                >
                    <img
                        src={mountainImg}
                        alt="Mountain"
                        className={`h-auto transition-all duration-[2500ms] ease-out ${isVisible ? "scale-105" : "scale-110"}`}
                        style={{
                            height: isMobile ? "100vh" : "130vh",
                            width: "auto",
                            minWidth: isMobile ? "180vw" : "120vw",
                            objectFit: "contain",
                            objectPosition: "bottom center",
                        }}
                    />
                </div>
                <div
                    className="absolute left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                    style={{
                        top: isMobile ? "60%" : "49%",
                        transform: `translateX(calc(-50% + ${parallaxValues.text.x}px)) translateY(calc(-50% + ${parallaxValues.text.y}px))`,
                    }}
                >
                    <div
                        className={`transition-all duration-[2000ms] ease-out ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-[50px] opacity-0"}`}
                        style={{
                            marginBottom: isMobile ? "0.5rem" : "3rem",
                            transform: `translateY(${parallaxValues.logo.y * (isMobile ? 0.1 : 0.3)}px)`,
                        }}
                    >
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-12 w-auto sm:h-20 md:h-24 lg:h-28 xs:h-14"
                            style={{
                                filter: "drop-shadow(0 0 20px rgba(0, 0, 0, 0.7))",
                            }}
                        />
                    </div>
                    <h1
  className={`cubic-bezier(0.16, 1, 0.3, 1) font-bold uppercase text-white 
  drop-shadow-[0_0_60px_rgba(0,0,0,0.9)] transition-all duration-[2000ms]
  ${isVisible ? "translate-y-0 opacity-100" : "translate-y-[100px] opacity-0"}
  ${
    isMobile
      ? "text-xl tracking-[0.15em] xs:text-2xl xs:tracking-[0.2em]"
      : "text-2xl tracking-[0.2em] sm:text-5xl md:text-2xl md:tracking-[0.5em] lg:text-3xl"
  }`}
  style={{
    whiteSpace: isMobile ? "normal" : "nowrap",
    lineHeight: isMobile ? "1.2" : "normal",  
    textAlign: "center",
    marginBottom: isMobile ? "0.75rem" : "1.5rem",
    marginTop: isMobile ? "-0.25rem" : "-1rem",
  }}
>
  Sangguniang Panlalawigan
</h1>

                    <h1
                        className={`cubic-bezier(0.16, 1, 0.3, 1) font-black uppercase text-white drop-shadow-[0_0_60px_rgba(0,0,0,0.9)] transition-all duration-[2000ms] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-[100px] opacity-0"} ${
                            isMobile
                                ? "text-lg tracking-[0.3em] xs:text-xl xs:tracking-[0.4em]"
                                : "text-3xl tracking-[0.5em] sm:text-5xl md:text-6xl md:tracking-[1.2rem] lg:text-[6rem]"
                        }`}
                        style={{
                            whiteSpace: "nowrap",
                            textAlign: "center",
                        }}
                    >
                        Biliran Province
                    </h1>

                    {isMobile && <p className="mt-2 text-sm font-medium text-gray-300 opacity-90 xs:text-base">Explore the Beauty</p>}
                </div>

                <div
                    className="absolute bottom-0 left-0 z-30 w-full bg-no-repeat"
                    style={{
                        backgroundImage: `url(${forestImg})`,
                        height: isMobile ? "25vh" : "35vh",
                        backgroundSize: "100% 100%",
                        backgroundPosition: "bottom center",
                        transform: `translate(${parallaxValues.forest.x}px, ${parallaxValues.forest.y}px)`,
                    }}
                />

                <div
                    className="pointer-events-none absolute bottom-0 left-0 z-40 w-full bg-gradient-to-t from-black via-black/80 to-transparent"
                    style={{ height: isMobile ? "10vh" : "15vh" }}
                />
            </div>

            <div className="h-screen"></div>
        </div>
    );
};

export default Hero;
