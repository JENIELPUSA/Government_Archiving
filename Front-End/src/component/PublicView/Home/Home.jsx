import React, { useState, useEffect, useContext, useRef } from "react";
import { ChevronLeft, ChevronRight, FileText, Calendar, User, Tag, ArrowUp } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence } from "framer-motion";
import { NewsDisplayContext } from "../../../contexts/NewsContext/NewsContext";
import { FilesDisplayContext } from "../../../contexts/FileContext/FileContext";
import defaultCover from "../../../../src/assets/billpicture.jpg";
import backgroundImage from "../../../../src/assets/capitol.png";
import NewsandLatest from "../NewandInformation/NewsandLatest";
import logo from "../../../../src/assets/logo-login.png";
import PDFview from "../PDFview";
import AboutUsPage from "../AboutUs";
import Transparency from "../../../../src/assets/Transparency.svg";
import BagongPilipinas from "../../../../src/assets/bagongpilipinas.png";
import Hotline from "../NewandInformation/Hotline";
import LatestBills from "../LatestBill";
import NewsContent from "../NewandInformation/NewsContent";
import Recentpost from "../NewandInformation/Recentpost"

// Scroll to Top button component
const ScrollToTop = () => {
    const { scrollYProgress } = useScroll();
    const scrollY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = scrollY.on("change", (latest) => {
            setVisible(latest > 0.2);
        });

        return () => unsubscribe();
    }, [scrollY]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <motion.button
            className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-700 md:bottom-8 md:right-8 md:h-12 md:w-12"
            onClick={scrollToTop}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
                opacity: visible ? 1 : 0,
                scale: visible ? 1 : 0.5,
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <ArrowUp
                size={16}
                className="md:size-5"
            />
            <motion.div
                className="absolute inset-0 -z-10 rounded-full bg-blue-800"
                style={{
                    scale: scrollY,
                }}
            />
        </motion.button>
    );
};

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            when: "beforeChildren",
        },
    },
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

const Home = ({ aboutUsRef }) => {
    const [selectedNews, setSelectedNews] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const { isLatestBill } = useContext(FilesDisplayContext);
    const { pictures,loading,setLoading } = useContext(NewsDisplayContext);

    // New: Create a ref for the News and Latest section
    const newsAndLatestRef = useRef(null);

    const heroRef = useRef(null);
    const { scrollYProgress: heroScrollY } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"],
    });

    const y = useTransform(heroScrollY, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(heroScrollY, [0, 0.5], [1, 0]);

    const newsItems = pictures.filter((item) => item.category === "Carousel");
    const documentsummary = pictures.filter((item) => item.category === "Documentation");

    const [currentIndex, setCurrentIndex] = useState(0);
    const [spCarouselIndex, setSPCarouselIndex] = useState(0);
    const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);
    const [isHoveringSPCarousel, setIsHoveringSPCarousel] = useState(false);
    // Ref for scroll-triggered animations
    const featuredRef = useRef(null);
    const billsRef = useRef(null);
    const servicesRef = useRef(null);

    // Check if elements are in view
    const featuredInView = useInView(featuredRef, { once: true, margin: "-20% 0px" });
    const servicesInView = useInView(servicesRef, { once: true, margin: "-10% 0px" });

    const handleViewFile = (fileId, fileData) => {
        setSelectedFile({ fileId, fileData });
    };

    const handleViewNews = (news) => {
        setSelectedNews(news);
    };

    // New: Function to go back from NewsContent and scroll to the NewsandLatest section
    const handleBackFromNews = () => {
        setSelectedNews(null);
        if (newsAndLatestRef.current) {
            newsAndLatestRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (newsItems.length === 0 ? 0 : (prevIndex + 1) % newsItems.length));
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (newsItems.length === 0 ? 0 : (prevIndex - 1 + newsItems.length) % newsItems.length));
    };

    const nextSPSlide = () => {
        setSPCarouselIndex((prevIndex) => (prevIndex + 1) % documentsummary.length);
    };

    const prevSPSlide = () => {
        setSPCarouselIndex((prevIndex) => (prevIndex - 1 + documentsummary.length) % documentsummary.length);
    };

    useEffect(() => {
        if (isHoveringCarousel || newsItems.length === 0) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, [isHoveringCarousel, newsItems.length]);

    useEffect(() => {
        if (isHoveringSPCarousel) return;

        const interval = setInterval(() => {
            nextSPSlide();
        }, 6000);

        return () => clearInterval(interval);
    }, [isHoveringSPCarousel]);

    if (selectedFile) {
        return (
            <PDFview
                fileId={selectedFile.fileId}
                fileData={selectedFile.fileData}
            />
        );
    }

    if (selectedNews) {
        // Update: Pass the handleBackFromNews function to the onBack prop
        return <NewsContent news={selectedNews} onBack={handleBackFromNews} />;
    }

    const currentSPSlide = documentsummary[spCarouselIndex];

    // Data for Government Services section
    const governmentServices = [
        {
            icon: FileText,
            title: "Documents",
            desc: "Official forms and publications",
            color: "from-blue-500 to-blue-600",
        },
        {
            icon: Calendar,
            title: "Events",
            desc: "Government events and meetings",
            color: "from-green-500 to-green-600",
        },
        {
            icon: User,
            title: "Officials",
            desc: "Government representatives",
            color: "from-purple-500 to-purple-600",
        },
        {
            icon: Tag,
            title: "Services",
            desc: "Public services and programs",
            color: "from-orange-500 to-orange-600",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-sans text-slate-800 antialiased">
            {/* Loading Overlay */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            transition: { duration: 0.5 },
                        }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500"
                    >
                        <motion.div
                            initial={{ scale: 1 }}
                            exit={{
                                scale: 2,
                                opacity: 0,
                                transition: {
                                    duration: 1,
                                    ease: "easeOut",
                                },
                            }}
                        >
                            <motion.img
                                src={logo}
                                alt="Provincial Government Logo"
                                className="h-40 w-40 opacity-95 drop-shadow-2xl md:h-60 md:w-60"
                                initial={{ rotateY: 0 }}
                                animate={{ rotateY: 360 }}
                                transition={{
                                    duration: 2,
                                    ease: "linear",
                                    repeat: Infinity,
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scroll to top button */}
            <ScrollToTop />

            {/* Hero Section with Parallax */}
            <motion.section
                ref={heroRef}
                className="relative flex h-screen items-center justify-center overflow-hidden"
                style={{
                    backgroundImage: `linear-gradient(135deg, rgba(30, 64, 175, 0.85), rgba(55, 48, 163, 0.8)), url(${backgroundImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundAttachment: "fixed",
                }}
            >
                <motion.div
                    style={{ y, opacity }}
                    className="absolute inset-0"
                />
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 px-4 text-center text-white"
                >
                    <motion.img
                        src={logo}
                        alt="Provincial Government Logo"
                        className="mx-auto mb-6 h-40 w-40 opacity-95 drop-shadow-2xl md:mb-8 md:h-60 md:w-60"
                        initial={loading ? { opacity: 0, scale: 2 } : { opacity: 1, scale: 1 }}
                        animate={loading ? { opacity: 0, scale: 2 } : { opacity: 1, scale: 1 }}
                        transition={{
                            duration: 1,
                            delay: 0.5,
                            ease: "easeOut",
                        }}
                    />
                    <h1 className="mb-4 text-3xl font-bold drop-shadow-lg md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl">Provincial Government</h1>
                    <p className="mx-auto max-w-2xl text-lg text-blue-100 drop-shadow-md md:text-xl lg:text-2xl">
                        Serving the community with integrity and dedication
                    </p>
                </motion.div>
            </motion.section>

            {/* Quote Section */}
            <motion.div
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-red-700 to-blue-600 text-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={fadeIn}
            >
                <div className="px-6 py-12 text-center md:px-8 md:py-16">
                    <motion.div
                        className="mx-auto max-w-6xl"
                        variants={fadeInUp}
                    >
                        <h2 className="mb-6 font-serif text-xl italic leading-relaxed md:mb-8 md:text-3xl lg:text-4xl xl:text-5xl">
                            "Together as one province, we commit to serve with integrity and unity, building a future where every community thrives in
                            progress and peace."
                        </h2>
                    </motion.div>
                </div>
            </motion.div>

            {/* Announcements and Hotlines Section */}
            <section
                ref={featuredRef}
                className="container mx-auto mt-6 px-4 sm:px-6 lg:px-8"
                id="news"
            >
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                    variants={staggerContainer}
                    className="grid lg:grid-cols-3"
                >
                    {/* Logos Box & Hotline - 1/3 width on desktop, full width on mobile */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col space-y-4 lg:col-span-1"
                    >
                        {/* Logo 1 */}
                        <div className="flex items-center justify-center rounded-xl bg-white p-4 shadow-md">
                            <img
                                src={BagongPilipinas}
                                alt="Bagong Pilipinas"
                                className="h-32 object-contain md:h-40"
                            />
                        </div>

                        {/* Logo 2 */}
                        <div className="flex items-center justify-center rounded-xl bg-white p-4 shadow-md">
                            <img
                                src={Transparency}
                                alt="Transparency"
                                className="h-32 object-contain md:h-40"
                            />
                        </div>

                        {/* Hotline */}
                        <div className="flex items-center justify-center rounded-xl bg-white p-4 shadow-md">
                            <Hotline />
                        </div>

{/* Hotline */}
                        <div className="flex items-center justify-center ">
                            <Recentpost />
                        </div>
                    </motion.div>

                    {/* News and Latest - 2/3 width on desktop, full width on mobile */}
                    <motion.div
                        variants={fadeInUp}
                        className="lg:col-span-2"
                    >
                        <LatestBills
                            onFileView={handleViewFile}
                            loading={loading}
                        />
                        {/* Updated: Add the ref to the NewsandLatest component */}
                        <NewsandLatest
                            ref={newsAndLatestRef}
                            onNewsView={handleViewNews}
                            loading={loading}
                        />


                    </motion.div>
                </motion.div>
            </section>

            {/* About Us Section */}
            <section
                ref={aboutUsRef}
                id="about-us"
                className="min-h-screen bg-white"
            >
                <AboutUsPage />
            </section>

            {/* Government Services Section */}
            <section
                ref={servicesRef}
                className="bg-white py-12 md:py-20"
                id="services"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        animate={servicesInView ? "visible" : "hidden"}
                        variants={fadeInUp}
                        className="mb-8 text-center md:mb-12"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl lg:text-4xl">Government Services</h2>
                        <p className="mt-2 text-slate-600 md:mt-4 md:text-lg">Access our services and resources</p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                        {governmentServices.map((service, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                custom={index}
                                initial="hidden"
                                animate={servicesInView ? "visible" : "hidden"}
                                whileHover={{ y: -8 }}
                                className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50 p-4 text-center shadow-md transition-all duration-300 hover:border-blue-200 hover:shadow-lg md:p-6"
                            >
                                <div
                                    className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${service.color} text-white shadow-lg md:mb-4 md:h-16 md:w-16`}
                                >
                                    <service.icon className="h-6 w-6 md:h-8 md:w-8" />
                                </div>
                                <h3 className="mb-1 text-lg font-semibold text-slate-900 md:mb-2 md:text-xl">{service.title}</h3>
                                <p className="text-sm text-slate-600 md:text-base">{service.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

// Update: Add forwardRef to the Home component so it can receive a ref from its parent
const HomeWithRef = React.forwardRef(Home);
export default HomeWithRef;